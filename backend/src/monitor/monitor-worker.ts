/**
 * Monitor Worker — BITTA session uchun BITTA process
 * Har session alohida fork qilinadi — gramJS clientlar bir-biriga xalaqit bermaydi.
 *
 * HYBRID APPROACH:
 *   1. Event-based: gramJS NewMessage handler (real-time, lekin ba'zi sessionlarda ishlamasligi mumkin)
 *   2. Polling fallback: Har 20s da getDialogs + getMessages (ishonchli, barcha sessionlarda ishlaydi)
 *
 * Protocol (IPC):
 *   Main → Child: { type, id, ...params }
 *   Child → Main: { type: 'response', id, success, data/error }
 *                  { type: 'newMessage', sessionId, data }
 *                  { type: 'log', level, message }
 *                  { type: 'heartbeat', sessionId, msgCount, connected }
 */
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

// Suppress gramJS console spam
console.log = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  if (msg.includes('flood wait') || msg.includes('Sleeping for') ||
      msg.includes('TCPFull') || msg.includes('Connecting to') ||
      msg.includes('LAYER') || msg.includes('Running gramJS') ||
      msg.includes('reconnect') || msg.includes('Handling reconnect') ||
      msg.includes('connection closed') || msg.includes('Disconnecting')) {
    return;
  }
  log('info', msg);
};
console.warn = (...args: any[]) => {
  const msg = args.map(String).join(' ');
  if (msg.includes('flood') || msg.includes('reconnect') || msg.includes('Disconnecting')) return;
  log('warn', msg);
};
console.error = (...args: any[]) => {
  log('error', args.map(String).join(' '));
};

// Config from command line args
const apiId = parseInt(process.argv[2] || '0');
const apiHash = process.argv[3] || '';
const sessionId = process.argv[4] || '';

let client: TelegramClient | null = null;
let sessionString = '';
let msgCount = 0;
let eventMsgCount = 0; // Event handler orqali kelgan xabarlar

// Polling state
let pollingActive = false;
let pollInterval: NodeJS.Timeout | null = null;
const lastMessageIds = new Map<string, number>(); // chatId → lastMsgId
const processedMsgIds = new Set<string>(); // chatId_msgId dedup (msg IDs are per-chat!)
const MAX_PROCESSED_IDS = 50_000;

// Chat/Sender caches
const chatCache = new Map<string, { title: string; className: string; id: string; username: string; cachedAt: number }>();
const senderCache = new Map<string, { firstName?: string; lastName?: string; username?: string; accessHash?: string; cachedAt: number }>();
const CHAT_CACHE_TTL = 5 * 60_000;
const SENDER_CACHE_TTL = 10 * 60_000;

// ============================
// Communication helpers
// ============================

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
  send({ type: 'log', level, message: `[${sessionId.slice(-8)}] ${message}` });
}

// ============================
// Command handlers
// ============================

process.on('message', async (msg: any) => {
  try {
    switch (msg.type) {
      case 'connect':
        await cmdConnect(msg);
        break;
      case 'disconnect':
        await cmdDisconnect(msg);
        break;
      case 'getDialogs':
        await cmdGetDialogs(msg);
        break;
      case 'resolveGroupTitle':
        await cmdResolveGroupTitle(msg);
        break;
      case 'isConnected':
        cmdIsConnected(msg);
        break;
      case 'healthCheck':
        cmdHealthCheck(msg);
        break;
      case 'sendDm':
        await cmdSendDm(msg);
        break;
      case 'resolveUser':
        await cmdResolveUser(msg);
        break;
      case 'getJoinedGroupIds':
        await cmdGetJoinedGroupIds(msg);
        break;
      case 'exportInvite':
        await cmdExportInvite(msg);
        break;
      case 'joinByInvite':
        await cmdJoinByInvite(msg);
        break;
      case 'joinByUsername':
        await cmdJoinByUsername(msg);
        break;
      case 'inviteUserToGroup':
        await cmdInviteUserToGroup(msg);
        break;
      default:
        reply(msg.id, false, 'Unknown command: ' + msg.type);
    }
  } catch (error: any) {
    reply(msg.id, false, error.message || 'Worker command error');
  }
});

