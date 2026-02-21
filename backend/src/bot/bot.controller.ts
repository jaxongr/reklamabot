import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('bot')
@Controller('bot')
export class BotController {
  @Get('info')
  @ApiOperation({ summary: 'Get bot info' })
  getBotInfo() {
    return {
      token: process.env.TELEGRAM_BOT_TOKEN,
      message: 'Bot is ready!',
      webhooks: {
        url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/bot/webhook`,
      },
    };
  }
}
