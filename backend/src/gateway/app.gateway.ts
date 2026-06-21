import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { FcmService } from '../notifications/fcm.service';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
  deviceType?: 'dashboard' | 'mobile' | 'driver';
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
  pingInterval: 10000,    // 10s (default 25s)
  pingTimeout: 5000,      // 5s (default 20s)
  connectTimeout: 10000,
  maxHttpBufferSize: 1e6, // 1MB
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  // Track connected clients
  private readonly dashboardClients = new Map<string, AuthenticatedSocket>(); // userId → socket
  private readonly mobileClients = new Map<string, AuthenticatedSocket>(); // userId → socket
  private readonly driverClients = new Map<string, AuthenticatedSocket>(); // userId → socket

  // Online timeout map — disconnect dan 5 min keyin offline
  private readonly offlineTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly fcmService: FcmService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Unauthenticated connection attempt: ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.role = payload.role;
      client.deviceType = (client.handshake.query?.deviceType as any) || 'dashboard';

      // Register client
      if (client.deviceType === 'driver') {
        this.driverClients.set(client.userId, client);
      } else if (client.deviceType === 'mobile') {
        this.mobileClients.set(client.userId, client);
      } else {
        this.dashboardClients.set(client.userId, client);
      }

      // Join user-specific room
      client.join(`user:${client.userId}`);
      client.join(`device:${client.deviceType}`);

      this.logger.log(
        `Client connected: ${client.id} (${client.deviceType}, user: ${client.userId})`,
      );

      // Agar offline timer bo'lsa — bekor qilish (qayta ulandi)
      const existingTimer = this.offlineTimers.get(client.userId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        this.offlineTimers.delete(client.userId);
      }

      // Online qilish + session vaqtini boshlash
      this.setUserOnline(client.userId).catch(() => {});
      this.redis.set(`user:connectedAt:${client.userId}`, Date.now().toString(), 24 * 3600).catch(() => {});

      // Notify dashboard
      this.server.to(`user:${client.userId}`).emit('device:status', {
        deviceType: client.deviceType,
        status: 'online',
      });

      // Dashboard ga broadcast — kim online
      this.server.to('device:dashboard').emit('user:online', {
        userId: client.userId,
        role: client.role,
        deviceType: client.deviceType,
      });
    } catch (error) {
      this.logger.warn(`Auth failed for ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userId = client.userId;
      const deviceType = client.deviceType;

      if (deviceType === 'driver') {
        this.driverClients.delete(userId);
      } else if (deviceType === 'mobile') {
        this.mobileClients.delete(userId);
      } else {
        this.dashboardClients.delete(userId);
      }

      // Faollik vaqtini hisoblash va saqlash
      this.addActivityTime(userId).catch(() => {});

      // 5 daqiqadan keyin offline qilish (qayta ulanish imkoniyati)
      const timer = setTimeout(() => {
        this.offlineTimers.delete(userId);
        // Hali ham ulanmaganmi tekshirish
        if (!this.mobileClients.has(userId) && !this.driverClients.has(userId)) {
          this.setUserOffline(userId).catch(() => {});
          this.server.to('device:dashboard').emit('user:offline', {
            userId,
            role: client.role,
            deviceType,
          });
        }
      }, 5 * 60 * 1000); // 5 daqiqa

      this.offlineTimers.set(userId, timer);

      this.server.to(`user:${userId}`).emit('device:status', {
        deviceType,
        status: 'disconnected',
      });

      this.logger.log(
        `Client disconnected: ${client.id} (${deviceType}, user: ${userId}) — 5 min timer started`,
      );
    }
  }

  // ============================================================
  // POSTING EVENTS
  // ============================================================

  /**
   * Dashboard → Backend → Mobile: Tarqatishni boshlash
   */
  @SubscribeMessage('posting:start')
  handlePostingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      adId: string;
      content: string;
      mediaUrls?: string[];
      mediaType?: string;
      groups: Array<{ telegramId: string; title: string }>;
      safeMode?: boolean;
    },
  ) {
    const userId = client.userId;
    if (!userId) return;

    this.logger.log(`Posting start: user ${userId}, ad ${data.adId}, ${data.groups.length} groups`);

    // Send command to mobile app
    const mobileClient = this.mobileClients.get(userId);
    if (mobileClient) {
      mobileClient.emit('posting:command', {
        type: 'START_POSTING',
        adId: data.adId,
        content: data.content,
        mediaUrls: data.mediaUrls,
        mediaType: data.mediaType,
        groups: data.groups,
        safeMode: data.safeMode ?? false,
        timestamp: new Date().toISOString(),
      });
      return { success: true, message: 'Buyruq mobilga yuborildi' };
    }

    return { success: false, message: 'Mobil qurilma ulanmagan' };
  }

  /**
   * Dashboard → Backend → Mobile: Tarqatishni to'xtatish
   */
  @SubscribeMessage('posting:stop')
  handlePostingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { adId: string },
  ) {
    const userId = client.userId;
    if (!userId) return;

    const mobileClient = this.mobileClients.get(userId);
    if (mobileClient) {
      mobileClient.emit('posting:command', {
        type: 'STOP_POSTING',
        adId: data.adId,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    }

    return { success: false, message: 'Mobil qurilma ulanmagan' };
  }

  /**
   * Mobile → Backend → Dashboard: Posting progress
   */
  @SubscribeMessage('posting:progress')
  handlePostingProgress(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      adId: string;
      totalGroups: number;
      completedGroups: number;
      failedGroups: number;
      skippedGroups: number;
      currentGroup?: string;
      status: 'in_progress' | 'completed' | 'failed' | 'paused';
      logs?: Array<{ group: string; status: string; message?: string; timestamp: string }>;
    },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Forward progress to dashboard
    const dashboardClient = this.dashboardClients.get(userId);
    if (dashboardClient) {
      dashboardClient.emit('posting:update', data);
    }
  }

  // ============================================================
  // SESSION EVENTS
  // ============================================================

  /**
   * Mobile → Backend → Dashboard: Session status update
   */
  @SubscribeMessage('session:status')
  handleSessionStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      sessionId: string;
      phone: string;
      status: 'active' | 'inactive' | 'connecting' | 'error';
      groupCount?: number;
      error?: string;
    },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Forward to dashboard
    const dashboardClient = this.dashboardClients.get(userId);
    if (dashboardClient) {
      dashboardClient.emit('session:update', data);
    }
  }

  // ============================================================
  // ORDER EVENTS (Server → Dashboard + Mobile)
  // ============================================================

  /**
   * Emit new order to dashboard AND mobile (called from MonitorService)
   */
  emitNewOrder(userId: string, order: any) {
    const dashCount = this.dashboardClients.size;
    const mobileCount = this.mobileClients.size;
    this.logger.log(`[WS] Emitting order:new to ${dashCount} dashboard(s) + ${mobileCount} mobile(s)`);
    // Dashboard — broadcast to all dashboards
    this.server.to('device:dashboard').emit('order:new', order);
    // Mobile — broadcast to ALL mobile clients (userId har xil bo'lishi mumkin)
    this.server.to('device:mobile').emit('order:new', order);
    // Driver — broadcast to ALL driver clients
    // Phone yashirish — driverlar uchun phone + messageText'dagi raqamlar strip
    const { phone, senderPhone, ...orderWithoutPhone } = order;
    let cleanMsg = orderWithoutPhone.messageText;
    if (cleanMsg) {
      cleanMsg = cleanMsg.replace(/(\+?\d[\d\s\-()]{7,15}\d)/g, '** *** ** **');
    }
    this.server.to('device:driver').emit('order:new', { ...orderWithoutPhone, phone: null, senderPhone: null, messageText: cleanMsg });
  }

  /**
   * Emit order stats update
   */
  emitOrderStats(userId: string, stats: any) {
    this.server.to('device:dashboard').emit('order:stats', stats);
    // Mobile ga ham broadcast
    this.server.to('device:mobile').emit('order:stats', stats);
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Check if mobile client is connected
   */
  isMobileConnected(userId: string): boolean {
    return this.mobileClients.has(userId);
  }

  /**
   * Check if dashboard client is connected
   */
  isDashboardConnected(userId: string): boolean {
    return this.dashboardClients.has(userId);
  }

  /**
   * Get connected mobile clients count
   */
  getMobileClientCount(): number {
    return this.mobileClients.size;
  }

  /**
   * Send message to specific user's device
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send to user's mobile device only
   */
  sendToMobile(userId: string, event: string, data: any) {
    const mobileClient = this.mobileClients.get(userId);
    if (mobileClient) {
      mobileClient.emit(event, data);
    }
  }

  /**
   * Send to user's dashboard only
   */
  sendToDashboard(userId: string, event: string, data: any) {
    const dashboardClient = this.dashboardClients.get(userId);
    if (dashboardClient) {
      dashboardClient.emit(event, data);
    }
  }

  /**
   * Broadcast to all connected dashboards
   */
  broadcastToDashboards(event: string, data: any) {
    this.server.to('device:dashboard').emit(event, data);
  }

  // ============================================================
  // FCM PUSH HELPERS
  // ============================================================

  /**
   * Hozir WebSocket'ga ulangan barcha mobile foydalanuvchi ID'lari
   */
  getConnectedMobileUserIds(): Set<string> {
    const ids = new Set<string>();
    for (const userId of this.mobileClients.keys()) {
      ids.add(userId);
    }
    for (const userId of this.driverClients.keys()) {
      ids.add(userId);
    }
    return ids;
  }

  /**
   * Yangi order: WS + FCM push (offline userlarga)
   */
  async emitNewOrderWithFcm(userId: string, order: any) {
    // WS broadcast (mavjud logika)
    this.emitNewOrder(userId, order);

    // FCM push — faqat offline userlarga
    const route = order.cargoFrom && order.cargoTo
      ? `${order.cargoFrom} → ${order.cargoTo}`
      : 'Yangi yuk';
    const body = [
      order.phone,
      order.cargoWeight ? `${order.cargoWeight} kg` : null,
      order.vehicleType,
    ].filter(Boolean).join(' | ');

    const connectedIds = this.getConnectedMobileUserIds();
    // Faqat yaqindagi haydovchilarga push (cargoFrom shahri bo'yicha)
    this.fcmService.sendToNearbyDrivers(
      `Yangi yuk: ${route}`,
      body || 'Batafsil ko\'rish uchun bosing',
      { type: 'new_order', orderId: order.id },
      order.cargoFrom || null,
      connectedIds,
    ).catch((err) => {
      this.logger.error(`FCM new order xatosi: ${err.message}`);
    });
  }

  /**
   * Chat xabari: qabul qiluvchiga FCM push.
   * Mobile foreground'da local notification orqali ko'rsatiladi (FCM service),
   * background/lock screen'da OS notification chiqaradi.
   * Agar qabul qiluvchi WS'da ulangan VA mobile/driver clientida bo'lsa ham —
   * push yuboriladi (foreground'da app local notif chiqaradi).
   */
  async sendChatFcmPush(
    recipientUserId: string,
    senderName: string,
    message: string,
    chatRoomId: string,
    senderId?: string,
  ) {
    const trimmed = message && message.length > 100
      ? message.substring(0, 100) + '...'
      : (message || '');

    this.fcmService.sendToUser(
      recipientUserId,
      senderName,
      trimmed,
      {
        type: 'chat',
        chatRoomId,
        senderName,
        senderId: senderId || '',
        message: trimmed,
      },
    ).catch((err) => {
      this.logger.error(`FCM chat xatosi: ${err.message}`);
    });
  }

  // ============================================================
  // DRIVER EVENTS
  // ============================================================

  /**
   * Driver → Backend → Dashboard: GPS location update
   */
  @SubscribeMessage('driver:locationUpdate')
  handleDriverLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { lat: number; lng: number; city?: string },
  ) {
    const userId = client.userId;
    if (!userId) return;

    // Forward to all dashboards
    this.server.to('device:dashboard').emit('driver:locationUpdate', {
      userId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Driver → Backend → Dashboard: Online/Offline status change
   */
  @SubscribeMessage('driver:statusChange')
  handleDriverStatusChange(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { isOnline: boolean },
  ) {
    const userId = client.userId;
    if (!userId) return;

    this.server.to('device:dashboard').emit('driver:statusChange', {
      userId,
      isOnline: data.isOnline,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit new driver offer to dashboards (called from DriversService)
   */
  emitNewDriverOffer(offer: any) {
    this.server.to('device:dashboard').emit('driver:newOffer', offer);
  }

  /**
   * Emit private order to specific driver (called from DriversService)
   */
  emitPrivateOrder(driverId: string, order: any) {
    const driverClient = this.driverClients.get(driverId);
    if (driverClient) {
      driverClient.emit('driver:privateOrder', order);
    }
  }

  // ═══ ONLINE STATUS ═══

  private async setUserOnline(userId: string) {
    await this.redis.set(`user:online:${userId}`, true, 6 * 60); // 6 min TTL
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastOnlineAt: new Date() },
    }).catch(() => {});
  }

  /**
   * Faollik vaqtini hisoblash — connect dan disconnect gacha
   */
  private async addActivityTime(userId: string) {
    const connectedAtStr = await this.redis.get<string>(`user:connectedAt:${userId}`);
    if (!connectedAtStr) return;

    const connectedAt = parseInt(connectedAtStr as any);
    const sessionMinutes = Math.round((Date.now() - connectedAt) / 60000);
    if (sessionMinutes <= 0 || sessionMinutes > 1440) return; // max 24 soat

    // Bugungi faollik vaqti (daqiqa)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `user:activity:${userId}:${today}`;
    const currentStr = await this.redis.get<string>(key);
    const current = parseInt(currentStr as any) || 0;
    await this.redis.set(key, current + sessionMinutes, 48 * 3600); // 48 soat TTL
  }

  private async setUserOffline(userId: string) {
    await this.redis.set(`user:online:${userId}`, false, 0);
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastOnlineAt: new Date() },
    }).catch(() => {});
  }

  /**
   * Online userlar ro'yxati
   */
  getOnlineUsers() {
    const online: Array<{ userId: string; role: string; deviceType: string }> = [];
    for (const [userId, client] of this.mobileClients) {
      online.push({ userId, role: client.role || 'USER', deviceType: 'mobile' });
    }
    for (const [userId, client] of this.driverClients) {
      online.push({ userId, role: client.role || 'DRIVER', deviceType: 'driver' });
    }
    for (const [userId, client] of this.dashboardClients) {
      online.push({ userId, role: client.role || 'ADMIN', deviceType: 'dashboard' });
    }
    return online;
  }

  /**
   * Userning bugungi faollik vaqtini olish (daqiqa)
   */
  async getUserActivityMinutes(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `user:activity:${userId}:${today}`;
    const minutes = await this.redis.get<number>(key);
    return (minutes as number) || 0;
  }

  /**
   * Emit to all driver clients
   */
  broadcastToDrivers(event: string, data: any) {
    this.server.to('device:driver').emit(event, data);
  }

  /**
   * Emit order accepted to dashboards
   */
  emitOrderAccepted(order: any) {
    this.server.to('device:dashboard').emit('driver:orderAccepted', order);
  }

  /**
   * Send to driver's device
   */
  sendToDriver(userId: string, event: string, data: any) {
    const driverClient = this.driverClients.get(userId);
    if (driverClient) {
      driverClient.emit(event, data);
    }
  }

  /**
   * Get connected driver clients count
   */
  getDriverClientCount(): number {
    return this.driverClients.size;
  }

  // ============================================================
  // CHAT EVENTS
  // ============================================================

  /**
   * Client → Backend: Chat xabari (typing, message)
   */
  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string; message: string },
  ) {
    try {
      // DB ga saqlash — ChatService o'zi WS broadcast va FCM push yuboradi
      await this.chatService.sendMessage(
        data.chatRoomId,
        client.userId,
        data.message,
      );
    } catch (e) {
      this.logger.error(`Chat message error: ${e.message}`);
      client.emit('chat:error', { message: 'Xabar yuborilmadi' });
    }
  }

  @SubscribeMessage('chat:typing')
  handleChatTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.to(`chat:${data.chatRoomId}`).emit('chat:typing', {
      chatRoomId: data.chatRoomId,
      userId: client.userId,
    });
  }

  @SubscribeMessage('chat:join')
  handleChatJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.join(`chat:${data.chatRoomId}`);
  }

  @SubscribeMessage('chat:leave')
  handleChatLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatRoomId: string },
  ) {
    client.leave(`chat:${data.chatRoomId}`);
  }

  /**
   * Emit chat message (called from ChatService)
   */
  emitChatMessage(chatRoomId: string, message: any) {
    this.server.to(`chat:${chatRoomId}`).emit('chat:newMessage', message);
  }

  // ============================================================
  // NOTIFICATION EVENTS
  // ============================================================

  /**
   * Emit notification to specific user or broadcast
   */
  emitNotification(userId: string | null, notification: any) {
    if (userId) {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
    } else {
      // Broadcast to all
      this.server.emit('notification:new', notification);
    }
  }

  /**
   * Broadcast notification to all dashboards
   */
  emitNotificationToDashboards(notification: any) {
    this.server.to('device:dashboard').emit('notification:new', notification);
  }

  // ============================================================
  // SURGE EVENTS
  // ============================================================

  /**
   * Emit surge price update to dashboards and mobile
   */
  emitSurgeUpdate(surgeData: any) {
    this.server.to('device:dashboard').emit('surge:update', surgeData);
    this.server.to('device:mobile').emit('surge:update', surgeData);
    this.server.to('device:driver').emit('surge:update', surgeData);
  }

  // ============================================================
  // SUPPORT EVENTS
  // ============================================================

  /**
   * Emit new support ticket/message
   */
  emitSupportUpdate(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('support:update', data);
    // Also notify dashboards
    this.server.to('device:dashboard').emit('support:update', data);
  }
}