async function cmdConnect({ id, sessionString: ss }: any) {
  // Disconnect existing
  if (client) {
    try { await client.disconnect(); } catch {}
    client = null;
  }
  stopPolling();

  sessionString = ss;

  client = new TelegramClient(
    new StringSession(sessionString),
    apiId,
    apiHash,
    {
      connectionRetries: 5,
      requestRetries: 3,
      useWSS: true,
      floodSleepThreshold: 30, // 30s max flood wait (120 bloklardi)
      autoReconnect: true,
    },
  );

  // Suppress noisy gramJS errors
  (client as any)._errorHandler = (err: any) => {
    const m = err?.message || '';
    if (m === 'TIMEOUT' || m === 'Not connected') return;
    log('error', `gramJS error: ${m}`);
  };

  await client.connect();
  const me = await client.getMe();
  if (!me) throw new Error('Session validation failed');

  msgCount = 0;
  eventMsgCount = 0;

  // Message handler (event-based — real-time when it works)
  client.addEventHandler(
    async (event: NewMessageEvent) => {
      try {
        const message = event.message;
        if (!message) return;

        // Track this message as processed (so polling doesn't duplicate it)
        if (message.id && message.chatId) {
          processedMsgIds.add(`${message.chatId}_${message.id}`);
          cleanupProcessedIds();
        }

        eventMsgCount++;
        msgCount++;
        if (msgCount <= 3 || msgCount % 500 === 0) {
          log('info', `message #${msgCount} (event)`);
        }
        await processMessage(message);
      } catch (error: any) {
        log('error', `Message handler error: ${error.message}`);
      }
    },
    new NewMessage({}),
  );

  // Initial sync — cache dialog states for polling
  try {
    const dialogs = await client.getDialogs({ limit: 100 });
    const groups = dialogs.filter((d: any) => d.isGroup || d.isChannel);
    log('info', `sync: ${groups.length} guruh, ${dialogs.length} dialog`);

    // Cache last message IDs for polling baseline
    for (const dialog of groups) {
      const did = String(dialog.id);
      const lastMsg = (dialog as any).message;
      if (lastMsg?.id) {
        lastMessageIds.set(did, lastMsg.id);
        // Mark existing messages as processed (use chatId from message for consistency)
        const chatId = lastMsg.chatId ? String(lastMsg.chatId) : did;
        processedMsgIds.add(`${chatId}_${lastMsg.id}`);
      }
    }

    // Test read
    if (groups.length > 0) {
      try {
        const testGroup = groups[0];
        const msgs = await client.getMessages(testGroup.id, { limit: 1 });
        log('info', `test read from "${(testGroup as any).title}": ${msgs.length ? 'OK' : 'EMPTY'}`);
      } catch (e: any) {
        log('warn', `test read failed: ${e.message}`);
      }
    }
  } catch (e: any) {
    log('warn', `sync failed: ${e.message}`);
  }

  // Start polling fallback
  startPolling();

  log('info', 'session connected (hybrid: events + polling)');
  reply(id, true);
}

// ============================
// POLLING FALLBACK
// Har 20 sekundda getDialogs() → yangi xabarlarni olish
// ============================

function startPolling() {
  if (pollingActive) return;
  pollingActive = true;

  // Dastlabki poll 10s dan keyin (event handler ga vaqt berish)
  setTimeout(() => {
    if (!pollingActive) return;
    pollForMessages().catch(e => log('warn', `Initial poll error: ${e.message}`));
  }, 10_000);

  // Keyin har 20s (adaptive — event ishlamasa 5s ga tushadi)
  pollInterval = setInterval(() => {
    if (!pollingActive || !client?.connected) return;
    pollForMessages().catch(e => log('warn', `Poll error: ${e.message}`));
  }, 20_000);

  // 60s dan keyin event handler ishlayotganini tekshir
  // Agar event 0 bo'lsa — polling ni 5s ga tezlashtir
  setTimeout(() => {
    if (!pollingActive) return;
    if (eventMsgCount === 0 && msgCount > 0) {
      log('warn', `Event handler ishlamayapti (0 events, ${msgCount} poll msgs). Polling 5s ga tezlashtirildi.`);
      adaptivePollInterval = 5_000;
      // Restart polling with faster interval
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(() => {
        if (!pollingActive || !client?.connected) return;
        pollForMessages().catch(e => log('warn', `Poll error: ${e.message}`));
      }, adaptivePollInterval);
    } else {
      log('info', `Event handler ishlayapti (${eventMsgCount} events). Polling 20s da qoldi.`);
    }
  }, 60_000);
}

