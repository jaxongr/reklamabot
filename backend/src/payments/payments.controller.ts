import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PaymentStatus, SubscriptionPlan } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  async create(
    @Request() req: any,
    @Body() body: {
      amount: number;
      planType: SubscriptionPlan;
      currency?: string;
      cardNumber?: string;
      receiptImage?: string;
      transactionId?: string;
    },
  ) {
    const { amount, planType, ...extra } = body;
    return this.paymentsService.create(req.user.userId, amount, planType, extra);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all payments (admin)' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll({ skip, take, status });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my payments' })
  async getMyPayments(@Request() req: any) {
    return this.paymentsService.findByUser(req.user.userId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get payment statistics' })
  async getStatistics() {
    return this.paymentsService.getStatistics();
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve payment' })
  async approve(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.approve(id, req.user.userId);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject payment' })
  async reject(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { reason: string },
  ) {
    return this.paymentsService.reject(id, req.user.userId, body.reason);
  }
}
