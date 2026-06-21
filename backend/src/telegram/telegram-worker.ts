/**
 * Telegram Posting Worker (child_process.fork)
 * gramJS TelegramClient instances for posting sessions run here
 * in a completely separate process to prevent MTProto crypto
 * from blocking the main process's event loop.
 *
 * Protocol (IPC):
 *   Main → Child: { type, id, ...params }
 *   Child → Main: { type: 'response', id, success, data/error }
 *                  { type: 'log', level, message }
 */
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Logger as GramJSLogger } from 'telegram/extensions';

// Suppress gramJS console spam (flood waits, reconnects, etc.)
// Redirect to our IPC-based log function
const origConsoleLog = console.log;
const origConsoleWarn = console.warn;
const origConsoleError = console.error;

console.log = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  // Skip noisy gramJS messages
  if (msg.includes('flood wait') || msg.includes('Sleeping for') ||
      msg.includes('TCPFull') || msg.includes('Connecting to') ||
      msg.includes('LAYER') || msg.includes('Running gramJS') ||
      msg.includes('reconnect') || msg.includes('Handling reconnect')) {
    return;
  }
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

// Config from command line args
const apiId = parseInt(process.argv[2] || '0');
const apiHash = process.argv[3] || '';

const clients = new Map<string, TelegramClient>();
const entityCacheTimes = new Map<string, number>();

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
      case 'sendMessage':
        await cmdSendMessage(msg);
        break;
      case 'deleteMessage':
        await cmdDeleteMessage(msg);
        break;
      case 'getDialogs':
        await cmdGetDialogs(msg);
        break;
      case 'getMe':
        await cmdGetMe(msg);
        break;
      case 'isConnected':
        cmdIsConnected(msg);
        break;
      case 'getConnectedCount':
        cmdGetConnectedCount(msg);
        break;
      case 'resolveUser':
        await cmdResolveUser(msg);
        break;
      default:
        reply(msg.id, false, 'Unknown command: ' + msg.type);
    }
  } catch (error: any) {
    reply(msg.id, false, error.message || 'Worker command error');
  }
});

async function cmdConnect({ id, sessionId, sessionString }: any) {
  // Already connected?
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
  await client.getMe();

  // Entity cache — faqat birinchi ulanishda yoki 1 soatdan keyin
  const lastCacheKey = `entity_cache_${sessionId}`;
  const lastCacheTime = entityCacheTimes.get(lastCacheKey);
  const CACHE_TTL_MS = 60 * 60 * 1000;
  if (!lastCacheTime || (Date.now() - lastCacheTime) > CACHE_TTL_MS) {
    try {
      await client.getDialogs({ limit: 300 });
      entityCacheTimes.set(lastCacheKey, Date.now());
      log('info', `Entity cache filled: ${sessionId}`);
    } catch (err: any) {
      log('warn', `Dialog load error (${sessionId}): ${err.message}`);
    }
  }

  clients.set(sessionId, client);
  log('info', `Session connected: ${sessionId}`);
  reply(id, true);
}