function stopPolling() {
  pollingActive = false;
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

let pollCount = 0;
let pollNewMessages = 0;
let pollInProgress = false;
let adaptivePollInterval = 20_000; // Starts at 20s, drops to 5s if events don't work

async function pollForMessages() {
  if (!client?.connected) return;
  if (pollInProgress) {
    log('warn', 'poll skipped — previous still running');
    return;
  }

  pollInProgress = true;
  pollCount++;

  try {
    // getDialogs returns latest message per dialog — O(1) API call
    const dialogs = await client.getDialogs({ limit: 200 });
    const groups = dialogs.filter((d: any) => d.isGroup || d.isChannel);

    let newFound = 0;
    const groupsToFetch: Array<{ id: any; dialogId: string; lastKnown: number }> = [];

    for (const dialog of groups) {
      const did = String(dialog.id);
      const lastMsg = (dialog as any).message;
      if (!lastMsg?.id) continue;

      const lastKnown = lastMessageIds.get(did) || 0;

      if (lastMsg.id > lastKnown) {
        // Yangi xabar bor — fetch qilish kerak
        groupsToFetch.push({ id: dialog.id, dialogId: did, lastKnown });
        // Update baseline
        lastMessageIds.set(did, lastMsg.id);
      }
    }

    // Fetch new messages from groups that have updates
    // Adaptive: event ishlamasa ko'proq guruh va xabar olish
    const MAX_FETCH_PER_POLL = adaptivePollInterval <= 10_000 ? 50 : 30;
    const MSG_LIMIT_PER_GROUP = adaptivePollInterval <= 10_000 ? 5 : 3;
    const toFetch = groupsToFetch.slice(0, MAX_FETCH_PER_POLL);

    for (const group of toFetch) {
      try {
        const messages = await client.getMessages(group.id, { limit: MSG_LIMIT_PER_GROUP });

        for (const message of messages) {
          if (!message?.id) continue;

          // Use chatId from message if available, fallback to group.dialogId
          const chatId = message.chatId ? String(message.chatId) : group.dialogId;
          const msgKey = `${chatId}_${message.id}`;

          // Skip already processed (by event handler or previous poll)
          if (processedMsgIds.has(msgKey)) continue;

          processedMsgIds.add(msgKey);
          cleanupProcessedIds();

          newFound++;
          pollNewMessages++;
          msgCount++;

          if (newFound <= 3 || newFound % 100 === 0) {
            log('info', `message #${msgCount} (poll)`);
          }

          try {
            await processMessage(message);
          } catch (e: any) {
            log('warn', `Poll message process error: ${e.message}`);
          }
        }
      } catch (e: any) {
        // Skip this group if error (e.g., banned, left)
        if (!e.message?.includes('CHANNEL_PRIVATE') && !e.message?.includes('CHAT_WRITE_FORBIDDEN')) {
          log('warn', `Poll fetch error for group: ${e.message}`);
        }
      }
    }

    // Periodic status log — har 10 ta pollda, yoki birinchi 5 ta
    if (pollCount <= 5 || pollCount % 10 === 0 || newFound > 0) {
      log('info', `poll #${pollCount}: ${groups.length} groups, ${groupsToFetch.length} updated, ${newFound} new msgs (total poll: ${pollNewMessages}, event: ${eventMsgCount})`);
    }
  } catch (e: any) {
    log('warn', `Poll dialogs error: ${e.message}`);
  } finally {
    pollInProgress = false;
  }
}

function cleanupProcessedIds() {
  if (processedMsgIds.size > MAX_PROCESSED_IDS) {
    // Remove oldest half
    const arr = Array.from(processedMsgIds);
    const toRemove = arr.slice(0, arr.length / 2);
    for (const id of toRemove) processedMsgIds.delete(id);
  }
}

// ============================
// Message processing (shared between event handler and polling)
// ============================

async function processMessage(message: any) {
  if (!message?.text) return;

  const peerId = message.peerId;
  if (!peerId) return;
  if ((peerId as any).className === 'PeerUser') return;

  const text = message.text;
  if (text.length < 15) return;

  const chatId = message.chatId ? String(message.chatId) : null;
  if (!chatId) return;

  // Chat info (cached)
  const now = Date.now();
  let chatTitle = '';
  let chatClassName = '';
  let chatRealId = chatId;
  let chatUsername = '';

  const cached = chatCache.get(chatId);
  if (cached && now - cached.cachedAt < CHAT_CACHE_TTL) {
    chatTitle = cached.title;
    chatClassName = cached.className;
    chatRealId = cached.id;
    chatUsername = cached.username;
  } else {
    try {
      const chat = await message.getChat();
      if (!chat) return;
      chatClassName = (chat as any).className || '';
      chatTitle = (chat as any).title || '';
      chatRealId = String((chat as any).id || chatId);
      chatUsername = (chat as any).username || '';
      chatCache.set(chatId, { title: chatTitle, className: chatClassName, id: chatRealId, username: chatUsername, cachedAt: now });
    } catch {
      return;
    }
  }

  if (chatClassName !== 'Chat' && chatClassName !== 'Channel') return;

  // Sender info (cached)
  let senderFirstName: string | undefined;
  let senderLastName: string | undefined;
  let senderUsername: string | undefined;
  const rawSenderId = message.senderId ? String(message.senderId) : null;

  let senderAccessHash: string | undefined;

  if (rawSenderId) {
    const cachedSender = senderCache.get(rawSenderId);
    if (cachedSender && now - cachedSender.cachedAt < SENDER_CACHE_TTL) {
      senderFirstName = cachedSender.firstName;
      senderLastName = cachedSender.lastName;
      senderUsername = cachedSender.username;
      senderAccessHash = cachedSender.accessHash;
    } else {
      try {
        const sender = await message.getSender();
        if (sender && 'firstName' in sender) {
          senderFirstName = (sender as any).firstName;
          senderLastName = (sender as any).lastName;
          senderUsername = (sender as any).username;
          senderAccessHash = (sender as any).accessHash ? String((sender as any).accessHash) : undefined;
          senderCache.set(rawSenderId, {
            firstName: senderFirstName,
            lastName: senderLastName,
            username: senderUsername,
            accessHash: senderAccessHash,
            cachedAt: now,
          });
        }
      } catch {
        // Ignore
      }
    }
  }

  // Send to main process
  send({
    type: 'newMessage',
    sessionId,
    data: {
      text,
      chatId,
      chatTitle,
      groupTelegramId: chatRealId,
      groupUsername: chatUsername,
      messageId: String(message.id),
      senderId: rawSenderId,
      senderAccessHash,
      senderFirstName,
      senderLastName,
      senderUsername,
      date: message.date,
    },
  });
}

async function cmdDisconnect({ id }: any) {
  stopPolling();
  if (client) {
    try { await client.disconnect(); } catch {}
    client = null;
    log('info', 'session disconnected');
  }
  reply(id, true);
  // Process ni tugatish
  setTimeout(() => process.exit(0), 1000);
}

async function cmdGetDialogs({ id }: any) {
  if (!client?.connected) {
    reply(id, false, 'Session not connected');
    return;
  }

  const allGroups: Array<{ id: string; title: string }> = [];
  let offsetDate = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const dialogs = await client.getDialogs({
      limit: 500,
      ...(offsetDate ? { offsetDate } : {}),
    });

    if (!dialogs || dialogs.length === 0) break;

    const groups = dialogs
      .filter((d: any) => d.isGroup || d.isChannel)
      .map((d: any) => ({ id: String(d.id), title: d.title || '' }));

    allGroups.push(...groups);

    if (dialogs.length < 500) break;

    const lastDialog = dialogs[dialogs.length - 1] as any;
    const lastDate = lastDialog?.date || lastDialog?.message?.date;
    if (!lastDate || lastDate === offsetDate) break;
    offsetDate = lastDate;
  }

  const seen = new Set<string>();
  const uniqueGroups = allGroups.filter(g => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  reply(id, true, { groups: uniqueGroups, total: uniqueGroups.length });
}

async function cmdResolveGroupTitle({ id, groupTelegramId }: any) {
  if (!client?.connected) {
    reply(id, true, '');
    return;
  }

  const normalize = (s: string) => {
    let v = s.trim();
    if (v.startsWith('-100') && v.length > 4) return v.substring(4);
    if (v.startsWith('-') && v.length > 1) return v.substring(1);
    return v;
  };
  const target = normalize(groupTelegramId);

  try {
    const dialogs = await client.getDialogs({ limit: 500 });
    for (const dialog of dialogs) {
      if (normalize(String(dialog.id)) === target) {
        reply(id, true, dialog.title || '');
        return;
      }
    }
  } catch { /* ignore */ }
  reply(id, true, '');
}

function cmdIsConnected({ id }: any) {
  reply(id, true, !!client?.connected);
}

function cmdHealthCheck({ id }: any) {
  reply(id, true, {
    connected: !!client?.connected,
    msgCount,
    eventMsgCount,
    pollMsgCount: pollNewMessages,
    pollCount,
    sessionId,
  });
}

// ============================
// Send DM via monitor session (has entity cache for group members)
// ============================
async function cmdSendDm({ id, targetId, targetUsername, targetPhone, message }: any) {
  if (!client?.connected) {
    reply(id, false, 'Monitor session not connected');
    return;
  }

  try {
    let peer: any;

    // 1. Username (most reliable — resolves any public user)
    if (targetUsername) {
      try {
        peer = await client.getEntity(targetUsername);
      } catch {
        peer = targetUsername;
      }
    }

    // 2. Numeric ID — try entity cache
    if (!peer) {
      const numId = Number(targetId);
      if (!isNaN(numId) && numId > 0) {
        try {
          peer = await client.getEntity(BigInt(numId) as any);
        } catch {
          // cache'da yo'q
        }
      }
    }

    // 3. Telefon raqam orqali kontakt import
    if (!peer && targetPhone) {
      const cleanPhone = targetPhone.replace(/[^+\d]/g, '');
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
        if (importResult.users && importResult.users.length > 0) {
          peer = importResult.users[0];
          log('info', `Monitor kontakt: ${cleanPhone} -> ${(peer as any).id}`);
          // Kontaktdan o'chirish
          try {
            await client.invoke(new Api.contacts.DeleteContacts({ id: [peer] }));
          } catch {}
        }
      } catch (e: any) {
        log('warn', `Monitor import xato: ${cleanPhone} — ${e.message}`);
      }
    }

    if (!peer) {
      throw new Error(`Could not find the input entity for user ${targetId}`);
    }

    const result = await client.sendMessage(peer, { message });
    reply(id, true, { messageId: result?.id });
  } catch (error: any) {
    const errMsg = error.errorMessage || error.message || '';
    reply(id, false, errMsg);
  }
}

