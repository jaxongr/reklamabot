import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Req,
  UseGuards, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { DriversService } from './drivers.service';
import { AuthService } from '../auth/auth.service';
import { SmsService } from '../sms/sms.service';

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  private readonly logger = new Logger(DriversController.name);

  constructor(
    private readonly driversService: DriversService,
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
  ) {}

  // ============================================================
  // BOTSIZ RO'YXATDAN O'TISH (auth kerak emas)
  // ============================================================

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Haydovchi ro\'yxatdan o\'tish (botsiz)' })
  async registerDriver(@Body() body: {
    fullName: string;
    phone: string;
    password?: string;
    passportNumber?: string;
    birthDate?: string;
    vehicleType: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehicleNumber?: string;
    vehicleYear?: string;
    vehicleCapacity?: string;
    bodyType?: string;
    region?: string;
    district?: string;
  }) {
    const result = await this.driversService.registerDriver(body);
    let smsSent = false;

    // Avtomatik SMS kod yuborish
    try {
      const code = this.authService.generateDriverLoginCode(
        result.userId,
        body.phone.replace(/[\s\-\(\)]/g, ''),
      );
      const smsResult = await this.smsService.sendSms(
        body.phone,
        `YO'LDA Driver: Ro'yxatdan o'tdingiz!\nKirish kodingiz: ${code}\nAdmin tasdiqlagandan keyin ilovaga kirishingiz mumkin.`,
        { category: 'DRIVER' as any, targetName: body.fullName },
      );
      smsSent = smsResult.success;
    } catch (e) {
      this.logger.warn(`Register SMS xatosi: ${e.message}`);
    }

    return { ...result, smsSent };
  }

  // ============================================================
  // HAYDOVCHI O'Z PROFILI
  // ============================================================

  @Get('profile')
  @ApiOperation({ summary: 'Haydovchi o\'z profilini olish' })
  getProfile(@Req() req: any) {
    return this.driversService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Profil yangilash' })
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.driversService.updateProfile(req.user.userId, body);
  }

  @Patch('online')
  @ApiOperation({ summary: 'Online/Offline o\'zgartirish' })
  setOnlineStatus(@Req() req: any, @Body() body: { isOnline: boolean }) {
    return this.driversService.setOnlineStatus(req.user.userId, body.isOnline);
  }

  @Patch('location')
  @ApiOperation({ summary: 'GPS joylashuv yangilash' })
  updateLocation(@Req() req: any, @Body() body: { lat: number; lng: number }) {
    return this.driversService.updateLocation(req.user.userId, body.lat, body.lng);
  }

  // ============================================================
  // DISPETCHER E'LONLARI (haydovchilar uchun)
  // ============================================================

  @Get('dispatcher-ads')
  @ApiOperation({ summary: 'Dispetcher e\'lonlarini olish (haydovchilar uchun)' })
  async getDispatcherAds(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('scope') scope?: string,
  ) {
    return this.driversService.getDispatcherAds({
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
      cargoFrom,
      cargoTo,
      vehicleType,
      scope,
    });
  }

  @Get('dispatcher-ads/count')
  @ApiOperation({ summary: 'Yangi dispetcher e\'lonlari soni' })
  async getDispatcherAdsCount() {
    return this.driversService.getDispatcherAdsCount();
  }

  @Post('dispatcher-ads/:adId/chat')
  @ApiOperation({ summary: 'Dispetcher bilan chat ochish (e\'lon bo\'yicha)' })
  async startChatWithDispatcher(
    @Req() req: any,
    @Param('adId') adId: string,
  ) {
    return this.driversService.startChatWithDispatcher(req.user.userId, adId);
  }

  // ============================================================
  // REYTING (haydovchi ↔ dispetcher)
  // ============================================================

  @Post('rate')
  @ApiOperation({ summary: 'Foydalanuvchini baholash (1-5 yulduz)' })
  async rateUser(
    @Req() req: any,
    @Body() body: { toUserId: string; score: number; comment?: string; orderId?: string },
  ) {
    return this.driversService.rateUser(req.user.userId, body);
  }

  @Get('rating/:userId')
  @ApiOperation({ summary: 'Foydalanuvchi reytingini olish' })
  async getUserRating(@Param('userId') userId: string) {
    return this.driversService.getUserRating(userId);
  }

  // ============================================================
  // BUYURTMALAR (Telegram yuklar)
  // ============================================================

  @Get('orders/telegram-dispatcher')
  @ApiOperation({ summary: 'Telegram dispetcher yuklari (bloklangan senderlar)' })
  getTelegramDispatcherOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('scope') scope?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('hoursAgo') hoursAgo?: string,
  ) {
    return this.driversService.getTelegramDispatcherOrders(req.user.userId, {
      page: parseInt(page || '1'),
      limit: parseInt(limit || '50'),
      scope,
      cargoFrom,
      cargoTo,
      hoursAgo: hoursAgo ? parseInt(hoursAgo) : undefined,
    });
  }

  @Get('orders/nearby')
  @ApiOperation({ summary: 'YO\'LDA yuklari — 100km radius' })
  getNearbyOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('vehicleType') vehicleType?: string,
  ) {
    return this.driversService.getNearbyOrders(req.user.userId, {
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
      cargoFrom,
      cargoTo,
      vehicleType,
    });
  }

  @Get('orders/accepted')
  @ApiOperation({ summary: 'Qabul qilingan zakazlarim' })
  getMyAcceptedOrders(
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    return this.driversService.getMyAcceptedOrders(req.user.userId, status);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Telegram yuklar ro\'yxati' })
  getOrders(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('scope') scope?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('nearMe') nearMe?: string,
  ) {
    return this.driversService.getOrders(req.user.userId, {
      type,
      cargoFrom,
      cargoTo,
      scope,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      nearMe: nearMe === 'true',
    });
  }

  @Post('orders/:id/accept')
  @ApiOperation({ summary: 'Telegram zakazni qabul qilish' })
  acceptTelegramOrder(@Req() req: any, @Param('id') id: string) {
    return this.driversService.acceptTelegramOrder(req.user.userId, id);
  }

  @Patch('orders/:id/tracking')
  @ApiOperation({ summary: 'Treking status yangilash' })
  updateTrackingStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.driversService.updateTrackingStatus(req.user.userId, id, body.status);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Bitta buyurtma' })
  getOrderById(@Param('id') id: string) {
    return this.driversService.getOrderById(id);
  }

  // ============================================================
  // TAKLIFLAR
  // ============================================================

  @Post('offers')
  @ApiOperation({ summary: 'Taklif yaratish' })
  createOffer(@Req() req: any, @Body() body: any) {
    return this.driversService.createOffer(req.user.userId, body);
  }

  @Get('offers')
  @ApiOperation({ summary: 'Barcha takliflar' })
  getOffers(
    @Query('status') status?: string,
    @Query('fromCity') fromCity?: string,
    @Query('toCity') toCity?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.getOffers({
      status,
      fromCity,
      toCity,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('offers/my')
  @ApiOperation({ summary: 'O\'z takliflari' })
  getMyOffers(@Req() req: any) {
    return this.driversService.getMyOffers(req.user.userId);
  }

  @Delete('offers/:id')
  @ApiOperation({ summary: 'Taklif bekor qilish' })
  cancelOffer(@Req() req: any, @Param('id') id: string) {
    return this.driversService.cancelOffer(req.user.userId, id);
  }

  // ============================================================
  // OBUNA TIZIMI
  // ============================================================

  @Get('subscription/plans')
  @ApiOperation({ summary: 'Haydovchi obuna rejalari' })
  getSubscriptionPlans() {
    return this.driversService.getDriverSubscriptionPlans();
  }

  @Get('subscription/my')
  @ApiOperation({ summary: 'Mening obuna holatim' })
  getMySubscription(@Req() req: any) {
    return this.driversService.getMySubscription(req.user.userId);
  }

  @Post('subscription/purchase')
  @ApiOperation({ summary: 'Obuna sotib olish' })
  purchaseSubscription(@Req() req: any, @Body() body: { planType: string }) {
    return this.driversService.purchaseSubscription(req.user.userId, body.planType);
  }

  // ============================================================
  // MAXSUS BUYURTMALAR
  // ============================================================

  @Get('private-orders')
  @ApiOperation({ summary: 'Mavjud maxsus buyurtmalar' })
  getAvailablePrivateOrders(@Req() req: any) {
    return this.driversService.getAvailablePrivateOrders(req.user.userId);
  }

  @Post('private-orders/:id/accept')
  @ApiOperation({ summary: 'Maxsus buyurtmani qabul qilish' })
  acceptPrivateOrder(@Req() req: any, @Param('id') id: string) {
    return this.driversService.acceptPrivateOrder(req.user.userId, id);
  }

  @Post('private-orders/:id/reject')
  @ApiOperation({ summary: 'Maxsus buyurtmani rad etish' })
  rejectPrivateOrder(@Req() req: any, @Param('id') id: string) {
    return this.driversService.rejectPrivateOrder(req.user.userId, id);
  }

  // ============================================================
  // MOS HAYDOVCHI TOPISH (Dispetcher e'loni uchun)
  // IMPORTANT: must be BEFORE admin/:id parameterized routes
  // ============================================================

  @Get('match-for-ad/:adId')
  @ApiOperation({ summary: "E'lon uchun mos haydovchi topish (3 manba: App, Taklif, Telegram)" })
  matchDriversForAd(@Param('adId') adId: string) {
    return this.driversService.matchForAd(adId);
  }

  // ============================================================
  // ADMIN ENDPOINTLAR — STATIC routes MUST come before :id
  // ============================================================

  @Get('admin/list')
  @ApiOperation({ summary: 'Barcha haydovchilar (admin)' })
  getAllDrivers(
    @Query('search') search?: string,
    @Query('isOnline') isOnline?: string,
    @Query('isVerified') isVerified?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.getAllDrivers({
      search,
      isOnline: isOnline !== undefined ? isOnline === 'true' : undefined,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('admin/available')
  @ApiOperation({ summary: 'Mavjud haydovchilar' })
  getAvailableDrivers(@Query('cargoFrom') cargoFrom?: string) {
    return this.driversService.getAvailableDrivers(cargoFrom);
  }

  @Get('admin/stats/overview')
  @ApiOperation({ summary: 'Haydovchilar statistikasi' })
  getDriverStats() {
    return this.driversService.getDriverStats();
  }

  @Get('admin/map/online')
  @ApiOperation({ summary: 'Online haydovchilar xaritada' })
  getOnlineDriversForMap() {
    return this.driversService.getOnlineDriversForMap();
  }

  @Get('admin/private-orders')
  @ApiOperation({ summary: 'Barcha maxsus buyurtmalar (admin)' })
  getAllPrivateOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.getAllPrivateOrders({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('admin/private-orders')
  @ApiOperation({ summary: 'Maxsus buyurtma yaratish (admin)' })
  createPrivateOrder(@Req() req: any, @Body() body: any) {
    return this.driversService.createPrivateOrder({
      ...body,
      createdById: req.user.userId,
    });
  }

  @Post('admin/link-to-order')
  @ApiOperation({ summary: 'Haydovchini buyurtmaga ulash' })
  linkDriverToOrder(@Body() body: { orderId: string; driverProfileId: string }) {
    return this.driversService.linkDriverToOrder(body.orderId, body.driverProfileId);
  }

  // ── Parameterized routes MUST come AFTER all static routes ──

  @Get('admin/:id')
  @ApiOperation({ summary: 'Haydovchi tafsilotlari (admin)' })
  getDriverById(@Param('id') id: string) {
    return this.driversService.getDriverById(id);
  }

  @Post('admin/:id/verify')
  @ApiOperation({ summary: 'Haydovchini tasdiqlash + avtomatik login kod SMS' })
  async verifyDriver(@Req() req: any, @Param('id') id: string) {
    const result = await this.driversService.verifyDriver(id, req.user.userId);

    // Tasdiqlangandan keyin avtomatik login kod yaratib SMS yuborish
    try {
      const profile = await this.driversService.getDriverById(id);
      if (profile?.phone) {
        const code = this.authService.generateDriverLoginCode(
          profile.user.id,
          profile.phone,
        );
        await this.smsService.sendSms(
          profile.phone,
          `YO'LDA Driver: Akkauntingiz tasdiqlandi!\nIlovaga kirish kodingiz: ${code}\nKod 24 soat amal qiladi.`,
          {
            sentById: req.user?.userId,
            category: 'DRIVER' as any,
            targetName: profile.fullName || 'Haydovchi',
          },
        );
        this.logger.log(`Verify + SMS kod yuborildi: ${profile.phone} → ${code}`);
      }
    } catch (e) {
      this.logger.warn(`Verify SMS yuborishda xato: ${e.message}`);
    }

    return result;
  }

  @Post('admin/:id/login-code')
  @ApiOperation({ summary: 'Haydovchiga login kod berish + SMS yuborish' })
  async generateLoginCode(@Param('id') id: string, @Req() req: any) {
    const profile = await this.driversService.getDriverById(id);
    if (!profile) {
      return { error: 'Haydovchi topilmadi' };
    }
    const code = this.authService.generateDriverLoginCode(
      profile.user.id,
      profile.phone || '',
    );

    // SMS yuborish
    let smsSent = false;
    if (profile.phone) {
      const smsResult = await this.smsService.sendSms(
        profile.phone,
        `YO'LDA Driver ilovasiga kirish kodingiz: ${code}\nKod 24 soat amal qiladi.`,
        {
          sentById: req.user?.userId,
          category: 'DRIVER' as any,
          targetName: profile.fullName || 'Haydovchi',
        },
      );
      smsSent = smsResult.success;
    }

    return {
      code,
      phone: profile.phone,
      fullName: profile.fullName,
      expiresIn: '24 soat',
      smsSent,
    };
  }

  @Post('admin/:id/balance')
  @ApiOperation({ summary: 'Balans o\'zgartirish' })
  updateBalance(@Param('id') id: string, @Body() body: { amount: number; description: string }) {
    return this.driversService.updateDriverBalance(id, body.amount, body.description);
  }

  @Post('admin/:id/subscription')
  @ApiOperation({ summary: 'Obuna berish/o\'chirish' })
  toggleSubscription(@Param('id') id: string, @Body() body: { active: boolean; days?: number }) {
    return this.driversService.toggleSubscription(id, body.active, body.days);
  }

  @Post('admin/create')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Haydovchi yaratish (admin/dashboard)' })
  async adminCreateDriver(@Body() body: {
    fullName: string;
    phone: string;
    vehicleType: string;
    vehicleCapacity?: string;
    vehicleNumber?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    bodyType?: string;
    region?: string;
  }) {
    return this.driversService.registerDriver({
      ...body,
      vehicleNumber: body.vehicleNumber || 'YANGI',
    });
  }

  @Patch('admin/:id/profile')
  @ApiOperation({ summary: 'Haydovchi profilini tahrirlash (admin)' })
  adminUpdateProfile(@Param('id') id: string, @Body() body: any) {
    return this.driversService.adminUpdateProfile(id, body);
  }

  // ============================================================
  // Task 9: TAKLIF TIZIMI
  // ============================================================

  @Post('referral/generate')
  @ApiOperation({ summary: 'Taklif kodi yaratish' })
  generateReferralCode(@Req() req: any) {
    return this.driversService.generateReferralCode(req.user.userId);
  }

  @Post('referral/use')
  @ApiOperation({ summary: 'Taklif kodini ishlatish' })
  processInvite(@Req() req: any, @Body() body: { code: string }) {
    return this.driversService.processInvite(body.code, req.user.userId);
  }

  @Get('referral/stats')
  @ApiOperation({ summary: 'Taklif statistikasi' })
  getInviteStats(@Req() req: any) {
    return this.driversService.getInviteStats(req.user.userId);
  }

  // ============================================================
  // Task 21: FOTOKONTROL
  // ============================================================

  @Post('photos/:type')
  @ApiOperation({ summary: 'Mashina fotosini yuklash' })
  uploadVehiclePhoto(
    @Req() req: any,
    @Param('type') type: string,
    @Body() body: { url: string },
  ) {
    return this.driversService.uploadVehiclePhoto(req.user.userId, type, body.url);
  }

  @Get('photos')
  @ApiOperation({ summary: 'Mening fotolarim' })
  getVehiclePhotos(@Req() req: any) {
    return this.driversService.getVehiclePhotos(req.user.userId);
  }

  @Get('admin/photos/pending')
  @ApiOperation({ summary: 'Tasdiqlanmagan fotolar (admin)' })
  getPendingPhotos(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.driversService.getPendingPhotos(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('admin/photos/:id/approve')
  @ApiOperation({ summary: 'Fotoni tasdiqlash' })
  approvePhoto(@Param('id') id: string, @Req() req: any) {
    return this.driversService.approvePhoto(id, req.user.userId);
  }

  @Patch('admin/photos/:id/reject')
  @ApiOperation({ summary: 'Fotoni rad etish' })
  rejectPhoto(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.driversService.rejectPhoto(id, body.reason);
  }

}
