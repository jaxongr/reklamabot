import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Session, SessionStatus, Group, Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new session
   */
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    try {
      const session = await this.prisma.session.create({
        data,
        include: {
          _count: {
            select: { groups: true },
          },
        },
      });

      this.logger.log(`Session created: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error('Failed to create session', error);
      throw error;
    }
  }

  /**
   * Find all sessions for user
   */
  async findAll(userId: string, params?: {
    status?: SessionStatus;
    includeFrozen?: boolean;
  }) {
    const where: Prisma.SessionWhereInput = {
      userId,
      ...(params?.status && { status: params.status }),
      ...(params?.includeFrozen === false && { isFrozen: false }),
    };

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        _count: {
          select: {
            groups: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: sessions,
      total: sessions.length,
    };
  }

  /**
   * Find session by ID
   */
  async findOne(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        groups: {
          where: { isActive: true },
          orderBy: [
            { isPriority: 'desc' },
            { activityScore: 'desc' },
          ],
        },
        _count: {
          select: {
            groups: true,
            posts: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  /**
   * Update session
   */
  async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
    try {
      const session = await this.prisma.session.update({
        where: { id },
        data,
        include: {
          _count: {
            select: { groups: true },
          },
        },
      });

      this.logger.log(`Session updated: ${id}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to update session: ${id}`, error);
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  /**
   * Delete session
   */
  async remove(id: string): Promise<Session> {
    try {
      // Soft delete - mark as deleted
      const session = await this.prisma.session.update({
        where: { id },
        data: {
          status: SessionStatus.DELETED,
        },
      });

      this.logger.log(`Session deleted: ${id}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to delete session: ${id}`, error);
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  /**
   * Update session status
   */
  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    return this.update(id, { status });
  }

  /**
   * Mark session as frozen
   */
  async markFrozen(id: string, unfreezeAt?: Date): Promise<Session> {
    return this.update(id, {
      isFrozen: true,
      frozenAt: new Date(),
      unfreezeAt,
    });
  }

  /**
   * Unfreeze session
   */
  async unfreeze(id: string): Promise<Session> {
    return this.update(id, {
      isFrozen: false,
      frozenAt: null,
      unfreezeAt: null,
    });
  }

  /**
   * Update session statistics
   */
  async updateStats(
    id: string,
    stats: {
      totalGroups?: number;
      activeGroups?: number;
    },
  ): Promise<Session> {
    return this.update(id, stats);
  }

  /**
   * Update last sync time
   */
  async updateLastSync(id: string): Promise<Session> {
    return this.update(id, { lastSyncAt: new Date() });
  }

  /**
   * Get session groups
   */
  async getGroups(sessionId: string, params?: {
    active?: boolean;
    priority?: boolean;
    skip?: boolean;
  }) {
    const where: Prisma.GroupWhereInput = {
      sessionId,
      ...(params?.active !== undefined && { isActive: params.active }),
      ...(params?.priority !== undefined && { isPriority: params.priority }),
      ...(params?.skip !== undefined && { isSkipped: params.skip }),
    };

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        orderBy: [
          { isPriority: 'desc' },
          { activityScore: 'desc' },
          { memberCount: 'desc' },
        ],
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups,
      total,
    };
  }

  /**
   * Get priority groups (top 50)
   */
  async getPriorityGroups(sessionId: string, limit: number = 50) {
    return this.prisma.group.findMany({
      where: {
        sessionId,
        isActive: true,
        isSkipped: false,
        isPriority: true,
      },
      orderBy: [
        { activityScore: 'desc' },
        { memberCount: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Add group to session
   */
  async addGroup(data: Prisma.GroupCreateInput): Promise<Group> {
    try {
      const group = await this.prisma.group.create({
        data,
      });

      this.logger.log(`Group added: ${group.id}`);
      return group;
    } catch (error) {
      this.logger.error('Failed to add group', error);
      throw error;
    }
  }

  /**
   * Batch add groups to session
   */
  async batchAddGroups(
    sessionId: string,
    groups: Prisma.GroupCreateManyInput[],
  ): Promise<{ count: number }> {
    const result = await this.prisma.group.createMany({
      data: groups.map(g => ({ ...g, sessionId })),
      skipDuplicates: true,
    });

    // Update session stats
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        totalGroups: {
          increment: result.count,
        },
      },
    });

    this.logger.log(`Added ${result.count} groups to session: ${sessionId}`);
    return { count: result.count };
  }

  /**
   * Update group
   */
  async updateGroup(
    id: string,
    data: Prisma.GroupUpdateInput,
  ): Promise<Group> {
    try {
      const group = await this.prisma.group.update({
        where: { id },
        data,
      });

      this.logger.log(`Group updated: ${id}`);
      return group;
    } catch (error) {
      this.logger.error(`Failed to update group: ${id}`, error);
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  /**
   * Toggle group priority
   */
  async toggleGroupPriority(id: string): Promise<Group> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: { isPriority: true },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.updateGroup(id, {
      isPriority: !group.isPriority,
    });
  }

  /**
   * Skip group during posting
   */
  async skipGroup(id: string, reason?: string): Promise<Group> {
    return this.updateGroup(id, {
      isSkipped: true,
      skipReason: reason,
    });
  }

  /**
   * Unskip group
   */
  async unskipGroup(id: string): Promise<Group> {
    return this.updateGroup(id, {
      isSkipped: false,
      skipReason: null,
    });
  }

  /**
   * Update group activity score
   */
  async updateGroupActivity(
    id: string,
    score: number,
  ): Promise<Group> {
    return this.updateGroup(id, { activityScore: score });
  }

  /**
   * Update group restriction status
   */
  async updateGroupRestriction(
    id: string,
    hasRestrictions: boolean,
    restrictionUntil?: Date,
  ): Promise<Group> {
    return this.updateGroup(id, {
      hasRestrictions,
      restrictionUntil,
    });
  }

  /**
   * Get session statistics
   */
  async getStatistics(sessionId: string) {
    const session = await this.findOne(sessionId);

    const [
      totalGroups,
      activeGroups,
      priorityGroups,
      skippedGroups,
      restrictedGroups,
      recentPosts,
    ] = await Promise.all([
      this.prisma.group.count({ where: { sessionId } }),
      this.prisma.group.count({
        where: { sessionId, isActive: true, isSkipped: false },
      }),
      this.prisma.group.count({
        where: { sessionId, isPriority: true },
      }),
      this.prisma.group.count({
        where: { sessionId, isSkipped: true },
      }),
      this.prisma.group.count({
        where: { sessionId, hasRestrictions: true },
      }),
      this.prisma.post.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      session: {
        id: session.id,
        name: session.name,
        status: session.status,
        isFrozen: session.isFrozen,
        totalGroups: session.totalGroups,
        activeGroups: session.activeGroups,
      },
      groups: {
        total: totalGroups,
        active: activeGroups,
        priority: priorityGroups,
        skipped: skippedGroups,
        restricted: restrictedGroups,
      },
      recentPosts,
    };
  }

  /**
   * Recalculate priority groups (top 50 by activity)
   */
  async recalculatePriorityGroups(sessionId: string): Promise<void> {
    // First, remove priority from all groups
    await this.prisma.group.updateMany({
      where: { sessionId },
      data: { isPriority: false, priorityOrder: null },
    });

    // Get top 50 groups by activity score and member count
    const topGroups = await this.prisma.group.findMany({
      where: {
        sessionId,
        isActive: true,
        isSkipped: false,
      },
      orderBy: [
        { activityScore: 'desc' },
        { memberCount: 'desc' },
      ],
      take: 50,
    });

    // Update priority for top groups
    await Promise.all(
      topGroups.map((group, index) =>
        this.prisma.group.update({
          where: { id: group.id },
          data: {
            isPriority: true,
            priorityOrder: index + 1,
          },
        }),
      ),
    );

    this.logger.log(`Recculated priority groups for session: ${sessionId}`);
  }

  /**
   * Clean up frozen sessions (old sessions that are still frozen)
   */
  async cleanupFrozenSessions(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.session.updateMany({
      where: {
        isFrozen: true,
        frozenAt: {
          lte: cutoffDate,
        },
      },
      data: {
        isFrozen: false,
        frozenAt: null,
        unfreezeAt: null,
      },
    });

    this.logger.log(`Cleaned up ${result.count} frozen sessions`);
    return result.count;
  }
}
