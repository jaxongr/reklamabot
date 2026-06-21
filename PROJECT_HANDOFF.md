# 🗂 PROJECT HANDOFF — Reklama Bot (Logistika + Taksi)

> Bu hujjat keyingi Claude Code sessiyasi (yoki yangi dasturchi) ishni **to'g'ri davom ettirishi** uchun. 0 dan 100 gacha holat.
> Maxfiy ma'lumotlar (parol, token, DB parol) bu yerda EMAS — ular lokal `.claude` memory'da va serverdagi `.env` da.

Oxirgi yangilanish: 2026-06-21.

---

## 1. UMUMIY

Loyiha: Telegram guruhlarini kuzatib (gramjs userbot sessiyalari), yuk/taksi e'lonlaridan **Order** yaratadigan, dashboardда boshqariladigan tizim. Ikki modul:
- **LOGISTIKA** (yuk tashish) — JONLI ishlayapti, ~19000+ order.
- **TAKSI** (shaharlararo) — qurib bo'lindi, **HALI FAOLLASHTIRILMAGAN** (sessiya yo'q).

Stack: NestJS + Prisma + PostgreSQL + Redis + Socket.IO (backend); React 19 + Vite + AntD 6 (dashboard); gramjs (userbot, fork worker) + node-telegram-bot-api (botlar).

