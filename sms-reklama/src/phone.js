'use strict';

// O'zbekiston mobil operator kodlari (998 dan keyingi 2 raqam)
const UZ_OPERATOR_CODES = [
  '90', '91', '93', '94', '95', '97', '98', '99',
  '88', '77', '33', '20', '50', '55', '78',
];

// Telefonga o'xshash ketma-ketliklar
const CANDIDATE_RE = /(\+?\d[\d\s\-.() ]{6,18}\d)/g;

/**
 * Bitta nomzodni +998XXXXXXXXX formatiga keltirish. Yaroqsiz bo'lsa null.
 */
function normalizeUz(raw) {
  let d = String(raw).replace(/\D/g, '');

  // 998 prefiks bilan 12 raqam
  if (d.length === 12 && d.startsWith('998')) {
    // ok
  } else if (d.length === 9) {
    // operator kodi bilan boshlanadigan 9 raqam → 998 qo'shamiz
    d = '998' + d;
  } else if (d.length === 10 && d.startsWith('0')) {
    // 0XX XXX XX XX → 998 + (9 raqam)
    d = '998' + d.slice(1);
  } else if (d.length === 13 && d.startsWith('8998')) {
    d = d.slice(1);
  } else {
    return null;
  }

  if (d.length !== 12 || !d.startsWith('998')) return null;

  const opCode = d.slice(3, 5);
  if (!UZ_OPERATOR_CODES.includes(opCode)) return null;

  return '+' + d;
}

/**
 * Matndan barcha yaroqli O'zbek raqamlarini ajratib olish (dublikatsiz).
 * @returns {string[]} masalan ['+998901234567', ...]
 */
function extractPhones(text) {
  if (!text) return [];
  const found = new Set();
  const matches = text.match(CANDIDATE_RE) || [];
  for (const m of matches) {
    const n = normalizeUz(m);
    if (n) found.add(n);
  }
  return [...found];
}

module.exports = { extractPhones, normalizeUz };
