import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class YoldaDispatcherGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers?.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Token yo\'q');

    try {
      const payload: any = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET || 'default-secret',
      });
      if (!payload?.yoldaDispatcherId) {
        throw new UnauthorizedException('Yolda dispatcher token emas');
      }
      req.yoldaDispatcherId = payload.yoldaDispatcherId;
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token xato yoki muddati o\'tgan');
    }
  }
}
