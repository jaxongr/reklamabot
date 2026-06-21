// Toshkent vaqti — barcha new Date() va toLocaleString() shu timezone da ishlaydi
process.env.TZ = 'Asia/Tashkent';

// gramJS TIMEOUT xatoliklari uncaught rejection sifatida chiqishi mumkin — process crash oldini olish
process.on('unhandledRejection', (reason: any) => {
  const msg = reason?.message || String(reason);
  // gramJS TIMEOUT va "Not connected" — normal reconnect flow, ignore
  if (msg === 'TIMEOUT' || msg === 'Not connected' || msg.includes('CONNECTION_NOT_INITED')) {
    return;
  }
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  const msg = error?.message || '';
  if (msg === 'TIMEOUT' || msg === 'Not connected') {
    return;
  }
  console.error('Uncaught Exception:', error);
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['/privacy.html', '/terms.html', 'privacy.html', 'terms.html'],
  });

  // Static assets — chek rasmlari uchun
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Public sahifalar (privacy policy, terms)
  app.useStaticAssets(join(process.cwd(), 'public'));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Telegram Reklama Bot API')
    .setDescription('Telegram guruhlarga avtomatik reklama yuboruvchi bot')
    .setVersion('1.0')
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User Management')
    .addTag('subscriptions', 'Subscription Plans')
    .addTag('payments', 'Payment Processing')
    .addTag('sessions', 'Telegram Sessions')
    .addTag('groups', 'Telegram Groups')
    .addTag('ads', 'Advertisement Management')
    .addTag('posts', 'Post Distribution')
    .addTag('analytics', 'Statistics & Analytics')
    .addTag('config', 'System Configuration')
    .addTag('upload', 'File Upload')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
🚀 Application is running on: http://localhost:${port}
📚 API Documentation: http://localhost:${port}/api/docs
🔑 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing'}
🗄 Database: ${process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing'}
🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? '✓ Configured' : '✗ Missing'}
  `);
}

bootstrap();
