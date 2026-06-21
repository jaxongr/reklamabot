-- AlterTable: User modeliga GPS joylashuv maydonlari qo'shildi
ALTER TABLE "User"
  ADD COLUMN "lastLat" DOUBLE PRECISION,
  ADD COLUMN "lastLng" DOUBLE PRECISION,
  ADD COLUMN "lastLocationAt" TIMESTAMP(3),
  ADD COLUMN "lastCity" TEXT;

-- CreateIndex: faqat oxirgi 5 daqiqada online dispetcherlarni tez topish uchun
CREATE INDEX "User_lastLocationAt_idx" ON "User"("lastLocationAt");
CREATE INDEX "User_role_lastLocationAt_idx" ON "User"("role", "lastLocationAt");
