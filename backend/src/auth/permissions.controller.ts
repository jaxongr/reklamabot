import { Controller, Get, Put, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole, PermissionAction } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('auth/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Ruxsatlar matritsa (admin)' })
  async getPermissions(@Query('role') role?: UserRole) {
    return this.permissionsService.getPermissions(role);
  }

  @Get('my')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: "Joriy foydalanuvchi ruxsatlari" })
  async getMyPermissions(@Request() req: any) {
    const role = req.user.role as UserRole;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return { sections: 'ALL' };
    }
    const perms: any = await this.permissionsService.getPermissions(role);
    const sections: string[] = [];
    const rolePerms = perms?.[role];
    if (rolePerms && typeof rolePerms === 'object') {
      for (const section of Object.keys(rolePerms)) {
        sections.push(section);
      }
    }
    return { sections };
  }

  @Put()
  @ApiOperation({ summary: 'Ruxsatlarni yangilash' })
  async updatePermissions(
    @Body() body: {
      role: UserRole;
      permissions: Array<{ section: string; action: PermissionAction; enabled: boolean }>;
    },
  ) {
    return this.permissionsService.updatePermissions(body.role, body.permissions);
  }
}
