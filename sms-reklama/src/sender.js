'use strict';
const config = require('./config');
const { pool, getConfig, setConfig } = require('./db');
const { sendSms, getBalance } = require('./sms');

let running = false; // bir vaqtda bitta blast

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function getReklamaText() {
  return (await getConfig('reklama_text')) || config.reklamaText || '';
}

/** Bitta raqamga necha kunda 1 marta (cooldown). DB sozlamasi > .env. */
async function getCooldownDays() {
  const v = parseInt(await getConfig('sms_cooldown_days'), 10);
  return Number.isFinite(v) && v > 0 ? v : config.smsCooldownDays;
}

/** Avto-yuborish yoniqmi (dashboard switch). DB sozlamasi > .env. */
async function isAutoOn() {
  const v = await getConfig('sms_auto_send');
  if (v === null || v === undefined) return config.smsAutoSend;
  return String(v) === 'true';
}

/**
 * Gateway hozir SMS qabul qiladimi (jonli balansga qarab).
 * remaining.sms > 0 bo'lsa true. O'qib bo'lmasa true (urinib ko'ramiz).
 * Limit gateway tomonida ko'tarilsa — avtomatik davom etadi.
 */
async function gatewayHasQuota() {
  const b = await getBalance();
  if (!b || !b.remaining || typeof b.remaining.sms !== 'number') return true;
  if (b.remaining.sms < 0) return true; // -1 = cheksiz (limit yo'q)
  return b.remaining.sms > 0;
}

/**
 * Yuborishga TAYYOR raqamlar:
 *  - hech qachon yuborilmagan (sms_sent_at IS NULL), YOKI
 *  - oxirgi yuborilgani cooldown kundan eski (qayta yuborish vaqti kelgan).
 * Telefon ustuni UNIQUE — har raqam yagona (unikal).
 */
async function sendBatch(max = 50, { onlyNew = false } = {}) {
  if (running) return { started: false, reason: 'Allaqachon yuborilmoqda' };
  running = true;
  let sent = 0, failed = 0;
  try {
    const text = await getReklamaText();
    if (!text || text.trim().length < 3) {
      return { started: false, reason: 'Reklama matni bo\'sh (Sozlamalar)' };
    }
    const cooldown = await getCooldownDays();
    const delayMs = Math.max(0, config.smsDelaySec) * 1000; // 0 = pauzasiz

    // Avto-rejimda FAQAT "yoqilgandan keyin" yig'ilgan raqamlar (eskilariga tegmaydi)
    const params = [max, String(cooldown)];
    let newFilter = '';
    if (onlyNew) {
      const startAt = await getConfig('auto_start_at');
      if (!startAt) {
        // himoya: boshlanish vaqti yo'q bo'lsa eski raqamlarga YUBORMAYMIZ
        return { started: false, reason: 'auto_start_at belgilanmagan' };
      }
      params.push(startAt); newFilter = ` AND created_at >= $3`;
    }

    const rows = (await pool.query(
      `SELECT id, phone FROM phones
       WHERE (sms_sent_at IS NULL OR sms_sent_at < now() - ($2 || ' days')::interval)${newFilter}
       ORDER BY (sms_sent_at IS NULL) DESC, sms_sent_at ASC NULLS FIRST, created_at ASC
       LIMIT $1`,
      params,
    )).rows;

    for (const row of rows) {
      // ATOMIK claim — cooldown ichida ikki marta ketmasligi KAFOLATI (unikallik)
      const claim = await pool.query(
        `UPDATE phones SET sms_sent=TRUE, sms_sent_at=now()
         WHERE id=$1 AND (sms_sent_at IS NULL OR sms_sent_at < now() - ($2 || ' days')::interval)
         RETURNING id`,
        [row.id, String(cooldown)],
      );
      if (claim.rowCount === 0) continue; // kimdir oldin oldi / cooldownда

      const res = await sendSms(row.phone, text);
      if (res.success) {
        sent++;
      } else {
        // muvaffaqiyatsiz — belgini bekor qil (keyin qayta urinsin)
        await pool.query('UPDATE phones SET sms_sent=FALSE, sms_sent_at=NULL WHERE id=$1', [row.id]);
        failed++;
        if (res.limitReached) {
          // gateway kvotasi tugadi — partiyani to'xtatamiz (limitni gateway tomonida ko'taring)
          return { started: true, sent, failed, remaining: await dueCount(), limitReached: true };
        }
      }
      if (delayMs > 0) await sleep(delayMs);
    }
    return { started: true, sent, failed, remaining: await dueCount() };
  } finally {
    running = false;
  }
}

/** Hozir yuborishga tayyor (cooldown bo'yicha) raqamlar soni. */
async function dueCount() {
  const cooldown = await getCooldownDays();
  return parseInt((await pool.query(
    `SELECT COUNT(*)::int c FROM phones
     WHERE sms_sent_at IS NULL OR sms_sent_at < now() - ($1 || ' days')::interval`,
    [String(cooldown)],
  )).rows[0].c, 10);
}

/** Avto-rejim yoqilgandan KEYIN yig'ilgan va hozir tayyor raqamlar soni. */
async function dueAutoCount() {
  const startAt = await getConfig('auto_start_at');
  if (!startAt) return 0;
  const cooldown = await getCooldownDays();
  return parseInt((await pool.query(
    `SELECT COUNT(*)::int c FROM phones
     WHERE (sms_sent_at IS NULL OR sms_sent_at < now() - ($1 || ' days')::interval)
       AND created_at >= $2`,
    [String(cooldown), startAt],
  )).rows[0].c, 10);
}

// Eski nom bilan moslik
const unsentCount = dueCount;

/** Avtomatik rejim — fonда davriy yuborib turadi (ON/OFF har tick'da DB'dan o'qiladi) */
function startAutoSender() {
  console.log('[SMS] Avto-yuborish boshqaruvi: dashboard switch orqali (ON/OFF).');
  const tick = async () => {
    try {
      if (!(await isAutoOn())) return; // o'chiq bo'lsa — yubormaydi
      if (!(await gatewayHasQuota())) return; // gateway kvotasi 0 — behuda urinmaymiz (ko'tarilsa o'zi davom etadi)
      // boshlanish vaqti yo'q bo'lsa — hozirdan boshlaymiz, eski raqamlarga tegmaymiz
      if (!(await getConfig('auto_start_at'))) {
        await setConfig('auto_start_at', new Date().toISOString());
        return;
      }
      await sendBatch(100000, { onlyNew: true }); // limitsiz; faqat yoqilgandan keyin yangi raqamlar
    } catch (e) { console.error('[SMS] auto:', e.message); }
  };
  setInterval(tick, 5 * 60_000); // har 5 daqiqada tekshiradi
}

module.exports = { sendBatch, unsentCount, dueCount, dueAutoCount, gatewayHasQuota, startAutoSender, isAutoOn, getCooldownDays, isRunning: () => running };
