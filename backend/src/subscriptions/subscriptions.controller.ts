import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SubscriptionPlan } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get all subscription plans' })
  async getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my subscription' })
  async getMySubscription(@Request() req: any) {
    return this.subscriptionsService.findByUser(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  async create(
    @Request() req: any,
    @Body() body: { planType: SubscriptionPlan },
  ) {
    return this.subscriptionsService.create(req.user.userId, body.planType);
  }

  @Patch('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  async upgrade(
    @Request() req: any,
    @Body() body: { planType: SubscriptionPlan },
  ) {
    return this.subscriptionsService.upgrade(req.user.userId, body.planType);
  }

  @Delete()
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@Request() req: any) {
    return this.subscriptionsService.cancel(req.user.userId);
  }
}
