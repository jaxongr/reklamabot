import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticate user via Telegram
   */
  async login(loginDto: LoginDto) {
    const { telegramId, authData } = loginDto;

    // Verify Telegram auth data (simplified - in production, verify with proper hash)
    const isValid = await this.verifyTelegramAuth(authData);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    // Find or create user
    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      // Create new user
      user = await this.usersService.create({
        telegramId,
        role: UserRole.USER,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is suspended');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update user info
    await this.usersService.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Invalid refresh token', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: string): Promise<User | null> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  /**
   * Verify Telegram authentication data
   */
  private async verifyTelegramAuth(authData: string): Promise<boolean> {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        this.logger.warn('TELEGRAM_BOT_TOKEN not set, skipping Telegram auth verification');
        return true;
      }

      // Parse auth data
      const data = JSON.parse(authData);
      const { hash, ...rest } = data;

      if (!hash) {
        return false;
      }

      // Check timestamp (not older than 24 hours)
      if (data.auth_date) {
        const authDate = parseInt(data.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
          this.logger.warn('Telegram auth data is too old');
          return false;
        }
      }

      // Sort fields alphabetically and create data-check-string
      const crypto = await import('crypto');
      const checkString = Object.keys(rest)
        .sort()
        .map((key) => `${key}=${rest[key]}`)
        .join('\n');

      // Create secret key from bot token
      const secretKey = crypto
        .createHash('sha256')
        .update(botToken)
        .digest();

      // Calculate HMAC
      const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex');

      return hmac === hash;
    } catch (error) {
      this.logger.error('Telegram auth verification failed', error);
      // In development, allow login
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      return false;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      telegramId: user.telegramId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { ...sanitized } = user;
    return sanitized;
  }

  /**
   * Admin login with username + password (for dashboard)
   */
  async adminLogin(username: string, password: string) {
    // Find user by username
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    // Check if user is admin
    if (!([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER] as string[]).includes(user.role)) {
      throw new UnauthorizedException('Dashboard faqat adminlar uchun');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akkaunt bloklangan');
    }

    // Verify password (stored in brandAdText field as hashed password for simplicity)
    const crypto = await import('crypto');
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Check password - if no password set, check against default
    const storedPassword = user.brandAdText;
    if (storedPassword && storedPassword !== hashedPassword) {
      throw new UnauthorizedException('Parol noto\'g\'ri');
    }

    // If no password stored yet (first login), accept default admin password
    if (!storedPassword) {
      const defaultPasswords: Record<string, string> = {
        admin: 'admin123',
        superadmin: 'admin123',
      };
      const defaultPass = defaultPasswords[username.toLowerCase()];
      if (!defaultPass || password !== defaultPass) {
        throw new UnauthorizedException('Parol noto\'g\'ri');
      }
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Logout user (invalidate tokens if using Redis)
   */
  async logout(userId: string) {
    // If using Redis for token blacklist:
    // await this.redisService.set(`blacklist:${userId}`, '1', 'EX', 900);
    this.logger.log(`User ${userId} logged out`);
    return { message: 'Logged out successfully' };
  }
}
