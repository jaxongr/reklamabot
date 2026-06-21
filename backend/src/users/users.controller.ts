import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AppGateway } from '../gateway/app.gateway';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gateway: AppGateway,
  ) {}

  /**
   * Online foydalanuvchilar (hozir ulangan)
   */
  @Get('online')
  @ApiOperation({ summary: 'Online foydalanuvchilar' })
  async getOnlineUsers() {
    const onlineWs = this.gateway.getOnlineUsers();
    const userIds = onlineWs.map(o => o.userId);

    if (userIds.length === 0) return [];

    const users = await this.usersService.findByIds(userIds);

    return users.map(u => {
      const ws = onlineWs.find(o => o.userId === u.id);
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phoneNumber,
        role: u.role,
        deviceType: ws?.deviceType,
        lastOnlineAt: u.lastOnlineAt,
      };
    });
  }

  /**
   * Barcha foydalanuvchilar online statusi bilan
   */
  @Get('online-status')
  @ApiOperation({ summary: 'Barcha userlar online/offline statusi' })
  async getAllUsersOnlineStatus(
    @Query('role') role?: string,
  ) {
    const where: any = { isActive: true };
    if (role) where.role = role;

    const users = await this.usersService.findAllWithOnlineStatus(where);
    const onlineWs = this.gateway.getOnlineUsers();
    const onlineIds = new Set(onlineWs.map(o => o.userId));

    const activityPromises = users.map(u => this.gateway.getUserActivityMinutes(u.id));
    const activities = await Promise.all(activityPromises);

    return users.map((u, i) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phoneNumber,
      role: u.role,
      isOnline: onlineIds.has(u.id),
      lastOnlineAt: u.lastOnlineAt,
      deviceType: onlineWs.find(o => o.userId === u.id)?.deviceType,
      hasApp: !!(u as any).fcmToken || !!(u as any).lastOnlineAt,
      createdAt: (u as any).createdAt,
      activityMinutes: activities[i],
    }));
  }

  /**
   * Create new user (admin only)
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get all users with pagination
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { firstName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    return this.usersService.findAll({ skip, take, where });
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.getStatistics(req.user.userId);
  }

  /**
   * Search users
   */
  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  /**
   * Get users by role
   */
  @Get('role/:role')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findByRole(@Param('role') role: UserRole) {
    return this.usersService.findByRole(role);
  }

  /**
   * Get active users
   */
  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findActive() {
    return this.usersService.findActive();
  }

  /**
   * Get dashboard summary
   */
  @Get('dashboard/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getDashboardSummary() {
    return this.usersService.getDashboardSummary();
  }

  /**
   * Linya holatini o'zgartirish (o'chiq bo'lganda e'lon push kelmaydi)
   */
  @Patch('line-status')
  async toggleLineStatus(
    @Request() req: any,
    @Body() body: { isLineActive: boolean },
  ) {
    return this.usersService.setLineStatus(req.user.userId, body.isLineActive);
  }

  // ===================== GPS LOCATION =====================

  /**
   * Foydalanuvchi (dispetcher/driver/etc) o'z GPS joylashuvini yangilashi
   * Mobile app fonda har 10 sekundda chaqiradi
   */
  /**
   * Online ping — foydalanuvchi onlayn ekanligini bildirish.
   * Mobile foreground service har 10 sekundda chaqiradi (linya o'chiq bo'lsa ham).
   */
  @Patch('me/ping')
  @ApiOperation({ summary: 'Online status ping' })
  async pingOnline(@Request() req: any) {
    return this.usersService.markOnline(req.user.userId);
  }

  @Patch('me/location')
  @ApiOperation({ summary: 'O\'z GPS joylashuvni yangilash' })
  async updateMyLocation(
    @Request() req: any,
    @Body() body: UpdateLocationDto,
  ) {
    try {
      return await this.usersService.updateMyLocation(
        req.user.userId,
        body.lat,
        body.lng,
      );
    } catch (e: any) {
      return { error: 'Joylashuv saqlanmadi', detail: e?.message || String(e) };
    }
  }

  /**
   * ADMIN: Online dispetcherlar ro'yxati (xarita uchun)
   * Filter: role=DISPATCHER, oxirgi 5 daqiqada GPS yangilangan
   */
  @Get('admin/dispatchers/online')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Online dispetcherlar (xarita uchun)' })
  async getOnlineDispatchers(
    @Query('thresholdMinutes', new DefaultValuePipe(5), ParseIntPipe)
    thresholdMinutes: number,
  ) {
    return this.usersService.getOnlineDispatchers(thresholdMinutes);
  }

  // ===================== HODIMLAR BOSHQARUVI =====================

  @Get('staff')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getStaffList() {
    return this.usersService.getStaffList();
  }

  /**
   * Get user by ID — MUST be AFTER all static routes (staff, active, etc.)
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Update own profile (ID kerak emas — JWT dan olinadi)
   */
  @Patch('me')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    try {
      return await this.usersService.update(req.user.userId, updateUserDto);
    } catch (e) {
      return { error: 'Saqlashda xatolik', detail: e?.message || String(e) };
    }
  }

  /**
   * Update user
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    // Only allow users to update their own profile or admins to update any
    if (req.user.userId !== id && !this.isAdmin(req.user.role)) {
      return { error: 'Faqat o\'z profilingizni yangilashingiz mumkin' };
    }

    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (e) {
      return { error: 'Saqlashda xatolik', detail: e?.message || String(e) };
    }
  }

  /**
   * Change user role (admin only)
   */
  @Patch(':id/role')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.changeRole(id, role);
  }

  /**
   * Toggle user active status (admin only)
   */
  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async toggleActive(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.usersService.toggleActive(id, body?.reason);
  }

  /**
   * Update brand advertisement
   */
  @Patch(':id/brand-ad')
  async updateBrandAd(
    @Param('id') id: string,
    @Body('brandAdText') brandAdText: string,
    @Body('brandAdEnabled') brandAdEnabled: boolean,
    @Request() req: any,
  ) {
    if (req.user.userId !== id && !this.isAdmin(req.user.role)) {
      throw new Error('You can only update your own profile');
    }

    return this.usersService.updateBrandAd(id, brandAdText, brandAdEnabled);
  }

  /**
   * Delete user (soft delete)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Batch update users (admin only)
   */
  @Post('batch-update')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async batchUpdate(
    @Body('ids') ids: string[],
    @Body() data: any,
  ) {
    return this.usersService.batchUpdate(ids, data);
  }

  // Task 14: E'lon uchun telefonlar
  @Get('ad-phones')
  async getAdPhones(@Request() req: any) {
    return this.usersService.getAdPhones(req.user.userId);
  }

  @Patch('ad-phones')
  async updateAdPhones(@Request() req: any, @Body() body: { phones: string[] }) {
    return this.usersService.updateAdPhones(req.user.userId, body.phones);
  }

  /**
   * Yangi hodim yaratish
   */
  @Post('staff')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createStaff(
    @Body() body: {
      username: string;
      password: string;
      firstName: string;
      lastName?: string;
      role: UserRole;
      phoneNumber?: string;
    },
  ) {
    return this.usersService.createStaff(body);
  }

  /**
   * Hodim parolini o'zgartirish
   */
  @Patch(':id/password')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async changePassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.usersService.changePassword(id, password);
  }

  /**
   * Helper method to check if user is admin
   */
  private isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }
}
