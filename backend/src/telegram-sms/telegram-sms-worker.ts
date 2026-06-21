/**
 * Telegram SMS Worker (child_process.fork)
 * gramJS TelegramClient instances for sending DMs
 * Runs in a separate process to avoid blocking the main event loop.
 *
 * Protocol (IPC):
 *   Main -> Child: { type, id, ...params }
 *   Child -> Main: { type: 'response', id, success, data/error }
 *                  { type: 'log', level, message }
 */
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';

// Suppress gramJS console spam
console.log = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  if (
    msg.includes('flood wait') || msg.includes('Sleeping for') ||
    msg.includes('TCPFull') || msg.includes('Connecting to') ||
    msg.includes('LAYER') || msg.includes('Running gramJS') ||
    msg.includes('reconnect') || msg.includes('Handling reconnect')
  ) return;
  log('info', msg);
};
console.warn = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  if (msg.includes('flood') || msg.includes('reconnect')) return;
  log('warn', msg);
};
console.error = (...args: any[]) => {
  log('error', args.map(String).join(' '));
};

const apiId = parseInt(process.argv[2] || '0');
const apiHash = process.argv[3] || '';

const clients = new Map<string, TelegramClient>();

function send(data: any) {
  if (process.send) process.send(data);
}

function reply(id: string, success: boolean, dataOrError?: any) {
  send({
    type: 'response',
    id,
    success,
    data: success ? dataOrError : undefined,
    error: success ? undefined : (dataOrError || 'Unknown error'),
  });
}

function log(level: string, message: string) {
  send({ type: 'log', level, message });
}

process.on('message', async (msg: any) => {
  try {
    switch (msg.type) {
      case 'connect':
        await cmdConnect(msg);
        break;
      case 'disconnect':
        await cmdDisconnect(msg);
        break;
      case 'disconnectAll':
        await cmdDisconnectAll(msg);
        break;
      case 'sendDm':
        await cmdSendDm(msg);
        break;
      case 'sendDmViaGroupMsg':
        await cmdSendDmViaGroupMsg(msg);
        break;
      case 'checkSpamBot':
        await cmdCheckSpamBot(msg);
        break;
      case 'getMe':
        await cmdGetMe(msg);
        break;
      case 'isConnected':
        cmdIsConnected(msg);
        break;
      case 'getConnectedList':
        cmdGetConnectedList(msg);
        break;
      case 'setupProfile':
        await cmdSetupProfile(msg);
        break;
      default:
        reply(msg.id, false, 'Unknown command: ' + msg.type);
    }
  } catch (error: any) {
    reply(msg.id, false, error.message || 'Worker command error');
  }
});

async function cmdConnect({ id, sessionId, sessionString }: any) {
  if (clients.has(sessionId)) {
    const existing = clients.get(sessionId)!;
    if (existing.connected) {
      reply(id, true);
      return;
    }
    try { await existing.disconnect(); } catch {}
    clients.delete(sessionId);
  }

  const client = new TelegramClient(
    new StringSession(sessionString),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
      requestRetries: 3,
      useWSS: true,
      floodSleepThreshold: 10,
      autoReconnect: true,
    },
  );

  (client as any)._errorHandler = (err: any) => {
    const m = err?.message || '';
    if (m === 'TIMEOUT' || m === 'Not connected') return;
    log('error', `gramJS error (${sessionId}): ${m}`);
  };

  await client.connect();
  const me = await client.getMe() as any;

  clients.set(sessionId, client);
  log('info', `SMS session connected: ${sessionId} (${me?.phone || 'unknown'})`);
  reply(id, true, { phone: me?.phone, firstName: me?.firstName });
}

