# 🚚 MIGRATION RUNBOOK — Reklama Bot (Logistika + Taksi)

> **Yo'nalish:** migratsiya **YANGI serverda turib** bajariladi — yangi server ESKI serverga (`avtosalon` = 13.140.185.38) **parol bilan SSH** ulanib, hamma narsani **tortib oladi (pull)**, keyin o'zида o'rnatadi.
> Bu fayl GitHub'ga xavfsiz (sirlar yo'q). Maxfiy qiymatlar ESKI serverning `.env` da (pull qilinadi) va lokal Claude memory'да.

## ⚠️ ENG MUHIM QOIDALAR
1. **Bir vaqtda faqat BITTA instans.** Telegram bot tokeni va userbot sessiyalari ikki joyda parallel ishlasa — 409 conflict / sessiya ban. Yangi server tayyor bo'lib, tekshirilгач — **eskini to'xtating** (`ssh root@13.140.185.38 "pm2 stop reklama-bot-api"`).
2. Eski server (avtosalon) **parol bilan SSH qabul qiladi** (yoqilgan): `root@13.140.185.38`, parol memory'да (`server-avtosalon-access`).

---

## FAZA -1 — Bootstrap (yangi serverда Claude shu yerdan boshlaydi)

Kerak (user beradi yoki memory'да): **eski server** = `13.140.185.38`, root parol. Yangi serverда:
```bash
apt update && apt install -y sshpass postgresql postgresql-contrib redis-server nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
npm i -g pm2

# Qulaylik uchun o'zgaruvchi:
export OLD="root@13.140.185.38"
export OLDPASS='<ESKI ROOT PAROL — memory: server-avtosalon-access>'
sshx() { sshpass -p "$OLDPASS" ssh -o StrictHostKeyChecking=accept-new "$OLD" "$@"; }
scpx() { sshpass -p "$OLDPASS" scp -o StrictHostKeyChecking=accept-new "$@"; }
```

---

## FAZA 0 — Eski serverda snapshot yaratish (yangi serverdan turib)

```bash
sshx "PGPASSWORD=$DBPASS pg_dump -h 127.0.0.1 -U reklama_user -Fc --no-owner --no-privileges -d reklama_bot -f /tmp/reklama_bot.dump"
sshx "cd /var/www/reklama-bot && tar --exclude='backend/node_modules' --exclude='dashboard/node_modules' --exclude='backend/dist' --exclude='dashboard/dist' -czf /tmp/reklama_src.tgz backend dashboard"
sshx "cp /var/www/reklama-bot/backend/.env /tmp/reklama_backend.env; cp /etc/nginx/sites-available/reklama-bot /tmp/reklama_nginx.conf"
```

## FAZA 1 — Tortib olish (pull → yangi server)

```bash
mkdir -p /var/www/reklama-bot /root/_mig
scpx "$OLD:/tmp/reklama_bot.dump" "$OLD:/tmp/reklama_src.tgz" "$OLD:/tmp/reklama_backend.env" "$OLD:/tmp/reklama_nginx.conf" /root/_mig/
```

## FAZA 2 — DB + user yaratish, tiklash

```bash
sudo -u postgres psql -c "CREATE ROLE reklama_user LOGIN PASSWORD '$DBPASS';" 2>/dev/null || true
sudo -u postgres createdb -O reklama_user reklama_bot 2>/dev/null || true
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='reklama_bot' AND pid<>pg_backend_pid();" >/dev/null 2>&1
sudo -u postgres psql -c "DROP DATABASE IF EXISTS reklama_bot;" && sudo -u postgres createdb -O reklama_user reklama_bot
PGPASSWORD=$DBPASS pg_restore -h 127.0.0.1 -U reklama_user --no-owner --no-privileges -d reklama_bot /root/_mig/reklama_bot.dump
```

## FAZA 3 — Kod + .env + build

```bash
tar -xzf /root/_mig/reklama_src.tgz -C /var/www/reklama-bot
cp /root/_mig/reklama_backend.env /var/www/reklama-bot/backend/.env
# .env'ni yangi hostga moslang (NEW_IP — yangi server IP yoki domen):
#   FRONTEND_URL="http://NEW_IP:8100"   MINI_APP_URL="http://NEW_IP:8100/mini/"
#   (PORT=4030, REDIS_DB=5, DATABASE_URL .../reklama_bot — odatda o'zgarmaydi)

cd /var/www/reklama-bot/backend
npm ci
npx prisma generate
npx prisma db push --skip-generate    # schema dump bilan kelgan, lekin moslik uchun
npx nest build                        # entry: dist/src/main.js

cd /var/www/reklama-bot/dashboard
npm ci
VITE_API_URL=http://NEW_IP:8100/api/v1 npx vite build   # NE npm run build (tsc strict)
```

## FAZA 4 — nginx + ufw + PM2

```bash
cp /root/_mig/reklama_nginx.conf /etc/nginx/sites-available/reklama-bot
# Ichida: listen 8100; root /var/www/reklama-bot/dashboard/dist; /api+/socket.io+/uploads → 127.0.0.1:4030
ln -sf /etc/nginx/sites-available/reklama-bot /etc/nginx/sites-enabled/reklama-bot
nginx -t && nginx -s reload
ufw allow 8100/tcp 2>/dev/null || true    # + cloud Security Group'да ham 8100 ochilsin

cd /var/www/reklama-bot/backend
pm2 start dist/src/main.js --name reklama-bot-api --update-env
pm2 save && pm2 startup    # ko'rsatilgan startup qatorini ishga tushiring
```

## FAZA 5 — Tekshirish (yangi server)

```bash
curl -s -X POST http://127.0.0.1:4030/api/v1/auth/admin-login -H 'Content-Type: application/json' -d '{"username":"jaxong1r","password":"<PAROL_memory>"}' -w '\n[%{http_code}]\n'
sleep 20; grep -E 'Yangi CARGO|Yuk bot @|Taksi bot' /var/www/reklama-bot/backend/logs/pm2-out-*.log | tail
# Dashboard: http://NEW_IP:8100  (login jaxong1r / <PAROL_memory>)
# Cargo bot: curl .../api/v1/cargo-bot/info → running:true
```

## FAZA 6 — Eskini to'xtatish (konfliktni oldini olish)

Yangi server ishlab, logistika monitoring va botlar tasdiqlangач:
```bash
sshx "pm2 stop reklama-bot-api"     # eski polling to'xtaydi
# Butunlay: sshx "pm2 delete reklama-bot-api"
```

## FAZA 7 — TAKSINI ISHGA TUSHIRISH (yangi serverда)

```bash
# 1) Bot token + guruh (user beradi):
echo 'TAKSI_BOT_TOKEN="<USER>"' >> /var/www/reklama-bot/backend/.env
echo 'TAKSI_BOT_GROUP_ID="<USER -100...>"' >> /var/www/reklama-bot/backend/.env
pm2 restart reklama-bot-api --update-env
# Bot guruhga ADMIN qilinsin. Tekshir: /api/v1/taksi-bot/info → running:true, tokenSet:true

# 2) Taksi sessiyasi:
#  (a) sms-reklama'dan ko'chirish (sms_reklama DB ham eski serverда — avval uni ham pull/restore qilish kerak,
#      yoki eski serverда skriptni ishlatib, natija MonitorSession dump bilan kelgan bo'lishi mumkin):
#      cd /var/www/reklama-bot/backend && npm i pg
#      SMS_DB_URL="postgresql://<sms_user>:<pass>@<host>:5432/sms_reklama" ACTIVATE=true \
#        node scripts/migrate-sms-session-to-taksi.js && pm2 restart reklama-bot-api
#  (b) YOKI yangi sessiya: dashboard → 🚕 Taksi → Monitoring → telefon+kod bilan ulash.
#  ⚠️ sms-reklama sessiyasi boshqa joyda ishlasa — avval to'xtating (Telegram konflikt).

# 3) Tekshir: dashboard 🚕 Taksi → Monitoring (sessiya ACTIVE), Orders (TAKSI order kelyaptimi),
#    taksi guruhga order tushyaptimi.
```

---

## MUHIM QIYMATLAR (sirlar memory'да)
- Port: backend **4030**, dashboard nginx **8100**, Redis **DB 5**. Entry: **dist/src/main.js**.
- DB: `reklama_bot` / `reklama_user`. Dashboard login: `jaxong1r`.
- Botlar: cargo `@Yukchibor_bot` (CARGO_BOT_TOKEN, .env'да), taksi (TAKSI_BOT_TOKEN — keyin). Driver bot tokeni o'lik (kritik emas).
- Dashboard build: **`npx vite build`** (vite), `npm run build` EMAS. Prisma: **`db push`** (migration yo'q).
- Logistika JONLI — hot-path o'zgarsa `grep 'Yangi CARGO' logs/pm2-out-*.log | tail` bilan tekshir.
