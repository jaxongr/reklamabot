import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
  UseGuards,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PostingService } from '../posts/posting.service';
import { PrismaService } from '../common/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus, OrderType, OrderScope, UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  // Cooldown: userId → lastUsedAt (3 daqiqa)
  private readonly findDriverCooldown = new Map<string, Date>();

  constructor(
    private readonly ordersService: OrdersService,
    private readonly postingService: PostingService,
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: "Buyurtmalar ro'yxati" })
  async findAll(
    @Request() req: any,
    @Query('status') status?: OrderStatus,
    @Query('type') type?: OrderType,
    @Query('scope') scope?: OrderScope,
    @Query('search') search?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('isForSale') isForSale?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('module') module?: string,
  ) {
    return this.ordersService.findAll(undefined, {
      module: module || 'LOGISTIKA',
      status,
      type,
      scope,
      search,
      cargoFrom,
      cargoTo,
      vehicleType,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      isForSale: isForSale === 'true' ? true : isForSale === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Buyurtma statistikasi' })
  async getStats(@Request() req: any, @Query('module') module?: string) {
    const role = req.user.role;
    const canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
    return this.ordersService.getStats(canSeeAll ? undefined : req.user.userId, module || 'LOGISTIKA');
  }

  @Get('recent')
  @ApiOperation({ summary: "So'nggi buyurtmalar" })
  async getRecent(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const role = req.user.role;
    const canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
    return this.ordersService.getRecent(
      canSeeAll ? undefined : req.user.userId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('city-suggestions')
  @ApiOperation({ summary: 'Shahar takliflari (autocomplete)' })
  getCitySuggestions(@Query('q') q: string) {
    return this.ordersService.getCitySuggestions(q || '');
  }

  @Get('for-sale')
  @ApiOperation({ summary: 'Sotuvdagi buyurtmalar' })
  async getForSaleOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getForSaleOrders(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('accepted')
  @ApiOperation({ summary: 'Qabul qilingan buyurtmalar' })
  async getAcceptedOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getAcceptedOrders(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('all-accepted')
  @ApiOperation({ summary: 'Barcha qabul qilingan zakazlar (dashboard)' })
  async getAllAcceptedOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.getAllAcceptedOrders({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }

  @Get('route')
  @ApiOperation({ summary: 'OSRM routing proxy' })
  async getRoute(
    @Query('coords') coords: string,
    @Query('fromLat') fromLat?: string,
    @Query('fromLng') fromLng?: string,
    @Query('toLat') toLat?: string,
    @Query('toLng') toLng?: string,
  ) {
    const c = coords || `${fromLng},${fromLat};${toLng},${toLat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${c}?overview=full&geometries=geojson`;
    try {
      const https = await import('https');
      return new Promise((resolve) => {
        https.get(url, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch { resolve({ code: 'Error', message: 'JSON parse error' }); }
          });
        }).on('error', (e) => {
          this.logger.error(`OSRM proxy error: ${e}`);
          resolve({ code: 'Error', message: String(e) });
        });
      });
    } catch (e) {
      this.logger.error(`OSRM proxy error: ${e}`);
      return { code: 'Error', message: String(e) };
    }
  }

  @Get('unique-phones')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Unikal telefon raqamlar' })
  async getUniquePhones(
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getUniquePhones({
      type: type as any,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      cargoFrom,
      cargoTo,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('unique-phones/export')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Unikal raqamlar TXT eksport' })
  async exportUniquePhones(
    @Res() res: any,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('cargoFrom') cargoFrom?: string,
    @Query('cargoTo') cargoTo?: string,
  ) {
    const phones = await this.ordersService.getUniquePhonesExport({
      type: type as any,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      cargoFrom,
      cargoTo,
    });

    const content = phones.join('\n');
    const typeLabel = type === 'CARGO' ? 'dispetcher' : type === 'DRIVER' ? 'haydovchi' : 'barcha';
    const filename = `unikal_raqamlar_${typeLabel}_${new Date().toISOString().slice(0, 10)}.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get('blocked-phones')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Bloklangan senderlar raqamlari' })
  async getBlockedPhones(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getBlockedPhones({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('blocked-phones/export')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Bloklangan raqamlar TXT eksport' })
  async exportBlockedPhones(
    @Res() res: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const phones = await this.ordersService.getBlockedPhonesExport({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    const filename = `bloklangan_raqamlar_${new Date().toISOString().slice(0, 10)}.txt`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(phones.join('\n'));
  }

  @Get('closed-deals')
  @ApiOperation({ summary: 'Yopilgan bitimlar' })
  async getClosedDeals(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const role = req.user.role;
    const canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
    return this.ordersService.getClosedDeals(
      canSeeAll ? undefined : req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta buyurtma' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: "Qo'lda buyurtma yaratish" })
  async createManual(
    @Request() req: any,
    @Body() body: {
      cargoFrom: string;
      cargoTo: string;
      cargoType?: string;
      cargoWeight?: string;
      price?: string;
      phone?: string;
      vehicleType?: string;
      vehicleCapacity?: string;
      messageText?: string;
      type?: OrderType;
      isForSale?: boolean;
      salePrice?: string;
    },
  ) {
    return this.ordersService.createManual(
      req.user.userId,
      req.user.userId,
      body,
    );
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Buyurtma qabul qilish' })
  async acceptOrder(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.ordersService.acceptOrder(id, req.user.userId);
  }

  @Post(':id/close-deal')
  @ApiOperation({ summary: 'Yuk yopish' })
  async closeDeal(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { amount: number },
  ) {
    return this.ordersService.closeDeal(id, req.user.userId, body.amount);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Status o'zgartirish" })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; acceptedStatus?: string; notes?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.notes, body.acceptedStatus);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Buyurtma yangilash' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      cargoFrom?: string;
      cargoTo?: string;
      cargoType?: string;
      cargoWeight?: string;
      price?: string;
      phone?: string;
      notes?: string;
      status?: OrderStatus;
    },
  ) {
    return this.ordersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Buyurtma o'chirish" })
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Post(':id/find-driver')
  @ApiOperation({ summary: 'Haydovchi topish — buyurtmani guruxlarga tarqatish' })
  async findDriver(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { phone?: string },
  ) {
    const userId = req.user.userId;

    // 1. Cooldown tekshirish — 3 daqiqa
    const cooldownMs = 3 * 60 * 1000;
    const lastUsed = this.findDriverCooldown.get(userId);
    if (lastUsed) {
      const elapsed = Date.now() - lastUsed.getTime();
      if (elapsed < cooldownMs) {
        const remainSec = Math.ceil((cooldownMs - elapsed) / 1000);
        throw new HttpException(
          `${remainSec} soniya kutish kerak`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // 2. Orderni topish (faqat qabul qilingan buyurtma)
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi');
    }
    if (order.acceptedById !== userId) {
      throw new BadRequestException('Bu buyurtma sizga tegishli emas');
    }

    // 3. Raqam almashtirish — body.phone yoki DB dan
    let content = order.messageText || '';
    let replacementPhone = body?.phone?.trim() || '';

    // Body'da phone bo'lmasa — DB dan olish
    if (!replacementPhone) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { adPhoneNumbers: true },
      });
      if (user?.adPhoneNumbers && user.adPhoneNumbers.length > 0) {
        replacementPhone = user.adPhoneNumbers[0];
      }
    }

    if (replacementPhone) {
      const phoneRegex = /(\+?\d[\d\s\-.()\u00A0]{6,18}\d)/g;
      const replaced = content.replace(phoneRegex, replacementPhone);
      if (replaced === content) {
        content = content.trim() + '\n📞 ' + replacementPhone;
      } else {
        content = replaced;
      }
    }

    if (!content.trim()) {
      throw new BadRequestException('Buyurtma matni bo\'sh');
    }

    this.logger.log(
      `🔍 Find-driver: orderId=${id}, phone=${replacementPhone || 'YO\'Q'}, contentLen=${content.length}`,
    );

    // 4. Cooldown belgilash + broadcastCount increment
    const now = new Date();
    this.findDriverCooldown.set(userId, now);
    const cooldownUntil = new Date(now.getTime() + cooldownMs).toISOString();

    // Broadcast count oshirish
    await this.prisma.order.update({
      where: { id },
      data: { broadcastCount: { increment: 1 } },
    }).catch(() => {});

    // 5. Pre-count: totalGroups va sessionCount hisoblash (mobile banner uchun)
    let totalGroups = 0;
    let sessionCount = 0;
    try {
      const userSessions = await this.prisma.session.findMany({
        where: { userId, status: 'ACTIVE', isFrozen: false, sessionString: { not: null } },
        include: { groups: { where: { isActive: true }, select: { telegramId: true } } },
      });
      sessionCount = userSessions.length;
      const uniqueTgIds = new Set<string>();
      for (const s of userSessions) {
        for (const g of s.groups) {
          uniqueTgIds.add(g.telegramId);
        }
      }
      totalGroups = uniqueTgIds.size;
    } catch (_) {}

    // 6. BroadcastOnce — FONDA yuborish (non-blocking) + WS progress
    // orderId ni in-memory status ga saqlash (mobile reconnect uchun)
    this.postingService.setBroadcastOnceOrderId(userId, id);

    this.postingService.broadcastOnce(content, userId, id, (payload) => {
      try {
        this.gateway.sendToUser(userId, 'find-driver:progress', {
          orderId: id,
          ...payload,
        });
      } catch (e) {
        this.logger.warn(`WS progress emit xatolik: ${e.message}`);
      }
    }).then((result) => {
      this.logger.log(
        `🔍 Haydovchi topish yakunlandi: orderId=${id}, sent=${result.sent}, failed=${result.failed}, total=${result.total}, sessions=${result.sessionCount}, unique=${result.uniqueGroupsSent}`,
      );
    }).catch((error) => {
      this.logger.error(`🔍 Find-driver xatolik: orderId=${id}, userId=${userId}, error=${error.message}`);
      try {
        this.gateway.sendToUser(userId, 'find-driver:progress', {
          orderId: id,
          status: 'error',
          sent: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          sessionCount: 0,
          uniqueGroupsSent: 0,
          error: error.message,
        });
      } catch (_) {}
    });

    return {
      status: 'sending',
      message: 'Guruhlarga yuborilmoqda...',
      cooldownUntil,
      totalGroups,
      sessionCount,
    };
  }

  @Get('broadcast-status')
  @ApiOperation({ summary: 'Faol broadcast holatini olish (mobile reconnect uchun)' })
  getBroadcastStatus(@Request() req: any) {
    const userId = req.user.userId;
    const state = this.postingService.getBroadcastOnceStatus(userId);
    if (!state) {
      return { status: 'idle' };
    }
    return {
      status: state.status,
      orderId: state.orderId,
      sent: state.sent,
      failed: state.failed,
      skipped: state.skipped,
      total: state.total,
      sessionCount: state.sessionCount,
      uniqueGroupsSent: state.uniqueGroupsSent,
    };
  }

  @Post('stop-broadcast')
  @ApiOperation({ summary: "Tarqatishni to'xtatish" })
  stopBroadcast(@Request() req: any) {
    const userId = req.user.userId;
    this.postingService.cancelBroadcastOnce(userId);

    // WS orqali mobile'ga xabar berish
    try {
      this.gateway.sendToUser(userId, 'find-driver:progress', {
        status: 'completed',
        sent: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        sessionCount: 0,
        uniqueGroupsSent: 0,
      });
    } catch {}

    return { status: 'stopped', message: "Tarqatish to'xtatildi" };
  }

  @Patch('batch/status')
  @ApiOperation({ summary: "Bir nechta buyurtma statusini o'zgartirish" })
  async batchUpdateStatus(
    @Body() body: { ids: string[]; status: OrderStatus },
  ) {
    return this.ordersService.batchUpdateStatus(body.ids, body.status);
  }
}
