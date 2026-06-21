import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

/**
 * Yo'lda Dispatcher uchun alohida WebSocket namespace.
 * Mavjud `AppGateway`'ga ta'sir qilmaydi.
 *
 * Client ulanish: io('/yolda-dispatcher', { auth: { token } })
 *
 * Events (server → client):
 *   - ads:new       — yangi filtrlangan e'lon
 *   - call:record-request — kiruvchi qo'ng'iroq uchun popup
 *   - driver-request:resolved — "haydovchi topish" javobi
 *   - zone:update   — geo-zona o'zgardi
 *
 * Events (client → server):
 *   - location:update — joriy koordinata
 *   - heartbeat       — har 30 sekundda
 */
@WebSocketGateway({
  namespace: '/yolda-dispatcher',
  cors: { origin: '*', credentials: true },
  transports: ['websocket', 'polling'],
})
export class YoldaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('YoldaGateway');
  private readonly dispatcherSockets = new Map<string, Set<string>>(); // dispatcherId -> socketIds
  private readonly socketToDispatcher = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'default-secret',
      });

      const dispatcherId = payload?.yoldaDispatcherId || payload?.sub;
      if (!dispatcherId) {
        client.disconnect();
        return;
      }

      if (!this.dispatcherSockets.has(dispatcherId)) {
        this.dispatcherSockets.set(dispatcherId, new Set());
      }
      this.dispatcherSockets.get(dispatcherId)!.add(client.id);
      this.socketToDispatcher.set(client.id, dispatcherId);

      client.join(`yd:${dispatcherId}`);
      client.join('yd:all');

      this.logger.log(`Dispatcher ulandi: ${dispatcherId.slice(-8)}`);
    } catch (e: any) {
      this.logger.warn(`Auth xato: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const did = this.socketToDispatcher.get(client.id);
    if (did) {
      this.dispatcherSockets.get(did)?.delete(client.id);
      if (this.dispatcherSockets.get(did)?.size === 0) {
        this.dispatcherSockets.delete(did);
      }
      this.socketToDispatcher.delete(client.id);
    }
  }

  @SubscribeMessage('location:update')
  handleLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number; accuracy?: number },
  ) {
    const did = this.socketToDispatcher.get(client.id);
    if (!did) return;
    // Backend'ga joylashuv yangilanishi haqida ma'lumot
    this.server.emit('admin:dispatcher-location', { dispatcherId: did, ...data });
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    client.emit('heartbeat:ack', { ts: Date.now() });
  }

  // ============================================================
  // Public helper metodlari — boshqa service'lardan chaqiriladi
  // ============================================================

  emitNewAd(ad: any, targetDispatcherIds?: string[]) {
    if (targetDispatcherIds?.length) {
      for (const did of targetDispatcherIds) {
        this.server.to(`yd:${did}`).emit('ads:new', ad);
      }
    } else {
      this.server.to('yd:all').emit('ads:new', ad);
    }
  }

  emitDriverRequestResolved(dispatcherId: string, request: any) {
    this.server.to(`yd:${dispatcherId}`).emit('driver-request:resolved', request);
  }

  emitZoneUpdate(dispatcherId: string | null, zone: any) {
    if (dispatcherId) {
      this.server.to(`yd:${dispatcherId}`).emit('zone:update', zone);
    } else {
      this.server.to('yd:all').emit('zone:update', zone);
    }
  }

  emitIncomingCallPopup(dispatcherId: string, payload: { phone: string; callId: string }) {
    this.server.to(`yd:${dispatcherId}`).emit('call:record-request', payload);
  }

  isOnline(dispatcherId: string): boolean {
    return (this.dispatcherSockets.get(dispatcherId)?.size || 0) > 0;
  }

  getOnlineDispatcherIds(): string[] {
    return Array.from(this.dispatcherSockets.keys());
  }
}