// ============================
// Priority group auto-join
// ============================

function normalizeGid(s: string): string {
  let v = String(s).trim();
  if (v.startsWith('-100') && v.length > 4) return v.substring(4);
  if (v.startsWith('-') && v.length > 1) return v.substring(1);
  return v;
}

async function cmdGetJoinedGroupIds({ id }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const ids: string[] = [];
    let offsetDate = 0;
    for (let i = 0; i < 5; i++) {
      const dialogs = await client.getDialogs({ limit: 500, ...(offsetDate ? { offsetDate } : {}) });
      if (!dialogs?.length) break;
      for (const d of dialogs) {
        if ((d as any).isGroup || (d as any).isChannel) {
          ids.push(normalizeGid(String((d as any).id)));
        }
      }
      if (dialogs.length < 500) break;
      const last = dialogs[dialogs.length - 1] as any;
      const lastDate = last?.date || last?.message?.date;
      if (!lastDate || lastDate === offsetDate) break;
      offsetDate = lastDate;
    }
    reply(id, true, Array.from(new Set(ids)));
  } catch (e: any) {
    reply(id, false, e.message || 'getJoinedGroupIds failed');
  }
}

async function findDialogEntity(targetGid: string): Promise<any> {
  if (!client) return null;
  const target = normalizeGid(targetGid);
  let offsetDate = 0;
  for (let i = 0; i < 5; i++) {
    const dialogs = await client.getDialogs({ limit: 500, ...(offsetDate ? { offsetDate } : {}) });
    if (!dialogs?.length) break;
    for (const d of dialogs) {
      if (normalizeGid(String((d as any).id)) === target) {
        return (d as any).entity || (d as any).inputEntity || d;
      }
    }
    if (dialogs.length < 500) break;
    const last = dialogs[dialogs.length - 1] as any;
    const lastDate = last?.date || last?.message?.date;
    if (!lastDate || lastDate === offsetDate) break;
    offsetDate = lastDate;
  }
  return null;
}

