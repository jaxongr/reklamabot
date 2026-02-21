export interface JwtPayload {
  sub: string;
  telegramId: string;
  role: string;
  iat?: number;
  exp?: number;
}
