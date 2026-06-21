'use strict';
const config = require('./config');
const { pool, getConfig } = require('./db');

/**
 * SMS Gateway orqali bitta SMS yuborish.
 * Endpoint:  POST {url}/api/v1/sms/send
 * Auth:      x-api-key: sk_...
 * Body:      { to, message }
 */
async function sendViaGateway(phone, message, baseUrl, token) {
  try {
    const url = baseUrl.replace(/\/+$/, '') + '/api/v1/sms/send';
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': token },
      body: JSON.stringify({ to: phone, message }),
    });
    const data = await resp.json().catch(() => ({}));

    if (resp.ok && data.success !== false) {
      return { success: true, externalId: data.id ? String(data.id) : (data.data && data.data.id ? String(data.data.id) : undefined) };
    }

    const errMsg = Array.isArray(data.message) ? data.message.join('; ') : (data.message || data.error || `HTTP ${resp.status}`);
    // Kunlik limit / kvota tugaganini aniqlash — bunda partiyani to'xtatamiz
    const limitReached = resp.status === 429 || /limit|quota|exceeded|kun|daily/i.test(errMsg);
    return { success: false, error: errMsg, limitReached };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Joriy sozlamalar bilan SMS yuborish (token DB yoki .env dan).
 */
async function sendSms(phone, message) {
  const baseUrl = (await getConfig('sms_gateway_url')) || config.smsGatewayUrl;
  const token = (await getConfig('sms_gateway_token')) || config.smsGatewayToken;

  if (!token) {
    return { success: false, error: 'SMS Gateway token sozlanmagan (web panel > Sozlamalar)' };
  }
  if (!baseUrl) {
    return { success: false, error: 'SMS Gateway URL sozlanmagan' };
  }

  const result = await sendViaGateway(phone, message, baseUrl, token);

  // Log
  await pool.query(
    `INSERT INTO sms_log(phone, message, status, error) VALUES($1,$2,$3,$4)`,
    [phone, message.slice(0, 300), result.success ? 'sent' : 'failed', result.error || null],
  );

  return result;
}

/**
 * Gateway balansi/limitini jonli o'qish: GET /api/v1/balance
 * Qaytaradi: { remaining, limits, usage } yoki null (o'qib bo'lmasa).
 */
async function getBalance() {
  const baseUrl = (await getConfig('sms_gateway_url')) || config.smsGatewayUrl;
  const token = (await getConfig('sms_gateway_token')) || config.smsGatewayToken;
  if (!baseUrl || !token) return null;
  try {
    const url = baseUrl.replace(/\/+$/, '') + '/api/v1/balance';
    const resp = await fetch(url, { headers: { 'x-api-key': token } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

module.exports = { sendSms, sendViaGateway, getBalance };