async function cmdExportInvite({ id, groupTelegramId }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const entity: any = await findDialogEntity(groupTelegramId);
    if (!entity) {
      reply(id, false, 'Group not in dialogs');
      return;
    }

    // 1-urinish: Public username bor bo'lsa — bu eng ishonchli yo'l
    const username = entity.username || entity.usernames?.[0]?.username;
    if (username) {
      reply(id, true, { hash: null, link: null, username });
      return;
    }

    // 2-urinish: GetFullChannel orqali admin yaratgan invite-ni o'qish (oddiy a'zo ham ko'radi)
    if (entity.className === 'Channel') {
      try {
        const inputChannel = new Api.InputChannel({
          channelId: entity.id,
          accessHash: entity.accessHash,
        });
        const full: any = await client.invoke(
          new Api.channels.GetFullChannel({ channel: inputChannel }),
        );
        const exportedInvite = full?.fullChat?.exportedInvite;
        const link: string = exportedInvite?.link || '';
        if (link) {
          const hash = (link.split('/').pop() || '').replace(/^\+/, '');
          if (hash) {
            reply(id, true, { hash, link, username: null });
            return;
          }
        }
      } catch {
        // davom etamiz
      }
    }

    // 3-urinish: Admin huquqi bor bo'lsa — ExportChatInvite
    try {
      const peer = await client.getInputEntity(entity);
      const result: any = await client.invoke(
        new Api.messages.ExportChatInvite({ peer }) as any,
      );
      const link: string = result?.link || '';
      const hash = (link.split('/').pop() || '').replace(/^\+/, '');
      if (hash) {
        reply(id, true, { hash, link, username: null });
        return;
      }
    } catch {
      // admin emas
    }

    reply(id, false, 'No invite (no username, no public invite link, no admin rights)');
  } catch (e: any) {
    reply(id, false, e.errorMessage || e.message || 'exportInvite failed');
  }
}