async function cmdDisconnect({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  if (client) {
    try { await client.disconnect(); } catch {}
    clients.delete(sessionId);
    log('info', `Session disconnected: ${sessionId}`);
  }
  reply(id, true);
}

async function cmdDisconnectAll({ id }: any) {
  for (const [sid, client] of clients) {
    try { await client.disconnect(); } catch {}
    log('info', `Session disconnected: ${sid}`);
  }
  clients.clear();
  reply(id, true);
}

async function cmdSendMessage({ id, sessionId, peer, message }: any) {
  const client = clients.get(sessionId);
  if (!client) throw new Error(`Session ${sessionId} ulangan emas`);
  if (!client.connected) throw new Error(`Session ${sessionId} aloqa uzilgan`);

  try {
    const numPeer = Number(peer);
    if (isNaN(numPeer)) throw new Error(`Noto'g'ri guruh ID: ${peer}`);

    const result = await client.sendMessage(numPeer, { message });
    reply(id, true, { messageId: result?.id });
  } catch (error: any) {
    // Propagate specific error types for the main process to handle
    if (error.errorMessage?.includes('FLOOD_WAIT') || error.message?.includes('FLOOD_WAIT')) {
      const match = (error.errorMessage || error.message).match(/(\d+)/);
      const waitSeconds = match ? parseInt(match[1]) : 60;
      reply(id, false, `FLOOD_WAIT:${waitSeconds}`);
      return;
    }
    if (error.errorMessage?.includes('SLOWMODE_WAIT') || error.seconds) {
      const waitSeconds = error.seconds || 300;
      reply(id, false, `SLOWMODE_WAIT:${waitSeconds}`);
      return;
    }
    if (
      error.errorMessage?.includes('CHAT_WRITE_FORBIDDEN') ||
      error.errorMessage?.includes('USER_BANNED') ||
      error.errorMessage?.includes('CHANNEL_PRIVATE') ||
      error.errorMessage?.includes('CHAT_ADMIN_REQUIRED') ||
      error.errorMessage?.includes('ADD_USER') ||
      error.errorMessage?.includes('INVITE_HASH') ||
      error.message?.includes('need to add')
    ) {
      const reason = error.errorMessage || 'UNKNOWN';
      reply(id, false, `WRITE_FORBIDDEN:${reason}:${peer}`);
      return;
    }
    if (
      error.errorMessage?.includes('PEER_ID_INVALID') ||
      error.errorMessage?.includes('INPUT_USER_DEACTIVATED') ||
      error.message?.includes('Could not find the input entity')
    ) {
      reply(id, false, `PEER_INVALID:${peer}`);
      return;
    }
    throw error;
  }
}

async function cmdDeleteMessage({ id, sessionId, chatId, messageId }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, true, false);
    return;
  }

  try {
    await client.invoke(
      new Api.messages.DeleteMessages({
        id: [messageId],
        revoke: true,
      }),
    );
    reply(id, true, true);
  } catch {
    // Try channel API
    try {
      const inputPeer = await client.getInputEntity(Number(chatId));
      await client.invoke(
        new Api.channels.DeleteMessages({
          channel: inputPeer as any,
          id: [messageId],
        }),
      );
      reply(id, true, true);
    } catch (innerErr: any) {
      log('warn', `Delete error (session: ${sessionId}, chat: ${chatId}, msg: ${messageId}): ${innerErr.message}`);
      reply(id, true, false);
    }
  }
}

async function cmdGetDialogs({ id, sessionId, limit }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  // Pagination — barcha dialoglarni olish (500 ta chunk)
  const allGroups: Array<{ id: string; title: string; isGroup: boolean; isChannel: boolean }> = [];
  const batchSize = limit || 500;
  let offsetDate = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 5; // Himoya — 5*500 = 2500 dialog max

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const dialogs = await client.getDialogs({
      limit: batchSize,
      ...(offsetDate ? { offsetDate } : {}),
    });

    if (!dialogs || dialogs.length === 0) break;

    const groups = dialogs
      .filter((d: any) => d.isGroup || d.isChannel)
      .map((d: any) => ({ id: String(d.id), title: d.title || '', isGroup: d.isGroup, isChannel: d.isChannel }));

    allGroups.push(...groups);

    // Keyingi sahifa uchun oxirgi dialog sanasi
    if (dialogs.length < batchSize) break; // Hammasi olindi

    const lastDialog = dialogs[dialogs.length - 1] as any;
    const lastDate = lastDialog?.date || lastDialog?.message?.date;
    if (!lastDate || lastDate === offsetDate) break; // Progress yo'q
    offsetDate = lastDate;
  }

  // Dublikatlarni olib tashlash (pagination overlap)
  const seen = new Set<string>();
  const uniqueGroups = allGroups.filter(g => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  reply(id, true, { groups: uniqueGroups, total: uniqueGroups.length });
}

async function cmdGetMe({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  const me = await client.getMe();
  reply(id, true, {
    id: String((me as any).id),
    firstName: (me as any).firstName,
    lastName: (me as any).lastName,
    username: (me as any).username,
    phone: (me as any).phone,
  });
}

function cmdIsConnected({ id, sessionId }: any) {
  const client = clients.get(sessionId);
  reply(id, true, !!client?.connected);
}

function cmdGetConnectedCount({ id }: any) {
  let count = 0;
  for (const [, client] of clients) {
    if (client.connected) count++;
  }
  reply(id, true, count);
}

async function cmdResolveUser({ id, telegramId }: any) {
  const bigId = BigInt(telegramId);
  for (const [sessionId, client] of clients) {
    if (!client.connected) continue;
    try {
      const entity = await client.getEntity(bigId as any);
      if (entity && (entity as any).accessHash) {
        reply(id, true, {
          id: String((entity as any).id),
          accessHash: String((entity as any).accessHash),
          sessionId,
        });
        return;
      }
    } catch {
      // bu sessionda cache'da yo'q
    }
  }
  reply(id, false, 'User not found in any session cache');
}

log('info', 'Telegram posting worker process initialized');
