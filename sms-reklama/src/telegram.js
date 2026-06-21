'use strict';
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const config = require('./config');
const { pool, savePhone } = require('./db');
const { extractPhones } = require('./phone');

// Auth jarayonidagi (kod kutilayotgan) clientlar: phone -> { client, phoneCodeHash }
const pendingAuths = new Map();
// Faol monitoring clientlari: sessionId -> { client, timer }
const activeClients = new Map();
// Har (session+group) uchun oxirgi ko'rilgan xabar id: "sid:gid" -> msgId
const lastSeen = new Map();

let phonesCollectedTotal = 0;

function makeClient(sessionString) {
  return new TelegramClient(
    new StringSession(sessionString || ''),
    config.tgApiId,
    config.tgApiHash,
    { connectionRetries: 3, requestRetries: 2, useWSS: true, floodSleepThreshold: 30 },
  );
}

// ============================================================
// AUTH: kod yuborish va kirish
// ============================================================

async function sendCode(phone, name) {
  if (activeClients.size >= config.maxSessions) {
    throw new Error(`Maksimal ${config.maxSessions} ta session. Avval birini o'chiring.`);
  }
  const client = makeClient('');
  client._errorHandler = (err) => {
    const m = err && err.message;
    if (m === 'TIMEOUT' || m === 'Not connected') return;
    console.error('[TG] auth error:', m);
  };
  await client.connect();
  const result = await client.invoke(
    new Api.auth.SendCode({
      phoneNumber: phone,
      apiId: config.tgApiId,
      apiHash: config.tgApiHash,
      settings: new Api.CodeSettings({}),
    }),
  );
  pendingAuths.set(phone, { client, phoneCodeHash: result.phoneCodeHash, name });
  return { ok: true };
}

async function signIn(phone, code, password) {
  const pending = pendingAuths.get(phone);
  if (!pending) throw new Error('Avval kod yuboring (kod muddati tugagan bo\'lishi mumkin).');

  try {
    await pending.client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: pending.phoneCodeHash,
        phoneCode: code,
      }),
    );
  } catch (error) {
    const em = error && error.errorMessage;
    if (em === 'SESSION_PASSWORD_NEEDED') {
      if (!password) return { needPassword: true };
      const { computeCheck } = require('telegram/Password');
      const pwd = await pending.client.invoke(new Api.account.GetPassword());
      const srp = await computeCheck(pwd, password);
      await pending.client.invoke(new Api.auth.CheckPassword({ password: srp }));
    } else if (em === 'PHONE_CODE_EXPIRED') {
      pendingAuths.delete(phone);
      throw new Error('Kod muddati tugagan. Qaytadan yuboring.');
    } else {
      throw error;
    }
  }

  const sessionString = pending.client.session.save();

  // DB ga saqlash
  await pool.query(
    `INSERT INTO sessions(phone, name, session_string, active)
     VALUES($1,$2,$3,TRUE)
     ON CONFLICT (phone) DO UPDATE SET session_string=EXCLUDED.session_string, name=EXCLUDED.name, active=TRUE`,
    [phone, pending.name || phone, sessionString],
  );

  try { await pending.client.disconnect(); } catch (_) {}
  pendingAuths.delete(phone);

  // Darhol monitoringni boshlash
  const row = await pool.query('SELECT * FROM sessions WHERE phone=$1', [phone]);
  if (row.rows[0]) startSession(row.rows[0]).catch((e) => console.error('[TG] startSession:', e.message));

  return { ok: true };
}

// ============================================================
// MONITORING: guruhlarni polling qilib raqam yig'ish
// ============================================================

async function pollSession(sessionRow, client) {
  try {
    const dialogs = await client.getDialogs({ limit: 200 });
    let groups = 0;
    for (const d of dialogs) {
      if (!d.isGroup && !d.isChannel) continue;
      groups++;
      const ent = d.entity;
      if (!ent) continue;
      const gid = String(ent.id);
      const key = `${sessionRow.id}:${gid}`;
      const lastMsg = d.message;
      const lastId = lastMsg ? lastMsg.id : 0;
      const seen = lastSeen.get(key) || 0;
      if (lastId <= seen) continue; // yangi xabar yo'q

      // yangi xabarlarni olish
      let messages = [];
      try {
        messages = await client.getMessages(ent, { limit: config.msgPerGroup });
      } catch (_) { continue; }

      let maxId = seen;
      for (const msg of messages) {
        if (!msg || !msg.id) continue;
        if (msg.id > maxId) maxId = msg.id;
        if (msg.id <= seen) continue;
        const text = msg.message || msg.text || '';
        if (!text) continue;
        if (config.onlyCargo && !looksLikeCargo(text)) continue;
        const phones = extractPhones(text);
        for (const p of phones) {
          const isNew = await savePhone({
            phone: p,
            group: d.title || gid,
            session: sessionRow.phone,
            text,
          });
          if (isNew) phonesCollectedTotal++;
        }
      }
      lastSeen.set(key, maxId);
    }
    await pool.query('UPDATE sessions SET total_groups=$1, last_poll_at=now() WHERE id=$2', [groups, sessionRow.id]);
  } catch (e) {
    console.error(`[TG] poll xato (${sessionRow.phone}):`, e.message);
  }
}

// Oddiy cargo tekshiruvi (ONLY_CARGO=true bo'lganda)
function looksLikeCargo(text) {
  const t = text.toLowerCase();
  return /yuk|gruz|fura|kamaz|tonna|тонна|керак|kerak|olib|ket[ai]|jo['‘`]nat|achun|so['‘`]m|\d{3,}\s*km/i.test(t);
}

async function startSession(sessionRow) {
  if (activeClients.has(sessionRow.id)) return;
  const client = makeClient(sessionRow.session_string);
  client._errorHandler = (err) => {
    const m = err && err.message;
    if (m === 'TIMEOUT' || m === 'Not connected') return;
    console.error(`[TG] client error (${sessionRow.phone}):`, m);
  };
  await client.connect();
  console.log(`[TG] Session ulandi: ${sessionRow.phone}`);

  // birinchi poll darhol, keyin interval
  const run = () => pollSession(sessionRow, client);
  await run();
  const timer = setInterval(run, config.pollIntervalSec * 1000);
  activeClients.set(sessionRow.id, { client, timer });
}

async function stopSession(sessionId) {
  const a = activeClients.get(sessionId);
  if (a) {
    clearInterval(a.timer);
    try { await a.client.disconnect(); } catch (_) {}
    activeClients.delete(sessionId);
  }
}

async function startAllSessions() {
  const r = await pool.query('SELECT * FROM sessions WHERE active=TRUE AND session_string IS NOT NULL');
  console.log(`[TG] ${r.rows.length} ta faol session ulanmoqda...`);
  for (const s of r.rows) {
    try { await startSession(s); } catch (e) { console.error(`[TG] ${s.phone}:`, e.message); }
  }
}

function stats() {
  return { activeSessions: activeClients.size, phonesCollectedTotal };
}

module.exports = {
  sendCode, signIn, startSession, stopSession, startAllSessions, stats,
};