async function cmdJoinByInvite({ id, inviteHash }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const hash = String(inviteHash)
      .replace(/^https?:\/\//i, '')
      .replace(/^t\.me\//i, '')
      .replace(/^joinchat\//i, '')
      .replace(/^\+/, '');
    if (!hash) {
      reply(id, false, 'Empty hash');
      return;
    }
    await client.invoke(new Api.messages.ImportChatInvite({ hash }));
    reply(id, true, { ok: true });
  } catch (e: any) {
    const em = e.errorMessage || e.message || 'joinByInvite failed';
    if (em.includes('USER_ALREADY_PARTICIPANT')) {
      reply(id, true, { ok: true, already: true });
      return;
    }
    reply(id, false, em);
  }
}

/**
 * Donor session (guruhda bor) to'g'ridan-to'g'ri target sessionni qo'shadi.
 * Admin tasdiqi kerak emas, chunki a'zo o'zi boshqa odamni qo'shyapti.
 */
async function cmdInviteUserToGroup({ id, groupTelegramId, targetPhone, targetUsername }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const group: any = await findDialogEntity(groupTelegramId);
    if (!group) {
      reply(id, false, 'Group not in dialogs');
      return;
    }

    // 1. Target foydalanuvchini topish
    let targetUser: any = null;
    let importedContact = false;

    // 1a. Username orqali
    if (!targetUser && targetUsername) {
      try {
        targetUser = await client.getEntity(String(targetUsername).replace(/^@/, ''));
      } catch {
        // davom etamiz
      }
    }

    // 1b. Telefon orqali (kontaktga import qilib)
    if (!targetUser && targetPhone) {
      const cleanPhone = String(targetPhone).replace(/[^+\d]/g, '');
      try {
        const importResult: any = await client.invoke(
          new Api.contacts.ImportContacts({
            contacts: [
              new Api.InputPhoneContact({
                clientId: BigInt(Math.floor(Math.random() * 1e15)) as any,
                phone: cleanPhone,
                firstName: 'Session',
                lastName: '',
              }),
            ],
          }),
        );
        if (importResult.users?.length) {
          targetUser = importResult.users[0];
          importedContact = true;
        }
      } catch (e: any) {
        log('warn', `ImportContacts: ${e.message}`);
      }
    }

    if (!targetUser || !targetUser.accessHash) {
      reply(id, false, 'Target user topilmadi (phone/username ishlamadi)');
      return;
    }

    const inputUser = new Api.InputUser({
      userId: targetUser.id,
      accessHash: targetUser.accessHash,
    });

    // 2. Guruhga qo'shish (Channel yoki Chat)
    try {
      if (group.className === 'Channel') {
        const inputChannel = new Api.InputChannel({
          channelId: group.id,
          accessHash: group.accessHash,
        });
        await client.invoke(
          new Api.channels.InviteToChannel({
            channel: inputChannel,
            users: [inputUser],
          }),
        );
      } else {
        // Oddiy chat (kichik guruh)
        await client.invoke(
          new Api.messages.AddChatUser({
            chatId: group.id,
            userId: inputUser,
            fwdLimit: 0,
          }),
        );
      }
      reply(id, true, { ok: true, method: 'direct' });
    } finally {
      // 3. Kontakt import qilingan bo'lsa — o'chirish
      if (importedContact && targetUser) {
        try {
          await client.invoke(new Api.contacts.DeleteContacts({ id: [targetUser] }));
        } catch {
          // e'tiborsiz
        }
      }
    }
  } catch (e: any) {
    const em = e.errorMessage || e.message || 'inviteUser failed';
    if (em.includes('USER_ALREADY_PARTICIPANT')) {
      reply(id, true, { ok: true, already: true, method: 'direct' });
      return;
    }
    reply(id, false, em);
  }
}

async function cmdJoinByUsername({ id, username }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const uname = String(username).replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '');
    const resolved: any = await client.invoke(new Api.contacts.ResolveUsername({ username: uname }));
    const chat = resolved?.chats?.[0];
    if (!chat) {
      reply(id, false, 'Username not found');
      return;
    }
    await client.invoke(
      new Api.channels.JoinChannel({
        channel: new Api.InputChannel({ channelId: chat.id, accessHash: chat.accessHash }),
      }),
    );
    reply(id, true, { ok: true, groupId: String(chat.id) });
  } catch (e: any) {
    const em = e.errorMessage || e.message || 'joinByUsername failed';
    if (em.includes('USER_ALREADY_PARTICIPANT')) {
      reply(id, true, { ok: true, already: true });
      return;
    }
    reply(id, false, em);
  }
}

