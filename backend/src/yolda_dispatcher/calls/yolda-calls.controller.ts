import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { YoldaCallsService } from './yolda-calls.service';
import { YoldaDispatcherGuard } from '../auth/yolda-dispatcher.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Yolda Dispatcher — Calls')
@Controller('yolda-dispatcher/calls')
export class YoldaCallsController {
  constructor(private readonly svc: YoldaCallsService) {}

  // ============== Dispatcher endpoints ==============

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post('start')
  @ApiOperation({ summary: 'Qo\'ng\'iroq boshlandi' })
  start(
    @Req() req: any,
    @Body()
    body: {
      phone: string;
      direction: 'INBOUND' | 'OUTBOUND';
      lat?: number;
      lng?: number;
      zoneId?: string;
    },
  ) {
    return this.svc.startCall(req.yoldaDispatcherId, body);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post(':id/end')
  @ApiOperation({ summary: 'Qo\'ng\'iroq tugadi' })
  end(@Param('id') id: string, @Body() body: { durationSec?: number }) {
    return this.svc.endCall(id, body);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Patch(':id/classify')
  @ApiOperation({ summary: 'Mashina turi/role tanlash' })
  classify(
    @Param('id') id: string,
    @Body()
    body: {
      vehicleType?: string;
      vehicleCapacity?: string;
      senderRole?: 'CARGO_OWNER' | 'DRIVER' | 'UNKNOWN' | 'SPAM';
      notes?: string;
    },
  ) {
    return this.svc.classify(id, body);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Post(':id/voice')
  @ApiOperation({ summary: 'Voice faylni Telegram guruhga yuborish (DB\'ga yozilmaydi)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('voice', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    }),
  )
  async uploadVoice(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) return { ok: false, error: 'Fayl yo\'q' };
    return this.svc.uploadVoice(id, file.buffer, file.originalname, file.mimetype);
  }

  @UseGuards(YoldaDispatcherGuard)
  @ApiBearerAuth()
  @Get('history')
  @ApiOperation({ summary: 'Dispetcher qo\'ng\'iroq tarixi' })
  history(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('direction') direction?: 'INBOUND' | 'OUTBOUND',
    @Query('phone') phone?: string,
  ) {
    return this.svc.history(req.yoldaDispatcherId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      direction,
      phone,
    });
  }

  // ============== Admin endpoints ==============

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Get('admin/list')
  @ApiOperation({ summary: 'Admin — barcha qo\'ng\'iroqlar' })
  adminList(
    @Query('dispatcherId') dispatcherId?: string,
    @Query('vehicleType') vehicleType?: string,
    @Query('senderRole') senderRole?: string,
    @Query('phone') phone?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.svc.adminList({
      dispatcherId,
      vehicleType,
      senderRole,
      phone,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Get('admin/stats')
  adminStats(@Query('dispatcherId') dispatcherId?: string, @Query('days') days?: string) {
    return this.svc.stats({
      dispatcherId,
      days: days ? parseInt(days, 10) : undefined,
    });
  }
}
