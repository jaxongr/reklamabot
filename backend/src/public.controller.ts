import { Controller, Get, Res } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class PublicController {
  @Public()
  @Get('privacy.html')
  privacy(@Res() res: any) {
    return res.sendFile(join(__dirname, '..', '..', 'public', 'privacy.html'));
  }

  @Public()
  @Get('terms.html')
  terms(@Res() res: any) {
    return res.sendFile(join(__dirname, '..', '..', 'public', 'terms.html'));
  }
}
