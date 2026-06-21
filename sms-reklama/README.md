# SMS-REKLAMA — mustaqil tizim

Telegram guruhlardan telefon raqamlarini yig'ib, ularga SMS reklama yuboradi.
**Asosiy "Reklama bot" loyihasiga ALOQASI YO'Q** — alohida papka, alohida DB (`sms_reklama`),
alohida port (4010), alohida PM2 process (`sms-reklama`). Boshqa loyihalarga ta'sir qilmaydi.

## Imkoniyatlar
- 20 tagacha Telegram session (multi-session) — har biri guruhlarni kuzatadi
- Xabarlardan O'zbek raqamlarini avtomatik ajratib oladi (dublikatsiz)
- Raqamlar PostgreSQL bazasida saqlanadi (`sms_reklama`)
- SemySMS API orqali SMS reklama yuborish (qo'lda yoki avtomatik)
- Web panel: session qo'shish, raqamlar, sozlamalar, yuborish

## O'rnatish (server)
```bash
cd /root/sms-reklama
npm install
node src/db.js --init        # jadvallarni yaratadi
pm2 start ecosystem.config.js
pm2 save
```

## DB (bir marta, server)
```sql
CREATE USER sms_user WITH PASSWORD '...';
CREATE DATABASE sms_reklama OWNER sms_user;
```
`.env` dagi `DATABASE_URL` shu user/parol/baza bilan to'g'ri bo'lsin.

## Ishlatish
1. Brauzerda: `http://<server-ip>:4010` → parol (`.env` ADMIN_PASSWORD)
2. **Session qo'shish:** telefon raqam → "Kod yuborish" → Telegram'dan kelgan kodni kiriting → "Tasdiqlash". 20 tagacha takrorlang.
3. **Sozlamalar:** reklama matni + SemySMS token/device kiriting → Saqlash.
4. Sessiyalar avtomatik guruhlarni kuzatib, raqamlarni yig'a boshlaydi.
5. **SMS yuborish:** "Yuborish" tugmasi — yig'ilган (yuborilmagan) raqamlarga reklama ketadi.

## .env muhim sozlamalar
- `TG_API_ID`, `TG_API_HASH` — Telegram ilova kalitlari
- `DATABASE_URL` — alohida `sms_reklama` bazasi
- `PORT` — 4010 (boshqa loyihalar bilan to'qnashmaydi)
- `ONLY_CARGO` — true bo'lsa faqat yuk xabarlaridagi raqamlar
- `SMS_AUTO_SEND` — true bo'lsa avtomatik yuboradi
- `SMS_PER_HOUR`, `SMS_DELAY_SEC` — flood/ban oldini olish

## Xavfsizlik / izolyatsiya
- Boshqa PM2 loyihalariga (autobazar, avtosalon) TEGMAYDI
- Redis ISHLATMAYDI
- nginx'ga tegmaydi (to'g'ridan IP:4010)
- O'z bazasi, o'z node_modules
