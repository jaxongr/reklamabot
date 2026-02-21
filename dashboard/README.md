# 🎨 Telegram Reklama Bot - Dashboard

React + Vite + AntD + TypeScript bilan yozilgan admin paneli.

## 🚀 Boshlash

\`\`\`bash
npm install
npm run dev
\`\`\`

Dashboard: http://localhost:5173

## 📚 Modullar

- **Auth** - Login/Logout
- **Dashboard** - Asosiy statistika
- **Ads** - E\'lonlar boshqaruvi
- **Sessions** - Telegram sessiyalari
- **Groups** - Guruhlar ro\'yxati
- **Posts** - Tarqatish boshqaruvi
- **Payments** - To\'lovlar boshqaruvi
- **Analytics** - Statistika va grafiklar
- **Settings** - Profil sozlamalari

## 🎯 Xususiyatlar

- Ant Design UI
- React Router navigatsiya
- TanStack Query (React Query) - API so\'rovlar
- Zustand - State management
- Styled-components - CSS-in-JS
- TypeScript - Tip xavfsizlik

## 📝 Environment

\`.env` faylini yaratish:

\`env
VITE_API_URL=http://localhost:3000/api/v1
\`

## 🔑 Token olish

1. Backendga login qiling
2. Token localStorage ga saqlanadi
3. Har bir so\'rovda Authorization header bilan yuboriladi

## 📊 Dashboard

- Jami foydalanuvchilar
- Faol foydalanuvchilar  
- Jami e\'lonlar
- Tarqatishlar statistikasi

## 📣 E\'lonlar

- Yaratish (CRUD)
- Tahrirlash
- Yopish (sold)
- Nusxalash
- Status: DRAFT, ACTIVE, PAUSED, CLOSED

## 📤 Tarqatish

- Avtomatik yuborish
- Pause/Resume (10 min kutish)
- Progress tracking
- Xatoliklar logi
