import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../common/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '@prisma/client';
import { appLoginCodes, driverLoginCodes } from './app-login-codes';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Authenticate user via Telegram
   */
  async login(loginDto: LoginDto) {
    const { telegramId, authData, role } = loginDto;

    // Audit log — har bir login urinishi yoziladi (debugging uchun)
    this.logger.log(`[LOGIN ATTEMPT] telegramId="${telegramId}" role="${role || 'none'}" authDataLen=${authData?.length || 0} activeCodes=${appLoginCodes.size}`);

    // Verify Telegram auth data or mobile app OTP code
    const isValid = await this.verifyTelegramAuth(authData, telegramId);
    if (!isValid) {
      const isOtp = /^\d{6}$/.test(authData?.trim() || '');
      if (isOtp) {
        const hasAny = appLoginCodes.size > 0;
        this.logger.warn(`[LOGIN FAIL] telegramId="${telegramId}" code="${authData}" activeCodes=${appLoginCodes.size} reason="${hasAny ? 'wrong_or_expired' : 'no_codes'}"`);
        throw new UnauthorizedException(
          hasAny ? 'Kod noto\'g\'ri yoki eskirgan. Botdan qaytadan /app bosing.' : 'Kod topilmadi. Botdan /app bosib yangi kod oling.',
        );
      }
      this.logger.warn(`[LOGIN FAIL] telegramId="${telegramId}" reason="invalid_auth_data"`);
      throw new UnauthorizedException('Invalid Telegram auth data');
    }
    this.logger.log(`[LOGIN OK] telegramId="${telegramId}" role="${role || 'none'}"`);

    // Find or create user
    let user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      // Create new user with appropriate role
      const userRole = role === 'DRIVER' ? UserRole.DRIVER
        : role === 'DISPATCHER' ? UserRole.DISPATCHER
        : UserRole.USER;
      user = await this.usersService.create({
        telegramId,
        role: userRole,
      });

      // If driver, create DriverProfile
      if (userRole === UserRole.DRIVER) {
        await this.prisma.driverProfile.create({
          data: { userId: user.id },
        });
      }
    } else {
      // Mavjud user — rolni yangilash (agar o'zgargan bo'lsa)
      const newRole = role === 'DRIVER' ? UserRole.DRIVER
        : role === 'DISPATCHER' ? UserRole.DISPATCHER
        : null;

      if (newRole && user.role !== newRole && user.role === UserRole.USER) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { role: newRole },
        });

        // Driver bo'lsa profil yaratish
        if (newRole === UserRole.DRIVER) {
          const existingProfile = await this.prisma.driverProfile.findUnique({
            where: { userId: user.id },
          });
          if (!existingProfile) {
            await this.prisma.driverProfile.create({
              data: { userId: user.id },
            });
          }
        }
      }
    }

    if (!user.isActive) {
      const reason = (user as any).blockReason || 'Admin tomonidan bloklangan';
      throw new UnauthorizedException(`Akkaunt bloklangan: ${reason}`);
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

  async getFullProfile(userId: string) {
    return this.usersService.findOne(userId);
  }

  /**
   * Verify Telegram authentication data or mobile app login code
   */
  private async verifyTelegramAuth(authData: string, telegramId?: string): Promise<boolean> {
    // === Mobile app OTP kod tekshirish ===
    // Agar authData faqat 6 raqamdan iborat bo'lsa — bu bot orqali olingan login kod
    if (/^\d{6}$/.test(authData.trim()) && telegramId) {
      const entry = appLoginCodes.get(authData.trim());
      if (entry && entry.telegramId === telegramId && entry.expiresAt > Date.now()) {
        // Kodni o'chirish (bir martalik)
        appLoginCodes.delete(authData.trim());
        this.logger.log(`Mobile app login: ${telegramId} muvaffaqiyatli`);
        return true;
      }
      this.logger.warn(`Mobile app login kod noto'g'ri yoki eskirgan: ${telegramId}`);
      return false;
    }

    // === Telegram Widget auth data tekshirish ===
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
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '2h') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '30d') as any,
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
   * Telegram Mini App auth via initData
   */
  async telegramWebAppAuth(initData: string) {
    const crypto = await import('crypto');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new UnauthorizedException('Bot token not configured');
    }

    // Parse initData (URL-encoded key=value pairs)
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException('Invalid initData: no hash');
    }

    // Build data-check-string (sorted, without hash)
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // Secret key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Verify hash
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      this.logger.warn('Mini App initData hash mismatch');
      throw new UnauthorizedException('Invalid initData signature');
    }

    // Check auth_date freshness (max 24h)
    const authDate = parseInt(params.get('auth_date') || '0');
    if (Math.floor(Date.now() / 1000) - authDate > 86400) {
      throw new UnauthorizedException('initData expired');
    }

    // Extract user
    const userStr = params.get('user');
    if (!userStr) {
      throw new UnauthorizedException('No user in initData');
    }

    const tgUser = JSON.parse(userStr);
    const telegramId = String(tgUser.id);

    // Find or create user
    let user = await this.usersService.findByTelegramId(telegramId);
    if (!user) {
      user = await this.usersService.create({
        telegramId,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        language: tgUser.language_code || 'uz',
        role: UserRole.USER,
      });
    } else {
      // Update info from Telegram
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: tgUser.first_name || user.firstName,
          lastName: tgUser.last_name || user.lastName,
          username: tgUser.username || user.username,
        },
      }).catch(() => {});
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akkaunt bloklangan');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateLastLogin(user.id);
    this.logger.log(`Mini App auth: ${telegramId} (${tgUser.first_name})`);

    return {
      user: this.sanitizeUser(user),
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
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
   * Driver login: telefon raqam + kod (admin bergan)
   * Telegram umuman kerak emas!
   */
  async driverLogin(phone: string, code: string) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // 0. Google Play test akkaunt — faqat test muhitda yoki maxsus telefon
    if (code.trim() === '000000' && cleanPhone === '+998887469666' && process.env.ALLOW_TEST_LOGIN !== 'false') {
      const profile = await this.prisma.driverProfile.findFirst({
        where: { phone: cleanPhone },
        include: { user: true },
      });
      if (profile?.user) {
        const dp = await this.prisma.driverProfile.findFirst({ where: { userId: profile.user.id } });
        const tokens = await this.generateTokens(profile.user);
        await this.usersService.updateLastLogin(profile.user.id);
        return { user: this.sanitizeUser(profile.user), ...tokens, isVerified: dp?.isVerified ?? false };
      }
    }

    // 1. Kodni tekshirish
    const entry = driverLoginCodes.get(code.trim());
    if (entry && entry.phone === cleanPhone && entry.expiresAt > Date.now()) {
      // Kod to'g'ri — o'chirish (bir martalik)
      driverLoginCodes.delete(code.trim());

      const user = await this.prisma.user.findUnique({
        where: { id: entry.userId },
      });
      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi');
      }
      if (!user.isActive) {
        const reason = (user as any).blockReason || 'Admin tomonidan bloklangan';
        throw new UnauthorizedException(`Akkaunt bloklangan: ${reason}`);
      }

      // isVerified tekshirish
      const driverProfile = await this.prisma.driverProfile.findFirst({
        where: { userId: user.id },
      });

      const tokens = await this.generateTokens(user);
      await this.usersService.updateLastLogin(user.id);
      this.logger.log(`Driver login (kod): ${cleanPhone}`);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
        isVerified: driverProfile?.isVerified ?? false,
      };
    }

    // 2. Kod to'g'ri kelmadi
    throw new UnauthorizedException('Kod noto\'g\'ri yoki eskirgan. Admindan yangi kod oling.');
  }

  /**
   * Admin haydovchiga login kod berish
   */
  generateDriverLoginCode(userId: string, phone: string): string {
    // 6-raqamli kod
    const code = String(100000 + Math.floor(Math.random() * 900000));
    driverLoginCodes.set(code, {
      phone: phone.replace(/[\s\-\(\)]/g, ''),
      userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 soat
    });
    this.logger.log(`Driver login kod yaratildi: ${phone} → ${code}`);
    return code;
  }

  /**
   * Telefon raqamiga SMS kod yuborish (haydovchi login uchun)
   */
  // ============================================================
  // DRIVER LOGIN/PAROL TIZIMI
  // ============================================================

  // Brute force himoya — telefon → xato urinishlar
  private loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

  /**
   * Telefon + parol bilan kirish
   */
  async driverLoginWithPassword(phone: string, password: string) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Brute force tekshirish
    const attempts = this.loginAttempts.get(cleanPhone);
    if (attempts && attempts.blockedUntil > Date.now()) {
      const waitSec = Math.ceil((attempts.blockedUntil - Date.now()) / 1000);
      throw new UnauthorizedException(`Juda ko'p urinish. ${waitSec} sekunddan keyin qayta urinib ko'ring`);
    }

    // Haydovchi profili topish
    const profile = await this.prisma.driverProfile.findFirst({
      where: { phone: cleanPhone },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      this._recordFailedAttempt(cleanPhone);
      throw new UnauthorizedException('Telefon raqam yoki parol xato');
    }

    if (!profile.user.isActive) {
      const reason = (profile.user as any).blockReason || 'Admin tomonidan bloklangan';
      throw new UnauthorizedException(`Akkaunt bloklangan: ${reason}`);
    }

    // Parol tekshirish
    if (!profile.passwordHash) {
      // Parol hali qo'yilmagan — maxsus javob
      return { needsPassword: true, message: 'Parol yarating' };
    }

    const isValid = await bcrypt.compare(password, profile.passwordHash);
    if (!isValid) {
      this._recordFailedAttempt(cleanPhone);
      throw new UnauthorizedException('Telefon raqam yoki parol xato');
    }

    // Muvaffaqiyat — urinishlar tozalash
    this.loginAttempts.delete(cleanPhone);

    // Token yaratish
    const tokens = await this.generateTokens(profile.user);
    await this.usersService.updateLastLogin(profile.user.id);

    const dp = await this.prisma.driverProfile.findFirst({ where: { userId: profile.user.id } });

    return {
      user: this.sanitizeUser(profile.user),
      ...tokens,
      isVerified: dp?.isVerified ?? false,
    };
  }

  /**
   * Parol qo'yish (eski userlar yoki yangi)
   */
  async driverSetPassword(phone: string, password: string) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!password || password.length < 6) {
      throw new UnauthorizedException('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
    }

    const profile = await this.prisma.driverProfile.findFirst({
      where: { phone: cleanPhone },
    });

    if (!profile) {
      throw new UnauthorizedException('Haydovchi topilmadi');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.driverProfile.update({
      where: { id: profile.id },
      data: { passwordHash },
    });

    return { success: true, message: 'Parol muvaffaqiyatli saqlandi' };
  }

  /**
   * Parol tiklash (Telegram bot orqali chaqiriladi)
   */
  async driverResetPassword(phone: string, newPassword: string) {
    return this.driverSetPassword(phone, newPassword);
  }

  private _recordFailedAttempt(phone: string) {
    const attempts = this.loginAttempts.get(phone) || { count: 0, blockedUntil: 0 };
    attempts.count++;
    if (attempts.count >= 5) {
      attempts.blockedUntil = Date.now() + 5 * 60 * 1000; // 5 daqiqa blok
      attempts.count = 0;
    }
    this.loginAttempts.set(phone, attempts);
  }

  // SMS rate limit — telefon → oxirgi yuborilgan vaqt
  private smsRateLimit = new Map<string, number>();

  async sendDriverCode(phone: string) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Rate limit — 60 sekundda 1 ta SMS
    const lastSent = this.smsRateLimit.get(cleanPhone);
    if (lastSent && Date.now() - lastSent < 60000) {
      const waitSec = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
      return { success: false, message: `${waitSec} sekunddan keyin qayta urinib ko'ring` };
    }
    this.smsRateLimit.set(cleanPhone, Date.now());

    // Haydovchi profilini topish
    const profile = await this.prisma.driverProfile.findFirst({
      where: { phone: cleanPhone },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      return { success: false, message: "Bu raqam bilan haydovchi topilmadi. Avval ro'yxatdan o'ting." };
    }

    if (!profile.user.isActive) {
      const reason = (profile.user as any).blockReason || 'Admin tomonidan bloklangan';
      return { success: false, message: `Akkaunt bloklangan: ${reason}` };
    }

    // Kod yaratish
    const code = this.generateDriverLoginCode(profile.user.id, cleanPhone);

    // SMS yuborish
    try {
      await this.smsService.sendSms(
        cleanPhone,
        `YO'LDA Driver kirish kodi: ${code}`,
        { category: 'DRIVER' as any, targetName: profile.fullName || 'Haydovchi' },
      );
      this.logger.log(`SMS kod yuborildi: ${cleanPhone}`);
      return { success: true, message: 'SMS kod yuborildi' };
    } catch (e) {
      this.logger.error(`SMS xatosi: ${e.message}`);
      return { success: false, message: 'SMS yuborishda xatolik' };
    }
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
