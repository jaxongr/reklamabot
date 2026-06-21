'use strict';
const { initTables } = require('./db');
const tg = require('./telegram');
const sender = require('./sender');
const { startServer } = require('./server');
const config = require('./config');

async function main() {
  console.log('=== SMS-REKLAMA ishga tushmoqda ===');
  if (!config.tgApiId || !config.tgApiHash) {
    console.error('XATO: TG_API_ID / TG_API_HASH .env da yo\'q');
    process.exit(1);
  }

  await initTables();

  // Web panel (sessiya qo'shish, sozlash, yuborish)
  startServer();

  // Mavjud sessiyalarni ulab, monitoringni boshlash
  await tg.startAllSessions();

  // SMS avto-yuborish (agar yoqilgan bo'lsa)
  sender.startAutoSender();

  console.log('=== Tayyor. Web panel:  http://<server-ip>:' + config.port + ' ===');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});

process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e && e.message));
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e && e.message));
