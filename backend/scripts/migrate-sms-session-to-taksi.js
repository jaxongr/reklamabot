/**
 * sms-reklama sessiyalarini → reklama_bot TAKSI MonitorSession ga ko'chirish.
 *
 * sms-reklama (sms_reklama DB, `sessions` jadvali, `session_string`) gramjs StringSession ishlatadi —
 * bizning MonitorSession bilan bir xil format. Bu skript ularni TAKSI moduliga ko'chiradi.
 *
 * ⚠️ DIQQAT:
 *  1. Bir sessiyani 2 joyda (sms-reklama + taksi) parallel ishlatish Telegram konfliktini berishi mumkin.
 *     Ko'chirishdan oldin sms-reklamada o'sha sessiyani to'xtatish kerakmi — aniqlang.
 *  2. Ko'chirilгач taksi monitoring ISHGA TUSHADI (sessiya ACTIVE bo'ladi). User tayyor bo'lganda ishlating.
 *
 * Ishlatish (serverда):
 *   cd /var/www/reklama-bot/backend
 *   npm i pg                                  # pg kerak (bir martalik)
 *   SMS_DB_URL="postgresql://USER:PASS@localhost:5432/sms_reklama" \
 *   TAKSI_ADMIN_USERNAME="jaxong1r" \
 *   ACTIVATE="false" \                        # true = status ACTIVE (monitoring boshlanadi), false = INACTIVE (faqat ko'chiradi)
 *   node scripts/migrate-sms-session-to-taksi.js
 *
 * SMS_DB_URL — sms-reklama/.env dagi DB connection (DATABASE_URL yoki PG* dan tuzing).
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('pg');

const prisma = new PrismaClient();

async function main() {
  const smsUrl = process.env.SMS_DB_URL;
  if (!smsUrl) throw new Error('SMS_DB_URL kerak (sms_reklama DB connection)');
  const adminUsername = process.env.TAKSI_ADMIN_USERNAME || 'jaxong1r';
  const activate = process.env.ACTIVATE === 'true';
  const targetStatus = activate ? 'ACTIVE' : 'INACTIVE';

  // Target admin (sessiyalar egasi)
  const admin = await prisma.user.findFirst({ where: { username: adminUsername } });
  if (!admin) throw new Error(`Admin topilmadi: ${adminUsername}`);

  // Source: sms_reklama sessions
  const sms = new Client({ connectionString: smsUrl });
  await sms.connect();
  const { rows } = await sms.query(
    "SELECT phone, name, session_string FROM sessions WHERE session_string IS NOT NULL AND length(session_string) > 10",
  );
  await sms.end();

  console.log(`Topildi: ${rows.length} ta sessiya (session_string bilan)`);

  let created = 0;
  let skipped = 0;
  for (const r of rows) {
    const phone = String(r.phone || '').trim();
    if (!phone) { skipped++; continue; }
    // Duplikat: shu telefon TAKSI sessiyasi bormi
    const exists = await prisma.monitorSession.findFirst({
      where: { phone, businessModule: 'TAKSI' },
    });
    if (exists) {
      console.log(`SKIP (allaqachon bor): ${phone}`);
      skipped++;
      continue;
    }
    await prisma.monitorSession.create({
      data: {
        userId: admin.id,
        businessModule: 'TAKSI',
        name: r.name || `Taksi ${phone.slice(-4)}`,
        phone,
        sessionString: r.session_string,
        status: targetStatus,
      },
    });
    console.log(`KO'CHIRILDI: ${phone} (${targetStatus})`);
    created++;
  }

  console.log(`\nTayyor. Ko'chirildi: ${created}, o'tkazildi: ${skipped}.`);
  if (!activate) {
    console.log("Status INACTIVE — monitoring boshlanmadi. Faollashtirish uchun: dashboard → 🚕 Taksi → Monitoring,");
    console.log("yoki ACTIVATE=true bilan qayta ishlating, keyin pm2 restart reklama-bot-api.");
  } else {
    console.log("Status ACTIVE — pm2 restart reklama-bot-api qiling, taksi monitoring boshlanadi.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('XATO:', e.message);
  process.exit(1);
});
