"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var events_1 = require("telegram/events");
// Suppress gramJS console spam
console.log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var msg = args.map(String).join(' ');
    if (msg.includes('flood wait') || msg.includes('Sleeping for') ||
        msg.includes('TCPFull') || msg.includes('Connecting to') ||
        msg.includes('LAYER') || msg.includes('Running gramJS') ||
        msg.includes('reconnect') || msg.includes('Handling reconnect') ||
        msg.includes('connection closed') || msg.includes('Disconnecting')) {
        return;
    }
    log('info', msg);
};
console.warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var msg = args.map(String).join(' ');
    if (msg.includes('flood') || msg.includes('reconnect') || msg.includes('Disconnecting'))
        return;
    log('warn', msg);
};
console.error = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    log('error', args.map(String).join(' '));
};
// Config from command line args
var apiId = parseInt(process.argv[2] || '0');
var apiHash = process.argv[3] || '';
var sessionId = process.argv[4] || '';
var client = null;
var sessionString = '';
var msgCount = 0;
var eventMsgCount = 0; // Event handler orqali kelgan xabarlar
// Polling state
var pollingActive = false;
var pollInterval = null;
var lastMessageIds = new Map(); // chatId → lastMsgId
var processedMsgIds = new Set(); // chatId_msgId dedup (msg IDs are per-chat!)
var MAX_PROCESSED_IDS = 50000;
// Chat/Sender caches
var chatCache = new Map();
var senderCache = new Map();
var CHAT_CACHE_TTL = 5 * 60000;
var SENDER_CACHE_TTL = 10 * 60000;
// ============================
// Communication helpers
// ============================
function send(data) {
    if (process.send)
        process.send(data);
}
function reply(id, success, dataOrError) {
    send({
        type: 'response',
        id: id,
        success: success,
        data: success ? dataOrError : undefined,
        error: success ? undefined : (dataOrError || 'Unknown error'),
    });
}
function log(level, message) {
    send({ type: 'log', level: level, message: "[".concat(sessionId.slice(-8), "] ").concat(message) });
}
// ============================
// Command handlers
// ============================
process.on('message', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 17, , 18]);
                _a = msg.type;
                switch (_a) {
                    case 'connect': return [3 /*break*/, 1];
                    case 'disconnect': return [3 /*break*/, 3];
                    case 'getDialogs': return [3 /*break*/, 5];
                    case 'resolveGroupTitle': return [3 /*break*/, 7];
                    case 'isConnected': return [3 /*break*/, 9];
                    case 'healthCheck': return [3 /*break*/, 10];
                    case 'sendDm': return [3 /*break*/, 11];
                    case 'resolveUser': return [3 /*break*/, 13];
                }
                return [3 /*break*/, 15];
            case 1: return [4 /*yield*/, cmdConnect(msg)];
            case 2:
                _b.sent();
                return [3 /*break*/, 16];
            case 3: return [4 /*yield*/, cmdDisconnect(msg)];
            case 4:
                _b.sent();
                return [3 /*break*/, 16];
            case 5: return [4 /*yield*/, cmdGetDialogs(msg)];
            case 6:
                _b.sent();
                return [3 /*break*/, 16];
            case 7: return [4 /*yield*/, cmdResolveGroupTitle(msg)];
            case 8:
                _b.sent();
                return [3 /*break*/, 16];
            case 9:
                cmdIsConnected(msg);
                return [3 /*break*/, 16];
            case 10:
                cmdHealthCheck(msg);
                return [3 /*break*/, 16];
            case 11: return [4 /*yield*/, cmdSendDm(msg)];
            case 12:
                _b.sent();
                return [3 /*break*/, 16];
            case 13: return [4 /*yield*/, cmdResolveUser(msg)];
            case 14:
                _b.sent();
                return [3 /*break*/, 16];
            case 15:
                reply(msg.id, false, 'Unknown command: ' + msg.type);
                _b.label = 16;
            case 16: return [3 /*break*/, 18];
            case 17:
                error_1 = _b.sent();
                reply(msg.id, false, error_1.message || 'Worker command error');
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); });
function cmdConnect(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _c, me, dialogs, groups, _i, groups_1, dialog, did, lastMsg, chatId, testGroup, msgs, e_1, e_2;
        var _this = this;
        var id = _b.id, ss = _b.sessionString;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!client) return [3 /*break*/, 5];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.disconnect()];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    client = null;
                    _d.label = 5;
                case 5:
                    stopPolling();
                    sessionString = ss;
                    client = new telegram_1.TelegramClient(new sessions_1.StringSession(sessionString), apiId, apiHash, {
                        connectionRetries: 5,
                        requestRetries: 3,
                        useWSS: true,
                        floodSleepThreshold: 30, // 30s max flood wait (120 bloklardi)
                        autoReconnect: true,
                    });
                    // Suppress noisy gramJS errors
                    client._errorHandler = function (err) {
                        var m = (err === null || err === void 0 ? void 0 : err.message) || '';
                        if (m === 'TIMEOUT' || m === 'Not connected')
                            return;
                        log('error', "gramJS error: ".concat(m));
                    };
                    return [4 /*yield*/, client.connect()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, client.getMe()];
                case 7:
                    me = _d.sent();
                    if (!me)
                        throw new Error('Session validation failed');
                    msgCount = 0;
                    eventMsgCount = 0;
                    // Message handler (event-based — real-time when it works)
                    client.addEventHandler(function (event) { return __awaiter(_this, void 0, void 0, function () {
                        var message, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    message = event.message;
                                    if (!message)
                                        return [2 /*return*/];
                                    // Track this message as processed (so polling doesn't duplicate it)
                                    if (message.id && message.chatId) {
                                        processedMsgIds.add("".concat(message.chatId, "_").concat(message.id));
                                        cleanupProcessedIds();
                                    }
                                    eventMsgCount++;
                                    msgCount++;
                                    if (msgCount <= 3 || msgCount % 500 === 0) {
                                        log('info', "message #".concat(msgCount, " (event)"));
                                    }
                                    return [4 /*yield*/, processMessage(message)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    log('error', "Message handler error: ".concat(error_2.message));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, new events_1.NewMessage({}));
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 14, , 15]);
                    return [4 /*yield*/, client.getDialogs({ limit: 100 })];
                case 9:
                    dialogs = _d.sent();
                    groups = dialogs.filter(function (d) { return d.isGroup || d.isChannel; });
                    log('info', "sync: ".concat(groups.length, " guruh, ").concat(dialogs.length, " dialog"));
                    // Cache last message IDs for polling baseline
                    for (_i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                        dialog = groups_1[_i];
                        did = String(dialog.id);
                        lastMsg = dialog.message;
                        if (lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.id) {
                            lastMessageIds.set(did, lastMsg.id);
                            chatId = lastMsg.chatId ? String(lastMsg.chatId) : did;
                            processedMsgIds.add("".concat(chatId, "_").concat(lastMsg.id));
                        }
                    }
                    if (!(groups.length > 0)) return [3 /*break*/, 13];
                    _d.label = 10;
                case 10:
                    _d.trys.push([10, 12, , 13]);
                    testGroup = groups[0];
                    return [4 /*yield*/, client.getMessages(testGroup.id, { limit: 1 })];
                case 11:
                    msgs = _d.sent();
                    log('info', "test read from \"".concat(testGroup.title, "\": ").concat(msgs.length ? 'OK' : 'EMPTY'));
                    return [3 /*break*/, 13];
                case 12:
                    e_1 = _d.sent();
                    log('warn', "test read failed: ".concat(e_1.message));
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 15];
                case 14:
                    e_2 = _d.sent();
                    log('warn', "sync failed: ".concat(e_2.message));
                    return [3 /*break*/, 15];
                case 15:
                    // Start polling fallback
                    startPolling();
                    log('info', 'session connected (hybrid: events + polling)');
                    reply(id, true);
                    return [2 /*return*/];
            }
        });
    });
}
// ============================
// POLLING FALLBACK
// Har 20 sekundda getDialogs() → yangi xabarlarni olish
// ============================
function startPolling() {
    if (pollingActive)
        return;
    pollingActive = true;
    // Dastlabki poll 10s dan keyin (event handler ga vaqt berish)
    setTimeout(function () {
        if (!pollingActive)
            return;
        pollForMessages().catch(function (e) { return log('warn', "Initial poll error: ".concat(e.message)); });
    }, 10000);
    // Keyin har 20s (adaptive — event ishlamasa 5s ga tushadi)
    pollInterval = setInterval(function () {
        if (!pollingActive || !(client === null || client === void 0 ? void 0 : client.connected))
            return;
        pollForMessages().catch(function (e) { return log('warn', "Poll error: ".concat(e.message)); });
    }, 20000);
    // 60s dan keyin event handler ishlayotganini tekshir
    // Agar event 0 bo'lsa — polling ni 5s ga tezlashtir
    setTimeout(function () {
        if (!pollingActive)
            return;
        if (eventMsgCount === 0 && msgCount > 0) {
            log('warn', "Event handler ishlamayapti (0 events, ".concat(msgCount, " poll msgs). Polling 5s ga tezlashtirildi."));
            adaptivePollInterval = 5000;
            // Restart polling with faster interval
            if (pollInterval)
                clearInterval(pollInterval);
            pollInterval = setInterval(function () {
                if (!pollingActive || !(client === null || client === void 0 ? void 0 : client.connected))
                    return;
                pollForMessages().catch(function (e) { return log('warn', "Poll error: ".concat(e.message)); });
            }, adaptivePollInterval);
        }
        else {
            log('info', "Event handler ishlayapti (".concat(eventMsgCount, " events). Polling 20s da qoldi."));
        }
    }, 60000);
}
function stopPolling() {
    pollingActive = false;
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}
var pollCount = 0;
var pollNewMessages = 0;
var pollInProgress = false;
var adaptivePollInterval = 20000; // Starts at 20s, drops to 5s if events don't work
function pollForMessages() {
    return __awaiter(this, void 0, void 0, function () {
        var dialogs, groups, newFound, groupsToFetch, _i, groups_2, dialog, did, lastMsg, lastKnown, MAX_FETCH_PER_POLL, MSG_LIMIT_PER_GROUP, toFetch, _a, toFetch_1, group, messages, _b, messages_1, message, chatId, msgKey, e_3, e_4, e_5;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(client === null || client === void 0 ? void 0 : client.connected))
                        return [2 /*return*/];
                    if (pollInProgress) {
                        log('warn', 'poll skipped — previous still running');
                        return [2 /*return*/];
                    }
                    pollInProgress = true;
                    pollCount++;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 15, 16, 17]);
                    return [4 /*yield*/, client.getDialogs({ limit: 200 })];
                case 2:
                    dialogs = _e.sent();
                    groups = dialogs.filter(function (d) { return d.isGroup || d.isChannel; });
                    newFound = 0;
                    groupsToFetch = [];
                    for (_i = 0, groups_2 = groups; _i < groups_2.length; _i++) {
                        dialog = groups_2[_i];
                        did = String(dialog.id);
                        lastMsg = dialog.message;
                        if (!(lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.id))
                            continue;
                        lastKnown = lastMessageIds.get(did) || 0;
                        if (lastMsg.id > lastKnown) {
                            // Yangi xabar bor — fetch qilish kerak
                            groupsToFetch.push({ id: dialog.id, dialogId: did, lastKnown: lastKnown });
                            // Update baseline
                            lastMessageIds.set(did, lastMsg.id);
                        }
                    }
                    MAX_FETCH_PER_POLL = adaptivePollInterval <= 10000 ? 50 : 30;
                    MSG_LIMIT_PER_GROUP = adaptivePollInterval <= 10000 ? 5 : 3;
                    toFetch = groupsToFetch.slice(0, MAX_FETCH_PER_POLL);
                    _a = 0, toFetch_1 = toFetch;
                    _e.label = 3;
                case 3:
                    if (!(_a < toFetch_1.length)) return [3 /*break*/, 14];
                    group = toFetch_1[_a];
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 12, , 13]);
                    return [4 /*yield*/, client.getMessages(group.id, { limit: MSG_LIMIT_PER_GROUP })];
                case 5:
                    messages = _e.sent();
                    _b = 0, messages_1 = messages;
                    _e.label = 6;
                case 6:
                    if (!(_b < messages_1.length)) return [3 /*break*/, 11];
                    message = messages_1[_b];
                    if (!(message === null || message === void 0 ? void 0 : message.id))
                        return [3 /*break*/, 10];
                    chatId = message.chatId ? String(message.chatId) : group.dialogId;
                    msgKey = "".concat(chatId, "_").concat(message.id);
                    // Skip already processed (by event handler or previous poll)
                    if (processedMsgIds.has(msgKey))
                        return [3 /*break*/, 10];
                    processedMsgIds.add(msgKey);
                    cleanupProcessedIds();
                    newFound++;
                    pollNewMessages++;
                    msgCount++;
                    if (newFound <= 3 || newFound % 100 === 0) {
                        log('info', "message #".concat(msgCount, " (poll)"));
                    }
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, processMessage(message)];
                case 8:
                    _e.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_3 = _e.sent();
                    log('warn', "Poll message process error: ".concat(e_3.message));
                    return [3 /*break*/, 10];
                case 10:
                    _b++;
                    return [3 /*break*/, 6];
                case 11: return [3 /*break*/, 13];
                case 12:
                    e_4 = _e.sent();
                    // Skip this group if error (e.g., banned, left)
                    if (!((_c = e_4.message) === null || _c === void 0 ? void 0 : _c.includes('CHANNEL_PRIVATE')) && !((_d = e_4.message) === null || _d === void 0 ? void 0 : _d.includes('CHAT_WRITE_FORBIDDEN'))) {
                        log('warn', "Poll fetch error for group: ".concat(e_4.message));
                    }
                    return [3 /*break*/, 13];
                case 13:
                    _a++;
                    return [3 /*break*/, 3];
                case 14:
                    // Periodic status log — har 10 ta pollda, yoki birinchi 5 ta
                    if (pollCount <= 5 || pollCount % 10 === 0 || newFound > 0) {
                        log('info', "poll #".concat(pollCount, ": ").concat(groups.length, " groups, ").concat(groupsToFetch.length, " updated, ").concat(newFound, " new msgs (total poll: ").concat(pollNewMessages, ", event: ").concat(eventMsgCount, ")"));
                    }
                    return [3 /*break*/, 17];
                case 15:
                    e_5 = _e.sent();
                    log('warn', "Poll dialogs error: ".concat(e_5.message));
                    return [3 /*break*/, 17];
                case 16:
                    pollInProgress = false;
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
function cleanupProcessedIds() {
    if (processedMsgIds.size > MAX_PROCESSED_IDS) {
        // Remove oldest half
        var arr = Array.from(processedMsgIds);
        var toRemove = arr.slice(0, arr.length / 2);
        for (var _i = 0, toRemove_1 = toRemove; _i < toRemove_1.length; _i++) {
            var id = toRemove_1[_i];
            processedMsgIds.delete(id);
        }
    }
}
// ============================
// Message processing (shared between event handler and polling)
// ============================
function processMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var peerId, text, chatId, now, chatTitle, chatClassName, chatRealId, cached, chat, _a, senderFirstName, senderLastName, senderUsername, rawSenderId, senderAccessHash, cachedSender, sender, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(message === null || message === void 0 ? void 0 : message.text))
                        return [2 /*return*/];
                    peerId = message.peerId;
                    if (!peerId)
                        return [2 /*return*/];
                    if (peerId.className === 'PeerUser')
                        return [2 /*return*/];
                    text = message.text;
                    if (text.length < 15)
                        return [2 /*return*/];
                    chatId = message.chatId ? String(message.chatId) : null;
                    if (!chatId)
                        return [2 /*return*/];
                    now = Date.now();
                    chatTitle = '';
                    chatClassName = '';
                    chatRealId = chatId;
                    cached = chatCache.get(chatId);
                    if (!(cached && now - cached.cachedAt < CHAT_CACHE_TTL)) return [3 /*break*/, 1];
                    chatTitle = cached.title;
                    chatClassName = cached.className;
                    chatRealId = cached.id;
                    return [3 /*break*/, 4];
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, message.getChat()];
                case 2:
                    chat = _c.sent();
                    if (!chat)
                        return [2 /*return*/];
                    chatClassName = chat.className || '';
                    chatTitle = chat.title || '';
                    chatRealId = String(chat.id || chatId);
                    chatCache.set(chatId, { title: chatTitle, className: chatClassName, id: chatRealId, cachedAt: now });
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/];
                case 4:
                    if (chatClassName !== 'Chat' && chatClassName !== 'Channel')
                        return [2 /*return*/];
                    rawSenderId = message.senderId ? String(message.senderId) : null;
                    if (!rawSenderId) return [3 /*break*/, 8];
                    cachedSender = senderCache.get(rawSenderId);
                    if (!(cachedSender && now - cachedSender.cachedAt < SENDER_CACHE_TTL)) return [3 /*break*/, 5];
                    senderFirstName = cachedSender.firstName;
                    senderLastName = cachedSender.lastName;
                    senderUsername = cachedSender.username;
                    senderAccessHash = cachedSender.accessHash;
                    return [3 /*break*/, 8];
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, message.getSender()];
                case 6:
                    sender = _c.sent();
                    if (sender && 'firstName' in sender) {
                        senderFirstName = sender.firstName;
                        senderLastName = sender.lastName;
                        senderUsername = sender.username;
                        senderAccessHash = sender.accessHash ? String(sender.accessHash) : undefined;
                        senderCache.set(rawSenderId, {
                            firstName: senderFirstName,
                            lastName: senderLastName,
                            username: senderUsername,
                            accessHash: senderAccessHash,
                            cachedAt: now,
                        });
                    }
                    return [3 /*break*/, 8];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 8];
                case 8:
                    // Send to main process
                    send({
                        type: 'newMessage',
                        sessionId: sessionId,
                        data: {
                            text: text,
                            chatId: chatId,
                            chatTitle: chatTitle,
                            groupTelegramId: chatRealId,
                            messageId: String(message.id),
                            senderId: rawSenderId,
                            senderAccessHash: senderAccessHash,
                            senderFirstName: senderFirstName,
                            senderLastName: senderLastName,
                            senderUsername: senderUsername,
                            date: message.date,
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function cmdDisconnect(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _c;
        var id = _b.id;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    stopPolling();
                    if (!client) return [3 /*break*/, 5];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.disconnect()];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    client = null;
                    log('info', 'session disconnected');
                    _d.label = 5;
                case 5:
                    reply(id, true);
                    // Process ni tugatish
                    setTimeout(function () { return process.exit(0); }, 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function cmdGetDialogs(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var allGroups, offsetDate, iterations, MAX_ITERATIONS, dialogs, groups, lastDialog, lastDate, seen, uniqueGroups;
        var _c;
        var id = _b.id;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Session not connected');
                        return [2 /*return*/];
                    }
                    allGroups = [];
                    offsetDate = 0;
                    iterations = 0;
                    MAX_ITERATIONS = 5;
                    _d.label = 1;
                case 1:
                    if (!(iterations < MAX_ITERATIONS)) return [3 /*break*/, 3];
                    iterations++;
                    return [4 /*yield*/, client.getDialogs(__assign({ limit: 500 }, (offsetDate ? { offsetDate: offsetDate } : {})))];
                case 2:
                    dialogs = _d.sent();
                    if (!dialogs || dialogs.length === 0)
                        return [3 /*break*/, 3];
                    groups = dialogs
                        .filter(function (d) { return d.isGroup || d.isChannel; })
                        .map(function (d) { return ({ id: String(d.id), title: d.title || '' }); });
                    allGroups.push.apply(allGroups, groups);
                    if (dialogs.length < 500)
                        return [3 /*break*/, 3];
                    lastDialog = dialogs[dialogs.length - 1];
                    lastDate = (lastDialog === null || lastDialog === void 0 ? void 0 : lastDialog.date) || ((_c = lastDialog === null || lastDialog === void 0 ? void 0 : lastDialog.message) === null || _c === void 0 ? void 0 : _c.date);
                    if (!lastDate || lastDate === offsetDate)
                        return [3 /*break*/, 3];
                    offsetDate = lastDate;
                    return [3 /*break*/, 1];
                case 3:
                    seen = new Set();
                    uniqueGroups = allGroups.filter(function (g) {
                        if (seen.has(g.id))
                            return false;
                        seen.add(g.id);
                        return true;
                    });
                    reply(id, true, { groups: uniqueGroups, total: uniqueGroups.length });
                    return [2 /*return*/];
            }
        });
    });
}
function cmdResolveGroupTitle(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var normalize, target, dialogs, _i, dialogs_1, dialog, _c;
        var id = _b.id, groupTelegramId = _b.groupTelegramId;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, true, '');
                        return [2 /*return*/];
                    }
                    normalize = function (s) {
                        var v = s.trim();
                        if (v.startsWith('-100') && v.length > 4)
                            return v.substring(4);
                        if (v.startsWith('-') && v.length > 1)
                            return v.substring(1);
                        return v;
                    };
                    target = normalize(groupTelegramId);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.getDialogs({ limit: 500 })];
                case 2:
                    dialogs = _d.sent();
                    for (_i = 0, dialogs_1 = dialogs; _i < dialogs_1.length; _i++) {
                        dialog = dialogs_1[_i];
                        if (normalize(String(dialog.id)) === target) {
                            reply(id, true, dialog.title || '');
                            return [2 /*return*/];
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    reply(id, true, '');
                    return [2 /*return*/];
            }
        });
    });
}
function cmdIsConnected(_a) {
    var id = _a.id;
    reply(id, true, !!(client === null || client === void 0 ? void 0 : client.connected));
}
function cmdHealthCheck(_a) {
    var id = _a.id;
    reply(id, true, {
        connected: !!(client === null || client === void 0 ? void 0 : client.connected),
        msgCount: msgCount,
        eventMsgCount: eventMsgCount,
        pollMsgCount: pollNewMessages,
        pollCount: pollCount,
        sessionId: sessionId,
    });
}
// ============================
// Send DM via monitor session (has entity cache for group members)
// ============================
function cmdSendDm(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var peer, _c, numId, _d, cleanPhone, importResult, _e, e_6, result, error_3, errMsg;
        var id = _b.id, targetId = _b.targetId, targetUsername = _b.targetUsername, targetPhone = _b.targetPhone, message = _b.message;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Monitor session not connected');
                        return [2 /*return*/];
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 19, , 20]);
                    peer = void 0;
                    if (!targetUsername) return [3 /*break*/, 5];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.getEntity(targetUsername)];
                case 3:
                    peer = _f.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = _f.sent();
                    peer = targetUsername;
                    return [3 /*break*/, 5];
                case 5:
                    if (!!peer) return [3 /*break*/, 9];
                    numId = Number(targetId);
                    if (!(!isNaN(numId) && numId > 0)) return [3 /*break*/, 9];
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, client.getEntity(BigInt(numId))];
                case 7:
                    peer = _f.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _d = _f.sent();
                    return [3 /*break*/, 9];
                case 9:
                    if (!(!peer && targetPhone)) return [3 /*break*/, 17];
                    cleanPhone = targetPhone.replace(/[^+\d]/g, '');
                    _f.label = 10;
                case 10:
                    _f.trys.push([10, 16, , 17]);
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.contacts.ImportContacts({
                            contacts: [
                                new telegram_1.Api.InputPhoneContact({
                                    clientId: BigInt(Math.floor(Math.random() * 1e15)),
                                    phone: cleanPhone,
                                    firstName: 'User',
                                    lastName: '',
                                }),
                            ],
                        }))];
                case 11:
                    importResult = _f.sent();
                    if (!(importResult.users && importResult.users.length > 0)) return [3 /*break*/, 15];
                    peer = importResult.users[0];
                    log('info', "Monitor kontakt: ".concat(cleanPhone, " -> ").concat(peer.id));
                    _f.label = 12;
                case 12:
                    _f.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.contacts.DeleteContacts({ id: [peer] }))];
                case 13:
                    _f.sent();
                    return [3 /*break*/, 15];
                case 14:
                    _e = _f.sent();
                    return [3 /*break*/, 15];
                case 15: return [3 /*break*/, 17];
                case 16:
                    e_6 = _f.sent();
                    log('warn', "Monitor import xato: ".concat(cleanPhone, " \u2014 ").concat(e_6.message));
                    return [3 /*break*/, 17];
                case 17:
                    if (!peer) {
                        throw new Error("Could not find the input entity for user ".concat(targetId));
                    }
                    return [4 /*yield*/, client.sendMessage(peer, { message: message })];
                case 18:
                    result = _f.sent();
                    reply(id, true, { messageId: result === null || result === void 0 ? void 0 : result.id });
                    return [3 /*break*/, 20];
                case 19:
                    error_3 = _f.sent();
                    errMsg = error_3.errorMessage || error_3.message || '';
                    reply(id, false, errMsg);
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
// ============================
// Periodic keepalive — force reconnect if disconnected
// ============================
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!client)
                    return [2 /*return*/];
                if (!!client.connected) return [3 /*break*/, 6];
                log('warn', 'Keepalive: disconnected, reconnecting...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, client.connect()];
            case 2:
                _a.sent();
                return [4 /*yield*/, client.getDialogs({ limit: 1 })];
            case 3:
                _a.sent();
                log('info', 'Keepalive: reconnected');
                return [3 /*break*/, 5];
            case 4:
                e_7 = _a.sent();
                log('error', "Keepalive reconnect failed: ".concat(e_7.message));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
            case 6: return [2 /*return*/];
        }
    });
}); }, 2 * 60000);
// Periodic cache cleanup
setInterval(function () {
    var now = Date.now();
    for (var _i = 0, chatCache_1 = chatCache; _i < chatCache_1.length; _i++) {
        var _a = chatCache_1[_i], key = _a[0], val = _a[1];
        if (now - val.cachedAt > CHAT_CACHE_TTL)
            chatCache.delete(key);
    }
    for (var _b = 0, senderCache_1 = senderCache; _b < senderCache_1.length; _b++) {
        var _c = senderCache_1[_b], key = _c[0], val = _c[1];
        if (now - val.cachedAt > SENDER_CACHE_TTL)
            senderCache.delete(key);
    }
}, 5 * 60000);
// Periodic heartbeat — main process ga holat xabar berish
function cmdResolveUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var bigId, entity, ah, e_8;
        var id = _b.id, telegramId = _b.telegramId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Not connected');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    bigId = BigInt(telegramId);
                    log('info', "resolveUser: trying ".concat(telegramId));
                    return [4 /*yield*/, client.getEntity(bigId)];
                case 2:
                    entity = _c.sent();
                    if (entity && entity.accessHash) {
                        ah = String(entity.accessHash);
                        log('info', "resolveUser OK: ".concat(telegramId, " -> hash=").concat(ah.slice(0, 8), "..."));
                        reply(id, true, {
                            id: String(entity.id),
                            accessHash: ah,
                        });
                    }
                    else {
                        log('warn', "resolveUser: ".concat(telegramId, " \u2014 entity topildi lekin accessHash yo'q"));
                        reply(id, false, 'No accessHash');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_8 = _c.sent();
                    log('warn', "resolveUser: ".concat(telegramId, " \u2014 ").concat(e_8.message || 'Not in cache'));
                    reply(id, false, e_8.message || 'Not in cache');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
setInterval(function () {
    send({
        type: 'heartbeat',
        sessionId: sessionId,
        msgCount: msgCount,
        connected: !!(client === null || client === void 0 ? void 0 : client.connected),
    });
}, 30000);
log('info', 'worker process started');
