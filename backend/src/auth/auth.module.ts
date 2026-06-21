import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SmsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m' as any,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, PermissionsService],
  controllers: [AuthController, PermissionsController],
  exports: [AuthService, PermissionsService],
})
export class AuthModule {}
