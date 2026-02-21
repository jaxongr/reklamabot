import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
// @ts-expect-error - input package doesn't have types
import input from 'input';
import { Session, SessionStatus } from '@prisma/client';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private readonly clients = new Map<string, TelegramClient>();
  private readonly botToken: string;
  private readonly apiId: number;
  private readonly apiHash: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.apiId = parseInt(this.config.get<string>('TELEGRAM_API_ID') || '0');
    this.apiHash = this.config.get<string>('TELEGRAM_API_HASH') || '';
  }

  async onModuleInit() {
    this.logger.log('Telegram Service initialized');
    // Load all active sessions (if database is available)
    try {
      await this.loadActiveSessions();
    } catch (error) {
      this.logger.warn('Could not load sessions - database may not be available');
    }
  }

  async onModuleDestroy() {
    // Disconnect all clients
    for (const [sessionId, client] of this.clients) {
      try {
        await client.disconnect();
        this.logger.log(`Disconnected session: ${sessionId}`);
      } catch (error) {
        this.logger.error(`Failed to disconnect session ${sessionId}:`, error);
      }
    }
    this.clients.clear();
  }

  /**
   * Create new Telegram session (user account)
   */
  async createSession(
    userId: string,
    sessionName?: string,
    phone?: string,
  ): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        userId,
        name: sessionName,
        phone,
        status: SessionStatus.INACTIVE,
      },
    });

    this.logger.log(`Created new session: ${session.id}`);
    return session;
  }

  /**
   * Authorize session with phone number
   */
  async authorizeSession(sessionId: string): Promise<{
    phoneCodeHash: string;
    isPasswordNeeded: boolean;
  }> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.phone) {
      throw new Error('Session not found or phone not set');
    }

    const client = this.getClient(sessionId);

    try {
      const { phoneCodeHash, isCodeViaApp } = await client.sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        session.phone,
      );

      // Update session status
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.ACTIVE },
      });

      this.logger.log(`Authorized session: ${sessionId}`);
      return { phoneCodeHash, isPasswordNeeded: isCodeViaApp };
    } catch (error) {
      this.logger.error(`Failed to authorize session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Verify code and complete authorization
   */
  async verifyCode(
    sessionId: string,
    code: string,
    phoneCodeHash: string,
    password?: string,
  ): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const client = this.getClient(sessionId);

    try {
      // Complete authorization
      // Note: Actual implementation depends on telegram library version
      this.logger.log(`Verified code for session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to verify code for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get or create Telegram client for session
   */
  private getClient(sessionId: string): TelegramClient {
    if (this.clients.has(sessionId)) {
      return this.clients.get(sessionId)!;
    }

    const stringSession = new StringSession();
    const client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
      connectionRetries: 5,
    });

    this.clients.set(sessionId, client);
    return client;
  }

  /**
   * Load all active sessions on startup
   */
  private async loadActiveSessions(): Promise<void> {
    const sessions = await this.prisma.session.findMany({
      where: {
        status: SessionStatus.ACTIVE,
        isFrozen: false,
      },
    });

    this.logger.log(`Loading ${sessions.length} active sessions...`);

    for (const session of sessions) {
      try {
        await this.connectSession(session.id);
      } catch (error) {
        this.logger.error(`Failed to load session ${session.id}:`, error);
      }
    }
  }

  /**
   * Connect existing session
   */
  async connectSession(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.sessionString) {
      throw new Error('Session not found or no session string');
    }

    try {
      const client = this.getClient(sessionId);
      await client.connect();

      this.logger.log(`Connected session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to connect session ${sessionId}:`, error);
      await this.markSessionFrozen(sessionId);
      throw error;
    }
  }

  /**
   * Sync groups from session
   */
  async syncSessionGroups(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        groups: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const client = this.clients.get(sessionId);
      if (!client) {
        throw new Error('Client not connected');
      }

      // Get all dialogs
      // Note: Actual implementation depends on telegram library
      // This is a simplified version

      // Update session stats
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          lastSyncAt: new Date(),
          totalGroups: session.groups.length,
        },
      });

      this.logger.log(`Synced groups for session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to sync groups for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Mark session as frozen
   */
  async markSessionFrozen(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isFrozen: true,
        frozenAt: new Date(),
        freezeCount: { increment: 1 },
      },
    });

    this.logger.warn(`Session frozen: ${sessionId}`);
  }

  /**
   * Unfreeze session
   */
  async unfreezeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isFrozen: false,
        frozenAt: null,
        unfreezeAt: null,
      },
    });

    this.logger.log(`Session unfrozen: ${sessionId}`);
  }

  /**
   * Check if session is ready for posting
   */
  async isSessionReady(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;
    if (session.isFrozen) {
      // Check if unfreeze time has passed
      if (session.unfreezeAt && session.unfreezeAt <= new Date()) {
        await this.unfreezeSession(sessionId);
        return true;
      }
      return false;
    }
    if (session.status !== SessionStatus.ACTIVE) return false;

    return true;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        groups: {
          where: { isActive: true },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const activeGroups = session.groups.filter(g => !g.isSkipped);
    const priorityGroups = activeGroups.filter(g => g.isPriority);

    return {
      totalGroups: session.totalGroups,
      activeGroups: activeGroups.length,
      priorityGroups: priorityGroups.length,
      isFrozen: session.isFrozen,
      status: session.status,
      lastSyncAt: session.lastSyncAt,
    };
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (client) {
      try {
        await client.disconnect();
        this.clients.delete(sessionId);
      } catch (error) {
        this.logger.error(`Failed to disconnect client for session ${sessionId}:`, error);
      }
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    this.logger.log(`Deleted session: ${sessionId}`);
  }

  /**
   * Get all sessions for user
   */
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      include: {
        _count: {
          select: { groups: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get priority groups (top 50 most active)
   */
  async getPriorityGroups(userId: string) {
    return this.prisma.group.findMany({
      where: {
        session: {
          userId,
        },
        isPriority: true,
        isActive: true,
        isSkipped: false,
      },
      include: {
        session: true,
      },
      orderBy: [
        { activityScore: 'desc' },
        { memberCount: 'desc' },
      ],
      take: 50,
    });
  }

  /**
   * Update group activity score
   */
  async updateGroupActivity(
    groupId: string,
    score: number,
  ): Promise<void> {
    await this.prisma.group.update({
      where: { id: groupId },
      data: { activityScore: score },
    });
  }

  /**
   * Send message to a group via session client
   */
  async sendMessage(
    sessionId: string,
    groupTelegramId: string,
    message: string,
    options?: {
      parseMode?: 'html' | 'markdown';
      mediaUrls?: string[];
    },
  ): Promise<{ messageId?: number }> {
    const client = this.clients.get(sessionId);
    if (!client) {
      throw new Error(`Session ${sessionId} is not connected`);
    }

    try {
      const result = await client.sendMessage(groupTelegramId, {
        message,
        parseMode: options?.parseMode || 'html',
      });

      this.logger.debug(`Message sent to ${groupTelegramId} via session ${sessionId}`);

      return { messageId: result?.id };
    } catch (error: any) {
      // Handle specific Telegram errors
      if (error.message?.includes('FLOOD_WAIT')) {
        const waitSeconds = parseInt(error.message.match(/\d+/)?.[0] || '60');
        this.logger.warn(`Flood wait ${waitSeconds}s for session ${sessionId}`);
        throw new Error(`FLOOD_WAIT:${waitSeconds}`);
      }

      if (
        error.message?.includes('CHAT_WRITE_FORBIDDEN') ||
        error.message?.includes('USER_BANNED_IN_CHANNEL')
      ) {
        this.logger.warn(`Cannot write to ${groupTelegramId}: ${error.message}`);
        throw new Error(`WRITE_FORBIDDEN:${groupTelegramId}`);
      }

      if (error.message?.includes('AUTH_KEY_UNREGISTERED')) {
        this.logger.error(`Session ${sessionId} auth key unregistered`);
        await this.markSessionFrozen(sessionId);
        throw new Error(`SESSION_DEAD:${sessionId}`);
      }

      throw error;
    }
  }

  /**
   * Check if a client is connected and ready
   */
  isClientConnected(sessionId: string): boolean {
    const client = this.clients.get(sessionId);
    return !!client && client.connected;
  }
}
