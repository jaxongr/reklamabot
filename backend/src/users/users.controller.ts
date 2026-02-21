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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
   * Get user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
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
      throw new Error('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
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
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
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

  /**
   * Helper method to check if user is admin
   */
  private isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }
}
