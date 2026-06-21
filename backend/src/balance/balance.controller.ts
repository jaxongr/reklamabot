import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Balance')
@ApiBearerAuth()
@Controller('balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Balans olish' })
  async getBalance(@Request() req: any) {
    return this.balanceService.getBalance(req.user.userId);
  }

  @Post('top-up')
  @ApiOperation({ summary: "Balans to'ldirish" })
  async topUp(
    @Request() req: any,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.balanceService.topUp(req.user.userId, body.amount, body.description);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Tranzaksiyalar tarixi' })
  async getTransactions(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.balanceService.getTransactions(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
