'use strict';
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => {
  console.error('[DB] Pool xatosi:', err.message);
});

/**
 * Jadvallarni yaratish (idempotent — bir necha marta chaqirsa ham xavfsiz).
 */
async function initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id              SERIAL PRIMARY KEY,
      phone           TEXT UNIQUE NOT NULL,
      name            TEXT,
      session_string  TEXT,
      active          BOOLEAN DEFAULT TRUE,
      total_groups    INTEGER DEFAULT 0,
      last_poll_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS phones (
      id             SERIAL PRIMARY KEY,
      phone          TEXT UNIQUE NOT NULL,
      source_group   TEXT,
      source_session TEXT,
      message_text   TEXT,
      sms_sent       BOOLEAN DEFAULT FALSE,
      sms_sent_at    TIMESTAMPTZ,
      created_at     TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_phones_sms_sent ON phones(sms_sent);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_phones_created ON phones(created_at DESC);`);
  // cooldown (necha kunda 1 marta) so'rovi uchun
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_phones_sent_at ON phones(sms_sent_at);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sms_log (
      id         SERIAL PRIMARY KEY,
      phone      TEXT NOT NULL,
      message    TEXT,
      status     TEXT,
      error      TEXT,
      sent_at    TIMESTAMPTZ DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_smslog_sent ON sms_log(sent_at DESC);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_config (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('[DB] Jadvallar tayyor.');
}

async function getConfig(key, fallback = null) {
  const r = await pool.query('SELECT value FROM app_config WHERE key=$1', [key]);
  return r.rows.length ? r.rows[0].value : fallback;
}

async function setConfig(key, value) {
  await pool.query(
    `INSERT INTO app_config(key, value) VALUES($1, $2)
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`,
    [key, String(value)],
  );
}

/** Yangi telefonni saqlash (dublikat bo'lsa e'tiborsiz). Yangi qo'shilsa true. */
async function savePhone({ phone, group, session, text }) {
  const r = await pool.query(
    `INSERT INTO phones(phone, source_group, source_session, message_text)
     VALUES($1,$2,$3,$4)
     ON CONFLICT (phone) DO NOTHING
     RETURNING id`,
    [phone, group || null, session || null, (text || '').slice(0, 500)],
  );
  return r.rows.length > 0;
}

module.exports = { pool, initTables, getConfig, setConfig, savePhone };

// CLI: node src/db.js --init
if (require.main === module && process.argv.includes('--init')) {
  initTables()
    .then(() => { console.log('OK'); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