async function cmdDisconnect({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  if (client) {
    try { await client.disconnect(); } catch {}
    clients.delete(sessionId);
    log('info', `SMS session disconnected: ${sessionId}`);
  }
  reply(id, true);
}

async function cmdDisconnectAll({ id }: any) {
  for (const [sid, client] of clients) {
    try { await client.disconnect(); } catch {}
    log('info', `SMS session disconnected: ${sid}`);
  }
  clients.clear();
  reply(id, true);
}

async function cmdSendDm({ id, sessionId, targetId, targetUsername, targetPhone, targetAccessHash, message }: any) {
  const client = clients.get(sessionId);
  if (!client) throw new Error(`Session ${sessionId} ulangan emas`);
  if (!client.connected) throw new Error(`Session ${sessionId} aloqa uzilgan`);

  try {
    let peer: any;

    const numId = Number(targetId);

    // 1. Username bilan urinish
    if (targetUsername) {
      try {
        peer = await client.getEntity(targetUsername);
      } catch {
        peer = targetUsername;
      }
    }

    // 2. getEntity (ID cache'da bo'lsa)
    if (!peer && !isNaN(numId) && numId > 0) {
      try {
        peer = await client.getEntity(BigInt(numId) as any);
      } catch {
        // cache'da yo'q
      }
    }

    // 2.5. Monitor session orqali olingan accessHash bilan InputPeerUser
    if (!peer && targetAccessHash && !isNaN(numId) && numId > 0) {
      try {
        peer = new Api.InputPeerUser({
          userId: BigInt(numId) as any,
          accessHash: BigInt(targetAccessHash) as any,
        });
        log('info', `AccessHash ishlatildi: ${targetId} -> ${targetAccessHash.slice(0, 8)}...`);
      } catch (e: any) {
        log('warn', `AccessHash xato: ${e.message}`);
      }
    }

    // 3. Telefon raqam orqali kontakt import — accessHash olish uchun yagona usul
    if (!peer && targetPhone) {
      const cleanPhone = targetPhone.replace(/[^+\d]/g, '');
      log('info', `Import urinish: ${cleanPhone} (target: ${targetId})`);
      try {
        const importResult = await client.invoke(
          new Api.contacts.ImportContacts({
            contacts: [
              new Api.InputPhoneContact({
                clientId: BigInt(Math.floor(Math.random() * 1e15)) as any,
                phone: cleanPhone,
                firstName: 'User',
                lastName: '',
              }),
            ],
          }),
        );
        log('info', `Import natija: users=${importResult.users?.length || 0}, retryContacts=${importResult.retryContacts?.length || 0}`);
        if (importResult.users && importResult.users.length > 0) {
          peer = importResult.users[0];
          log('info', `Kontakt: ${cleanPhone} -> ${(peer as any).id}`);

          // Kontaktdan o'chirish (telefon kitobni to'ldirmaslik uchun)
          try {
            await client.invoke(new Api.contacts.DeleteContacts({
              id: [peer],
            }));
          } catch {}
        }
      } catch (e: any) {
        log('warn', `Import xato: ${cleanPhone} — ${e.message}`);
      }
    }

    if (!peer) {
      throw new Error(`PEER_INVALID:${targetId}`);
    }

    const result = await client.sendMessage(peer, { message });
    reply(id, true, { messageId: result?.id });
  } catch (error: any) {
    const errMsg = error.errorMessage || error.message || '';

    // FLOOD_WAIT
    if (errMsg.includes('FLOOD_WAIT')) {
      const match = errMsg.match(/(\d+)/);
      const waitSeconds = match ? parseInt(match[1]) : 60;
      reply(id, false, `FLOOD_WAIT:${waitSeconds}`);
      return;
    }

    // SPAM detection
    if (
      errMsg.includes('PEER_FLOOD') ||
      errMsg.includes('USER_PRIVACY') ||
      errMsg.includes('YOU_ARE_BLOCKED')
    ) {
      reply(id, false, `SPAM:${errMsg}`);
      return;
    }

    // User not found / invalid
    if (
      errMsg.includes('PEER_ID_INVALID') ||
      errMsg.includes('INPUT_USER_DEACTIVATED') ||
      errMsg.includes('USERNAME_NOT_OCCUPIED') ||
      errMsg.includes('Could not find the input entity')
    ) {
      reply(id, false, `PEER_INVALID:${targetId}`);
      return;
    }

    // Auth issues
    if (
      errMsg.includes('AUTH_KEY_UNREGISTERED') ||
      errMsg.includes('SESSION_REVOKED') ||
      errMsg.includes('USER_DEACTIVATED')
    ) {
      reply(id, false, `SESSION_DEAD:${errMsg}`);
      return;
    }

    throw error;
  }
}

/**
 * Guruh xabaridan sender'ni topib DM yuborish.
 * TG SMS session guruhda a'zo bo'lsa — xabarni fetch qilib sender entity'ni oladi.
 */
async function cmdSendDmViaGroupMsg({ id, sessionId, targetId, sourceGroupId, sourceMessageId, message }: any) {
  const client = clients.get(sessionId);
  if (!client) throw new Error(`Session ${sessionId} ulangan emas`);
  if (!client.connected) throw new Error(`Session ${sessionId} aloqa uzilgan`);

  try {
    // 1. Guruhni topish — har xil ID formatlarini sinash
    let groupEntity: any;
    const rawId = String(sourceGroupId).replace(/^-100/, '');
    const tryIds = [
      `-100${rawId}`,  // supergroup: -100XXXXXXXXX
      rawId,            // raw ID
      sourceGroupId,    // original
    ];

    for (const tryId of tryIds) {
      try {
        groupEntity = await client.getEntity(BigInt(tryId) as any);
        if (groupEntity) break;
      } catch {}
    }

    // Agar entity topilmasa — InputPeerChannel bilan urinish
    if (!groupEntity) {
      try {
        groupEntity = new Api.InputPeerChannel({
          channelId: BigInt(rawId) as any,
          accessHash: BigInt(0) as any,
        });
        // Test: xabar olishga urinish — accessHash 0 bilan ishlamasa xato beradi
      } catch {}
    }

    if (!groupEntity) {
      throw new Error(`Guruh topilmadi: ${sourceGroupId}`);
    }

    // 2. Xabarni fetch qilish — bu sender entity'ni cache'ga qo'shadi
    const msgId = Number(sourceMessageId);
    log('info', `Guruh xabar fetch: group=${sourceGroupId} (${rawId}), msg=${msgId}`);
    const messages = await client.getMessages(groupEntity, { ids: [msgId] });

    if (!messages || messages.length === 0 || !messages[0]) {
      throw new Error(`Xabar topilmadi: group=${sourceGroupId}, msg=${sourceMessageId}`);
    }

    const msg = messages[0];
    const senderId = msg.senderId;
    if (!senderId) {
      throw new Error(`Sender topilmadi: group=${sourceGroupId}, msg=${sourceMessageId}`);
    }

    log('info', `Guruh xabardan sender topildi: ${senderId} (target: ${targetId})`);

    // 3. Endi sender entity cache'da — DM yuborish
    const peer = await client.getEntity(senderId);
    const result = await client.sendMessage(peer, { message });
    reply(id, true, { messageId: result?.id });
  } catch (error: any) {
    const errMsg = error.errorMessage || error.message || '';
    if (errMsg.includes('FLOOD_WAIT')) {
      const match = errMsg.match(/(\d+)/);
      reply(id, false, `FLOOD_WAIT:${match ? parseInt(match[1]) : 60}`);
      return;
    }
    if (errMsg.includes('PEER_FLOOD') || errMsg.includes('USER_PRIVACY')) {
      reply(id, false, `SPAM:${errMsg}`);
      return;
    }
    if (errMsg.includes('CHANNEL_PRIVATE') || errMsg.includes('CHAT_ADMIN_REQUIRED')) {
      reply(id, false, `GROUP_ACCESS_DENIED:${sourceGroupId}`);
      return;
    }
    if (errMsg.includes('CHANNEL_INVALID')) {
      reply(id, false, `CHANNEL_INVALID:${sourceGroupId}`);
      return;
    }
    if (errMsg.includes('PEER_ID_INVALID') || errMsg.includes('INPUT_USER_DEACTIVATED')) {
      reply(id, false, `PEER_INVALID:${targetId}`);
      return;
    }
    throw error;
  }
}

async function cmdCheckSpamBot({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  try {
    // Send /start to @SpamBot
    const result = await client.sendMessage('SpamBot', { message: '/start' });

    // Wait for response (poll for 5 seconds)
    await new Promise((r) => setTimeout(r, 3000));

    const messages = await client.getMessages('SpamBot', { limit: 3 });
    const lastMsg = messages?.[0];
    const text = (lastMsg as any)?.message || '';

    let spamStatus = 'CLEAN';
    let expectedEnd: string | null = null;

    // "свободен" = toza, cheklov yo'q
    if (text.includes('свободен') || text.includes('no limits') || text.includes('free')) {
      spamStatus = 'CLEAN';
    } else if (text.includes('ограничен') || text.includes('limited') || text.includes('spam')) {
      spamStatus = 'SPAM';
      // Try to extract date
      const dateMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
      if (dateMatch) expectedEnd = dateMatch[1];
      if (text.includes('навсегда') || text.includes('permanently')) {
        spamStatus = 'BANNED';
      }
    }

    reply(id, true, { spamStatus, text, expectedEnd });
  } catch (error: any) {
    reply(id, false, `SpamBot check error: ${error.message}`);
  }
}

async function cmdGetMe({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  const me = await client.getMe() as any;
  reply(id, true, {
    id: String(me.id),
    phone: me.phone,
    firstName: me.firstName,
    lastName: me.lastName,
    username: me.username,
  });
}

function cmdIsConnected({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  reply(id, true, { connected: !!client?.connected });
}

function cmdGetConnectedList({ id }: any) {
  const list = Array.from(clients.keys());
  reply(id, true, { sessions: list, count: list.length });
}

async function cmdSetupProfile({ id, sessionId, firstName, lastName, photoPath }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  try {
    // 1. Set name
    await client.invoke(
      new Api.account.UpdateProfile({
        firstName: firstName || "YO'LDA menejer",
        lastName: lastName || '',
      }),
    );
    log('info', `Profile name updated: ${sessionId} -> ${firstName}`);

    // 2. Set photo if file exists
    if (photoPath && fs.existsSync(photoPath)) {
      try {
        const fileBuffer = fs.readFileSync(photoPath);
        const fileSize = fs.statSync(photoPath).size;
        const { CustomFile } = require('telegram/client/uploads');
        const customFile = new CustomFile('profile.png', fileSize, '', fileBuffer);
        const inputFile = await client.uploadFile({
          file: customFile,
          workers: 1,
        });
        await client.invoke(
          new Api.photos.UploadProfilePhoto({
            file: inputFile as any,
          }),
        );
        log('info', `Profile photo updated: ${sessionId}`);
      } catch (photoErr: any) {
        log('warn', `Profile photo update failed: ${photoErr.message}`);
      }
    }

    reply(id, true);
  } catch (error: any) {
    log('warn', `Profile setup error: ${error.message}`);
    reply(id, false, error.message);
  }
}

// Heartbeat
send({ type: 'ready' });
