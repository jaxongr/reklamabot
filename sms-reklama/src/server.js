'use strict';
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const config = require('./config');
const { pool, getConfig, setConfig } = require('./db');
const tg = require('./telegram');
const sender = require('./sender');

const TOKEN = crypto.createHash('sha256').update(config.adminPassword + ':sms-reklama').digest('hex');

function auth(req, res, next) {
  if ((req.headers['x-admin-token'] || '') === TOKEN) return next();
  return res.status(401).json({ error: 'Avtorizatsiya kerak' });
}

function startServer() {
  const app = express();
  app.use(express.json());

  // ===== API =====
  app.post('/api/login', (req, res) => {
    if ((req.body.password || '') === config.adminPassword) return res.json({ token: TOKEN });
    return res.status(401).json({ error: 'Parol noto\'g\'ri' });
  });

  app.get('/api/stats', auth, async (req, res) => {
    const phones = parseInt((await pool.query('SELECT COUNT(*)::int c FROM phones')).rows[0].c, 10);
    const due = await sender.dueCount();
    const sent = parseInt((await pool.query('SELECT COUNT(*)::int c FROM phones WHERE sms_sent=TRUE')).rows[0].c, 10);
    const sentToday = parseInt((await pool.query("SELECT COUNT(*)::int c FROM sms_log WHERE status='sent' AND sent_at::date = now()::date")).rows[0].c, 10);
    const sessions = parseInt((await pool.query('SELECT COUNT(*)::int c FROM sessions WHERE active=TRUE')).rows[0].c, 10);
    const auto = await sender.isAutoOn();
    const cooldownDays = await sender.getCooldownDays();
    const dueAuto = await sender.dueAutoCount();
    const autoStartAt = await getConfig('auto_start_at');
    const bal = await require('./sms').getBalance();
    const gateway = bal && bal.limits ? {
      limit: bal.limits.maxSmsPerDay,
      used: bal.usage ? bal.usage.smsCount : null,
      remaining: bal.remaining ? bal.remaining.sms : null,
      unlimited: bal.limits.maxSmsPerDay < 0 || (bal.remaining && bal.remaining.sms < 0),
    } : null;
    res.json({ phones, sent, sentToday, unsent: due, due, dueAuto, autoStartAt, sessions, auto, cooldownDays, gateway, ...tg.stats() });
  });

  app.get('/api/sessions', auth, async (req, res) => {
    const r = await pool.query('SELECT id, phone, name, active, total_groups, last_poll_at, (session_string IS NOT NULL) AS connected FROM sessions ORDER BY id');
    res.json(r.rows);
  });
  app.post('/api/sessions/send-code', auth, async (req, res) => {
    try { await tg.sendCode(req.body.phone, req.body.name); res.json({ ok: true }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });
  app.post('/api/sessions/verify', auth, async (req, res) => {
    try { const r = await tg.signIn(req.body.phone, req.body.code, req.body.password); res.json(r); }
    catch (e) { res.status(400).json({ error: e.message }); }
  });
  app.post('/api/sessions/:id/stop', auth, async (req, res) => {
    await tg.stopSession(parseInt(req.params.id, 10));
    await pool.query('UPDATE sessions SET active=FALSE WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  });
  app.post('/api/sessions/:id/start', auth, async (req, res) => {
    await pool.query('UPDATE sessions SET active=TRUE WHERE id=$1', [req.params.id]);
    const row = (await pool.query('SELECT * FROM sessions WHERE id=$1', [req.params.id])).rows[0];
    if (row && row.session_string) { try { await tg.startSession(row); } catch (e) {} }
    res.json({ ok: true });
  });
  app.delete('/api/sessions/:id', auth, async (req, res) => {
    await tg.stopSession(parseInt(req.params.id, 10));
    await pool.query('DELETE FROM sessions WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  });

  app.get('/api/phones', auth, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const total = parseInt((await pool.query('SELECT COUNT(*)::int c FROM phones')).rows[0].c, 10);
    const r = await pool.query(
      'SELECT phone, source_group, sms_sent, sms_sent_at, created_at FROM phones ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset],
    );
    res.json({ rows: r.rows, total });
  });

  app.get('/api/sms/logs', auth, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    const status = req.query.status; // 'sent' | 'failed' | undefined
    const where = status === 'sent' || status === 'failed' ? `WHERE status=$3` : '';
    const params = status === 'sent' || status === 'failed' ? [limit, offset, status] : [limit, offset];
    const total = parseInt((await pool.query(`SELECT COUNT(*)::int c FROM sms_log ${where}`, status === 'sent' || status === 'failed' ? [status] : [])).rows[0].c, 10);
    const r = await pool.query(
      `SELECT id, phone, message, status, error, sent_at FROM sms_log ${where} ORDER BY sent_at DESC LIMIT $1 OFFSET $2`,
      params,
    );
    res.json({ rows: r.rows, total });
  });

  app.get('/api/config', auth, async (req, res) => {
    res.json({
      reklama_text: (await getConfig('reklama_text')) || config.reklamaText,
      sms_gateway_token: (await getConfig('sms_gateway_token')) || config.smsGatewayToken,
      sms_gateway_url: (await getConfig('sms_gateway_url')) || config.smsGatewayUrl,
      sms_cooldown_days: await sender.getCooldownDays(),
      sms_auto_send: await sender.isAutoOn(),
    });
  });
  app.post('/api/config', auth, async (req, res) => {
    const b = req.body || {};
    if (b.reklama_text !== undefined) await setConfig('reklama_text', b.reklama_text);
    if (b.sms_gateway_token !== undefined) await setConfig('sms_gateway_token', b.sms_gateway_token);
    if (b.sms_gateway_url !== undefined) await setConfig('sms_gateway_url', b.sms_gateway_url);
    if (b.sms_cooldown_days !== undefined) await setConfig('sms_cooldown_days', String(parseInt(b.sms_cooldown_days, 10) || 3));
    if (b.sms_auto_send !== undefined) {
      const wasOn = (await getConfig('sms_auto_send')) === 'true';
      const nowOn = !!b.sms_auto_send;
      await setConfig('sms_auto_send', nowOn ? 'true' : 'false');
      // off->on o'tishda: shu vaqtdan keyingi yangi raqamlargagina yuboriladi (eskilarga tegmaydi)
      if (nowOn && !wasOn) await setConfig('auto_start_at', new Date().toISOString());
    }
    res.json({ ok: true });
  });

  app.post('/api/sms/send', auth, async (req, res) => {
    const count = Math.min(parseInt(req.body.count || '50', 10), 5000);
    const r = await sender.sendBatch(count);
    res.json(r);
  });

  // ===== React dashboard (build) =====
  const distPath = path.join(__dirname, '..', 'dashboard', 'dist');
  app.use(express.static(distPath));
  // SPA fallback (React Router) — /api dan tashqari hamma yo'l index.html ga
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[WEB] Panel: http://0.0.0.0:${config.port}`);
  });
}

module.exports = { startServer };
