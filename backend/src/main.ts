import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

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
