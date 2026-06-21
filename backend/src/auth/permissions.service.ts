import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { UserRole, PermissionAction } from '@prisma/client';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Task 24: Ruxsatlarni olish
   */
  async getPermissions(role?: UserRole) {
    const cacheKey = `permissions:${role || 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const where: any = {};
    if (role) where.role = role;

    const permissions = await this.prisma.rolePermission.findMany({
      where,
      orderBy: [{ role: 'asc' }, { section: 'asc' }, { action: 'asc' }],
    });

    // Matritsa formatga o'tkazish
    const matrix: Record<string, Record<string, string[]>> = {};
    for (const p of permissions) {
      if (!matrix[p.role]) matrix[p.role] = {};
      if (!matrix[p.role][p.section]) matrix[p.role][p.section] = [];
      matrix[p.role][p.section].push(p.action);
    }

    try { await this.redis.set(cacheKey, matrix, 300); } catch {}
    return matrix;
  }

  /**
   * Ruxsat tekshirish
   */
  async hasPermission(role: UserRole, section: string, action: PermissionAction): Promise<boolean> {
    // SUPER_ADMIN va ADMIN hamma narsaga ruxsat
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    const cacheKey = `perm:${role}:${section}:${action}`;
    try {
      const cached = await this.redis.get<boolean>(cacheKey);
      if (cached !== null && cached !== undefined) return cached;
    } catch {}

    const perm = await this.prisma.rolePermission.findUnique({
      where: { role_section_action: { role, section, action } },
    });

    const result = !!perm;
    try { await this.redis.set(cacheKey, result, 300); } catch {}
    return result;
  }

  /**
   * Ruxsatlarni yangilash
   */
  async updatePermissions(
    role: UserRole,
    permissions: Array<{ section: string; action: PermissionAction; enabled: boolean }>,
  ) {
    for (const perm of permissions) {
      if (perm.enabled) {
        await this.prisma.rolePermission.upsert({
          where: {
            role_section_action: { role, section: perm.section, action: perm.action },
          },
          update: {},
          create: { role, section: perm.section, action: perm.action },
        });
      } else {
        await this.prisma.rolePermission.deleteMany({
          where: { role, section: perm.section, action: perm.action },
        });
      }
    }

    // Keshni tozalash
    try {
      await this.redis.del(`permissions:${role}`);
      await this.redis.del(`permissions:all`);
    } catch {}

    this.logger.log(`Ruxsatlar yangilandi: ${role}`);
    return this.getPermissions(role);
  }

  /**
   * Default ruxsatlarni o'rnatish
   */
  async seedDefaultPermissions() {
    const sections = ['orders', 'drivers', 'analytics', 'settings', 'users', 'ads', 'sessions', 'payments', 'monitor', 'support', 'chat', 'notifications'];
    const allActions = Object.values(PermissionAction);

    // DISPATCHER ruxsatlari
    const dispatcherPerms = [
      { section: 'orders', actions: ['VIEW', 'CREATE', 'EDIT'] },
      { section: 'drivers', actions: ['VIEW'] },
      { section: 'analytics', actions: ['VIEW'] },
      { section: 'ads', actions: ['VIEW', 'CREATE', 'EDIT'] },
      { section: 'sessions', actions: ['VIEW'] },
      { section: 'chat', actions: ['VIEW', 'CREATE'] },
      { section: 'support', actions: ['VIEW', 'CREATE'] },
      { section: 'notifications', actions: ['VIEW'] },
    ];

    for (const perm of dispatcherPerms) {
      for (const action of perm.actions) {
        await this.prisma.rolePermission.upsert({
          where: {
            role_section_action: { role: 'DISPATCHER', section: perm.section, action: action as PermissionAction },
          },
          update: {},
          create: { role: UserRole.DISPATCHER, section: perm.section, action: action as PermissionAction },
        });
      }
    }

    // DRIVER ruxsatlari
    const driverPerms = [
      { section: 'orders', actions: ['VIEW'] },
      { section: 'chat', actions: ['VIEW', 'CREATE'] },
      { section: 'support', actions: ['VIEW', 'CREATE'] },
      { section: 'notifications', actions: ['VIEW'] },
    ];

    for (const perm of driverPerms) {
      for (const action of perm.actions) {
        await this.prisma.rolePermission.upsert({
          where: {
            role_section_action: { role: 'DRIVER', section: perm.section, action: action as PermissionAction },
          },
          update: {},
          create: { role: UserRole.DRIVER, section: perm.section, action: action as PermissionAction },
        });
      }
    }

    this.logger.log('Default ruxsatlar o\'rnatildi');
  }
}
