# 🤖 Telegram Reklama Bot

Telegram guruhlarga avtomatik ravishda reklama e'lonlarni tarqatuvchi to'liq tizim.

## 🚀 Tezkor Boshlash

```bash
cd backend
npm install
cp .env.example .env
# .env faylni to'ldiring
npx prisma generate
npx prisma db push
npm run start:dev
```

Server: http://localhost:3000
API Docs: http://localhost:3000/api/docs

## 📚 Asosiy Endpointlar

**Auth:** `/api/v1/auth`
**Users:** `/api/v1/users`
**Sessions:** `/api/v1/sessions`
**Ads:** `/api/v1/ads`
**Posts:** `/api/v1/posts`
**Payments:** `/api/v1/payments`

## 🔐 Konfiguratsiya

`.env` faylni to'ldiring:
- DATABASE_URL
- JWT_SECRET
- TELEGRAM_BOT_TOKEN
- TELEGRAM_API_ID
- TELEGRAM_API_HASH

## 📝 License

MIT
