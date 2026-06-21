'use strict';
require('dotenv').config();

const config = {
  tgApiId: parseInt(process.env.TG_API_ID || '0', 10),
  tgApiHash: process.env.TG_API_HASH || '',
  databaseUrl: process.env.DATABASE_URL || '',
  port: parseInt(process.env.PORT || '4010', 10),
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',

  pollIntervalSec: parseInt(process.env.POLL_INTERVAL_SEC || '25', 10),
  msgPerGroup: parseInt(process.env.MSG_PER_GROUP || '15', 10),
  onlyCargo: String(process.env.ONLY_CARGO || 'false') === 'true',
  maxSessions: parseInt(process.env.MAX_SESSIONS || '20', 10),

  // SMS Gateway (o'z serverdagi tizim: POST /api/v1/sms/send, x-api-key)
  smsGatewayUrl: process.env.SMS_GATEWAY_URL || 'http://localhost:3008',
  smsGatewayToken: process.env.SMS_GATEWAY_TOKEN || '',

  smsAutoSend: String(process.env.SMS_AUTO_SEND || 'false') === 'true',
  smsCooldownDays: parseInt(process.env.SMS_COOLDOWN_DAYS || '3', 10), // bitta raqamga necha kunda 1 marta
  smsPerHour: parseInt(process.env.SMS_PER_HOUR || '200', 10),
  smsDelaySec: parseInt(process.env.SMS_DELAY_SEC || '8', 10),
  reklamaText: process.env.REKLAMA_TEXT || '',
};

module.exports = config;
