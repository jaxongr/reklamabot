/**
 * Mobile app login kodlari
 * In-memory Map + har bir o'zgarishda avtomatik tozalash
 *
 * NOTE: Kodlar 5 daqiqa amal qiladi.
 * Server restart bo'lsa kodlar o'chadi — foydalanuvchi qaytadan /app bosishi kerak.
 */
export const appLoginCodes = new Map<string, { telegramId: string; expiresAt: number }>();

/**
 * Driver app login kodlari — telefon raqam + kod
 */
export const driverLoginCodes = new Map<string, { phone: string; userId: string; expiresAt: number }>();

// Har 60 sekundda eskirgan kodlarni tozalash
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of appLoginCodes.entries()) {
    if (val.expiresAt < now) appLoginCodes.delete(key);
  }
  for (const [key, val] of driverLoginCodes.entries()) {
    if (val.expiresAt < now) driverLoginCodes.delete(key);
  }
}, 60_000);