GitHub: `https://github.com/jaxongr/reklamabot.git` (lekin lokalda ko'p commit qilinmagan o'zgarish bor — joriy holat git'da emas).

---

## 2. SERVER (avtosalon)

- SSH alias: `avtosalon` → `ssh root@13.140.185.38` (id_ed25519 kalit; parol ham yoqilgan — memory'da).
- Host: AWS, hostname `vmi3371990`, Ubuntu 24.04, Node v20, PG 16, Redis 7, Docker, PM2, nginx, ufw.
- ufw faqat shu portlarni ochadi: **22, 8080, 8085, 8090, 8095, 4025, 8100**. Yangi tashqi port kerak bo'lsa `ufw allow <port>/tcp` (faqat user ruxsati bilan).

### Bu serverда BOSHQA loyihalar bor — TEGMA:
- PM2: `autobazar-api` (:3000→nginx :8090), `avtosalon-api` (:4010→nginx :8080), `sms-reklama` (:4025)
- Docker: `savdo-pos` (:8095), `sms-gateway` (:8085, :3008)
- System PG (:5432), system Redis (:6379), nginx (:80/8080/8090)

### Bizning loyiha (izolyatsiya):
| Narsa | Qiymat |
|-------|--------|
| Papka | `/var/www/reklama-bot/` |
| Backend port | `4030` (PM2: `reklama-bot-api`, entry `dist/src/main.js`) |
| Dashboard | nginx **8100** → http://13.140.185.38:8100 |
| DB | system PG `reklama_bot` / user `reklama_user` (parol memory'da) |
| Redis | system Redis, **DB 5** |
| nginx config | `/etc/nginx/sites-available/reklama-bot` (8100: dashboard + /api + /socket.io + /uploads → 4030) |
| PM2 startup | enabled (`pm2 save` qilingan, reboot'da tiklanadi) |

Dashboard login: `jaxong1r` / parol memory'da (SUPER_ADMIN). Admin parol SHA256 hash sifatida `User.brandAdText`да saqlanadi (bcrypt EMAS).

---

## 3. DEPLOY / BUILD KOMANDALAR

```bash
# Kod o'zgartirilgach (lokaldan):
scp backend/src/<path> avtosalon:/var/www/reklama-bot/backend/src/<path>
ssh avtosalon "cd /var/www/reklama-bot/backend && npx nest build && pm2 restart reklama-bot-api --update-env"

# Dashboard:
scp dashboard/src/<path> avtosalon:/var/www/reklama-bot/dashboard/src/<path>
ssh avtosalon "cd /var/www/reklama-bot/dashboard && VITE_API_URL=http://13.140.185.38:8100/api/v1 npx vite build && nginx -s reload"
```
- ⚠️ `npm run build` (dashboard) `tsc` strict tufayli xato beradi — **`npx vite build`** ishlat.
- nest build entry `dist/**src**/main.js` ga tushadi (ildizdagi qo'shimcha .js skriptlar tufayli). PM2 shunga sozlangan.
- TS xatolarini ANSI'siz ko'rish: `npx nest build 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep 'error TS'`
- Prisma schema o'zgarsa: `npx prisma db push --skip-generate && npx prisma generate` (migration YO'Q, db push ishlatiladi).

---

## 4. NIMA QILINGAN (DONE)

### 4.1. Asosiy deploy
Loyiha + 6 ta MonitorSession (logistika, lokaldан ko'chirilgan, 4 ta ACTIVE) + dashboard + login. Logistika jonli ishlayapti.

### 4.2. Yuk bot — @Yukchibor_bot (CARGO, FAOL)
- Modul: `backend/src/cargo-bot/` (service, controller, module). Token: `.env` `CARGO_BOT_TOKEN`.
- Yangi CARGO order yaratilganda — **ruxsatli + /start qilgan** Telegram ID'larga real vaqtda yuboradi.
- Reply-klaviatura: ✅ Qabul qilish / ⏸ To'xtatish / ▶️ Boshlash / 📋 Olingan yuklar.
- Qabul = eksklyuziv (birinchi bosgan oladi). Inline tugmalar: ✅ Qabul, 📍 Manba, 🚫 Dispecher (senderni bloklaydi → BlockedUser).
- Ruxsat: `CargoBotUser` jadvali (telegramId, isAllowed, expiresAt). Muddat (necha kun) — tugaganda avtomatik o'chadi (5 daq interval + runtime tekshiruv).
- Dashboard: **Monitoring → Yuk Bot** (`pages/CargoBot/CargoBot.tsx`) — ID qo'shish/tahrirlash/muddat, oqim toggle, olingan yuklar.
- Manba havola: `Order.messageId` + `groupUsername` saqlanadi (monitor-worker forward qiladi). Public guruh → `t.me/<username>/<id>` (hammaga), aks holда `t.me/c/<id>/<msg>` (faqat a'zolar — Telegram cheklovi).

### 4.3. TAKSI moduli (TAYYOR, FAOLLASHTIRILMAGAN)
`businessModule` (LOGISTIKA/TAKSI) — `Order` va `MonitorSession`да mavjud. Logistika **sukut LOGISTIKA**, hech narsa o'zgarmagan.
- **Sessiyalar/orderlar modul bo'yicha ajratilgan**: `getSessions/getStats/sendCode` (monitor) va `findAll/getStats` (orders) `module` param qabul qiladi (sukut LOGISTIKA).
- Controllerlar: `?module=TAKSI` query / body.
- **Taksi farqlari** (faqat TAKSI):
  - Raqamsiz e'londan ham order yaratiladi (logistikada — yo'q). `monitor.service` ~680.
  - Keyword sharti yo'q (barcha xabardan; logistikada CARGO/DRIVER keyword shart).
  - Spam filtri (message-filter): qo'llanadi **1,4,6,7,8,9,10,11,12,13,16**; o'tkaziladi **2 (dispetcher nom), 3 (ayol ism), 14-15 (soxta yo'nalish)**. Gate: `ctx.businessModule==='TAKSI'`.
  - **GM mashinalar → DRIVER**: `TAXI_DRIVER_KEYWORDS` (dispatcher-keywords.ts) — Cobalt, Gentra, Nexia, Spark, Lacetti, Malibu, Damas, Labo... + "joy bor", "olib ketaman", "taksi". `detectDriverAd(textLower, isTaksi)`.
- **Dashboard**: header'да `🚚 Logistika / 🚕 Taksi` toggle (`ModuleContext` mount qilingan). Taksi tanlansa sidebar `taksiMenuItems`, sahifalar (Monitor, Orders) `module=TAKSI` bilan so'raydi. `pages/Taksi/TaksiOrders.tsx` mavjud (lekin asosiy Orders sahifasi modulга moslangani uchun u ham ishlaydi).

### 4.4. Taksi bot (TAYYOR, TOKEN YO'Q)
`backend/src/taksi-bot/` — TAKSI orderlarni **bitta GURUHGA** yuboradi.
- Token: `.env` `TAKSI_BOT_TOKEN` (hozir yo'q → bot o'chiq). Guruh: `.env` `TAKSI_BOT_GROUP_ID` yoki SystemConfig `taksi_bot_group_id`.
- `broadcastOrder` — order.businessModule==='TAKSI' bo'lsa formatlab guruhga yuboradi (📍 Manba tugmasi bilan). Yo'lovchi/Haydovchi farqlanadi.
- Dashboard endpointlari: `GET /taksi-bot/info`, `PUT /taksi-bot/group`, `PUT /taksi-bot/flow`. (Dashboard sahifasi HALI yo'q — kerak bo'lsa qo'shish kerak.)

---

## 5. PENDING (KEYINGI ISH)

### 5.1. Taksi bot tokeni va guruhi (user beradi)
1. `.env` ga qo'sh: `TAKSI_BOT_TOKEN="..."` va `TAKSI_BOT_GROUP_ID="-100..."` (yoki dashboard `PUT /taksi-bot/group`).
2. `pm2 restart reklama-bot-api --update-env`.
3. Bot guruhга admin qilinishi kerak (xabar yuborish uchun). Guruh ID ni olish: botni guruhga qo'shib, `getUpdates` yoki @userinfobot.

### 5.2. sms-reklama sessiyasini taksiga ko'chirish
`sms-reklama` (`/root/sms-reklama`) gramjs ishlatadi, sessiyalarni o'z DB'sida (`sms_reklama` DB, `sessions` jadvali, `session_string`) saqlaydi — bizning `MonitorSession` bilan bir xil format (StringSession).
**Ko'chirish:** `sms_reklama.sessions.session_string` ni o'qib, `reklama_bot.MonitorSession` ga `businessModule='TAKSI', status='ACTIVE', sessionString=<string>, userId=<jaxong1r id>` bilan yoz. Tayyor skript: `backend/scripts/migrate-sms-session-to-taksi.js` (qarang). 
⚠️ DIQQAT: bir sessiyani 2 joyda (sms-reklama + taksi) parallel ishlatish Telegram konfliktini berishi mumkin — ko'chirishdан oldin sms-reklamaда o'sha sessiyani to'xtatish kerakmi, user bilan aniqlash.
⚠️ Ko'chirilgach taksi monitoring ISHGA TUSHADI — "faollashtirish" shu. User tayyor bo'lганда qil.

### 5.3. Boshqa serverga migratsiya (user oxirida aytadi)
To'liq stack: PG dump (`reklama_bot`), `/var/www/reklama-bot` papka, `.env`, nginx config, PM2 ecosystem. Yangi serverда: PG/Redis/Node/nginx o'rnat, DB restore, npm ci + prisma generate + build, PM2 start, nginx + ufw + port. (Boshlang'ich deploy qadamlari shu hujjatdagi kabi.)

---

## 6. MUHIM ESLATMALAR
- Logistika JONLI — monitor.service hot-path'ni o'zgartirganda EHTIYOT BO'L. Har o'zgarishdan keyin `grep 'Yangi CARGO' logs/pm2-out-4.log | tail` bilan tekshir.
- Driver bot (`bot/driver-bot.service.ts`) o'lik token bilan 401 spam beradi — kritik emas (DRIVER_BOT_TOKEN .env'da yo'q).
- `prisma.telegramDispatcherAd.create` ba'zan `hex escape` xatosi beradi — pre-existing, kritik emas.
- Memory fayllar: `C:\Users\Pro\.claude\projects\d--Loyixalar-Reklama-bot\memory\` (maxfiy operatsion tafsilotlar shu yerda).