// ============================
// Periodic keepalive — force reconnect if disconnected
// ============================
setInterval(async () => {
  if (!client) return;

  if (!client.connected) {
    log('warn', 'Keepalive: disconnected, reconnecting...');
    try {
      await client.connect();
      await client.getDialogs({ limit: 1 });
      log('info', 'Keepalive: reconnected');
    } catch (e: any) {
      log('error', `Keepalive reconnect failed: ${e.message}`);
    }
    return;
  }
}, 2 * 60_000);

// Periodic cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of chatCache) {
    if (now - val.cachedAt > CHAT_CACHE_TTL) chatCache.delete(key);
  }
  for (const [key, val] of senderCache) {
    if (now - val.cachedAt > SENDER_CACHE_TTL) senderCache.delete(key);
  }
}, 5 * 60_000);

// Periodic heartbeat — main process ga holat xabar berish
async function cmdResolveUser({ id, telegramId }: any) {
  if (!client?.connected) {
    reply(id, false, 'Not connected');
    return;
  }
  try {
    const bigId = BigInt(telegramId);
    log('info', `resolveUser: trying ${telegramId}`);
    const entity = await client.getEntity(bigId as any);
    if (entity && (entity as any).accessHash) {
      const ah = String((entity as any).accessHash);
      log('info', `resolveUser OK: ${telegramId} -> hash=${ah.slice(0, 8)}...`);
      reply(id, true, {
        id: String((entity as any).id),
        accessHash: ah,
      });
    } else {
      log('warn', `resolveUser: ${telegramId} — entity topildi lekin accessHash yo'q`);
      reply(id, false, 'No accessHash');
    }
  } catch (e: any) {
    log('warn', `resolveUser: ${telegramId} — ${e.message || 'Not in cache'}`);
    reply(id, false, e.message || 'Not in cache');
  }
}

setInterval(() => {
  send({
    type: 'heartbeat',
    sessionId,
    msgCount,
    connected: !!client?.connected,
  });
}, 30_000);

log('info', 'worker process started');
