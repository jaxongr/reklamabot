import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login via Telegram
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login via Telegram auth data' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Admin login with username + password (for Dashboard)
   */
  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with username and password' })
  async adminLogin(@Body() body: { username: string; password: string }) {
    return this.authService.adminLogin(body.username, body.password);
  }

  /**
   * Telegram Mini App auth
   */
  @Post('telegram-webapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auth via Telegram Mini App initData' })
  async telegramWebApp(@Body() body: { initData: string }) {
    return this.authService.telegramWebAppAuth(body.initData);
  }

  /**
   * Driver login — telefon + parol
   */
  @Post('driver-login-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Driver login via phone + password' })
  async driverLoginWithPassword(@Body() body: { phone: string; password: string }) {
    return this.authService.driverLoginWithPassword(body.phone, body.password);
  }

  /**
   * Driver — parol qo'yish (eski userlar yoki birinchi marta)
   */
  @Post('driver-set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Driver set password' })
  async driverSetPassword(@Body() body: { phone: string; password: string }) {
    return this.authService.driverSetPassword(body.phone, body.password);
  }

  /**
   * Driver — telefon raqamiga SMS kod yuborish
   */
  @Post('driver-send-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telefon raqamiga SMS kod yuborish' })
  async driverSendCode(@Body() body: { phone: string }) {
    return this.authService.sendDriverCode(body.phone);
  }

  /**
   * Driver login — telefon + kod (Telegramsiz)
   */
  @Post('driver-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Driver login via phone + code' })
  async driverLogin(@Body() body: { phone: string; code: string }) {
    return this.authService.driverLogin(body.phone, body.code);
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Logout current user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  /**
   * Get current user profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getFullProfile(req.user.userId);
  }

  /**
   * Get current user (alias for mini app)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    return req.user;
  }
}
