"use strict";
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
 * Telegram SMS Worker (child_process.fork)
 * gramJS TelegramClient instances for sending DMs
 * Runs in a separate process to avoid blocking the main event loop.
 *
 * Protocol (IPC):
 *   Main -> Child: { type, id, ...params }
 *   Child -> Main: { type: 'response', id, success, data/error }
 *                  { type: 'log', level, message }
 */
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var fs = require("fs");
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
        msg.includes('reconnect') || msg.includes('Handling reconnect'))
        return;
    log('info', msg);
};
console.warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var msg = args.map(String).join(' ');
    if (msg.includes('flood') || msg.includes('reconnect'))
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
var apiId = parseInt(process.argv[2] || '0');
var apiHash = process.argv[3] || '';
var clients = new Map();
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
    send({ type: 'log', level: level, message: message });
}
process.on('message', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 21, , 22]);
                _a = msg.type;
                switch (_a) {
                    case 'connect': return [3 /*break*/, 1];
                    case 'disconnect': return [3 /*break*/, 3];
                    case 'disconnectAll': return [3 /*break*/, 5];
                    case 'sendDm': return [3 /*break*/, 7];
                    case 'sendDmViaGroupMsg': return [3 /*break*/, 9];
                    case 'checkSpamBot': return [3 /*break*/, 11];
                    case 'getMe': return [3 /*break*/, 13];
                    case 'isConnected': return [3 /*break*/, 15];
                    case 'getConnectedList': return [3 /*break*/, 16];
                    case 'setupProfile': return [3 /*break*/, 17];
                }
                return [3 /*break*/, 19];
            case 1: return [4 /*yield*/, cmdConnect(msg)];
            case 2:
                _b.sent();
                return [3 /*break*/, 20];
            case 3: return [4 /*yield*/, cmdDisconnect(msg)];
            case 4:
                _b.sent();
                return [3 /*break*/, 20];
            case 5: return [4 /*yield*/, cmdDisconnectAll(msg)];
            case 6:
                _b.sent();
                return [3 /*break*/, 20];
            case 7: return [4 /*yield*/, cmdSendDm(msg)];
            case 8:
                _b.sent();
                return [3 /*break*/, 20];
            case 9: return [4 /*yield*/, cmdSendDmViaGroupMsg(msg)];
            case 10:
                _b.sent();
                return [3 /*break*/, 20];
            case 11: return [4 /*yield*/, cmdCheckSpamBot(msg)];
            case 12:
                _b.sent();
                return [3 /*break*/, 20];
            case 13: return [4 /*yield*/, cmdGetMe(msg)];
            case 14:
                _b.sent();
                return [3 /*break*/, 20];
            case 15:
                cmdIsConnected(msg);
                return [3 /*break*/, 20];
            case 16:
                cmdGetConnectedList(msg);
                return [3 /*break*/, 20];
            case 17: return [4 /*yield*/, cmdSetupProfile(msg)];
            case 18:
                _b.sent();
                return [3 /*break*/, 20];
            case 19:
                reply(msg.id, false, 'Unknown command: ' + msg.type);
                _b.label = 20;
            case 20: return [3 /*break*/, 22];
            case 21:
                error_1 = _b.sent();
                reply(msg.id, false, error_1.message || 'Worker command error');
                return [3 /*break*/, 22];
            case 22: return [2 /*return*/];
        }
    });
}); });
function cmdConnect(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var existing, _c, client, me;
        var id = _b.id, sessionId = _b.sessionId, sessionString = _b.sessionString;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!clients.has(sessionId)) return [3 /*break*/, 5];
                    existing = clients.get(sessionId);
                    if (existing.connected) {
                        reply(id, true);
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, existing.disconnect()];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _c = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    clients.delete(sessionId);
                    _d.label = 5;
                case 5:
                    client = new telegram_1.TelegramClient(new sessions_1.StringSession(sessionString), apiId, apiHash, {
                        connectionRetries: 5,
                        requestRetries: 3,
                        useWSS: true,
                        floodSleepThreshold: 10,
                        autoReconnect: true,
                    });
                    client._errorHandler = function (err) {
                        var m = (err === null || err === void 0 ? void 0 : err.message) || '';
                        if (m === 'TIMEOUT' || m === 'Not connected')
                            return;
                        log('error', "gramJS error (".concat(sessionId, "): ").concat(m));
                    };
                    return [4 /*yield*/, client.connect()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, client.getMe()];
                case 7:
                    me = _d.sent();
                    clients.set(sessionId, client);
                    log('info', "SMS session connected: ".concat(sessionId, " (").concat((me === null || me === void 0 ? void 0 : me.phone) || 'unknown', ")"));
                    reply(id, true, { phone: me === null || me === void 0 ? void 0 : me.phone, firstName: me === null || me === void 0 ? void 0 : me.firstName });
                    return [2 /*return*/];
            }
        });
    });
}
function cmdDisconnect(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, _c;
        var id = _b.id, sessionId = _b.sessionId;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    client = clients.get(sessionId);
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
                    clients.delete(sessionId);
                    log('info', "SMS session disconnected: ".concat(sessionId));
                    _d.label = 5;
                case 5:
                    reply(id, true);
                    return [2 /*return*/];
            }
        });
    });
}
function cmdDisconnectAll(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _i, clients_1, _c, sid, client, _d;
        var id = _b.id;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _i = 0, clients_1 = clients;
                    _e.label = 1;
                case 1:
                    if (!(_i < clients_1.length)) return [3 /*break*/, 7];
                    _c = clients_1[_i], sid = _c[0], client = _c[1];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.disconnect()];
                case 3:
                    _e.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _d = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    log('info', "SMS session disconnected: ".concat(sid));
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    clients.clear();
                    reply(id, true);
                    return [2 /*return*/];
            }
        });
    });
}
function cmdSendDm(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, peer, numId, _c, _d, cleanPhone, importResult, _e, e_1, result, error_2, errMsg, match, waitSeconds;
        var _f, _g;
        var id = _b.id, sessionId = _b.sessionId, targetId = _b.targetId, targetUsername = _b.targetUsername, targetPhone = _b.targetPhone, targetAccessHash = _b.targetAccessHash, message = _b.message;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!client)
                        throw new Error("Session ".concat(sessionId, " ulangan emas"));
                    if (!client.connected)
                        throw new Error("Session ".concat(sessionId, " aloqa uzilgan"));
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 19, , 20]);
                    peer = void 0;
                    numId = Number(targetId);
                    if (!targetUsername) return [3 /*break*/, 5];
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.getEntity(targetUsername)];
                case 3:
                    peer = _h.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _c = _h.sent();
                    peer = targetUsername;
                    return [3 /*break*/, 5];
                case 5:
                    if (!(!peer && !isNaN(numId) && numId > 0)) return [3 /*break*/, 9];
                    _h.label = 6;
                case 6:
                    _h.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, client.getEntity(BigInt(numId))];
                case 7:
                    peer = _h.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _d = _h.sent();
                    return [3 /*break*/, 9];
                case 9:
                    // 2.5. Monitor session orqali olingan accessHash bilan InputPeerUser
                    if (!peer && targetAccessHash && !isNaN(numId) && numId > 0) {
                        try {
                            peer = new telegram_1.Api.InputPeerUser({
                                userId: BigInt(numId),
                                accessHash: BigInt(targetAccessHash),
                            });
                            log('info', "AccessHash ishlatildi: ".concat(targetId, " -> ").concat(targetAccessHash.slice(0, 8), "..."));
                        }
                        catch (e) {
                            log('warn', "AccessHash xato: ".concat(e.message));
                        }
                    }
                    if (!(!peer && targetPhone)) return [3 /*break*/, 17];
                    cleanPhone = targetPhone.replace(/[^+\d]/g, '');
                    log('info', "Import urinish: ".concat(cleanPhone, " (target: ").concat(targetId, ")"));
                    _h.label = 10;
                case 10:
                    _h.trys.push([10, 16, , 17]);
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
                    importResult = _h.sent();
                    log('info', "Import natija: users=".concat(((_f = importResult.users) === null || _f === void 0 ? void 0 : _f.length) || 0, ", retryContacts=").concat(((_g = importResult.retryContacts) === null || _g === void 0 ? void 0 : _g.length) || 0));
                    if (!(importResult.users && importResult.users.length > 0)) return [3 /*break*/, 15];
                    peer = importResult.users[0];
                    log('info', "Kontakt: ".concat(cleanPhone, " -> ").concat(peer.id));
                    _h.label = 12;
                case 12:
                    _h.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.contacts.DeleteContacts({
                            id: [peer],
                        }))];
                case 13:
                    _h.sent();
                    return [3 /*break*/, 15];
                case 14:
                    _e = _h.sent();
                    return [3 /*break*/, 15];
                case 15: return [3 /*break*/, 17];
                case 16:
                    e_1 = _h.sent();
                    log('warn', "Import xato: ".concat(cleanPhone, " \u2014 ").concat(e_1.message));
                    return [3 /*break*/, 17];
                case 17:
                    if (!peer) {
                        throw new Error("PEER_INVALID:".concat(targetId));
                    }
                    return [4 /*yield*/, client.sendMessage(peer, { message: message })];
                case 18:
                    result = _h.sent();
                    reply(id, true, { messageId: result === null || result === void 0 ? void 0 : result.id });
                    return [3 /*break*/, 20];
                case 19:
                    error_2 = _h.sent();
                    errMsg = error_2.errorMessage || error_2.message || '';
                    // FLOOD_WAIT
                    if (errMsg.includes('FLOOD_WAIT')) {
                        match = errMsg.match(/(\d+)/);
                        waitSeconds = match ? parseInt(match[1]) : 60;
                        reply(id, false, "FLOOD_WAIT:".concat(waitSeconds));
                        return [2 /*return*/];
                    }
                    // SPAM detection
                    if (errMsg.includes('PEER_FLOOD') ||
                        errMsg.includes('USER_PRIVACY') ||
                        errMsg.includes('YOU_ARE_BLOCKED')) {
                        reply(id, false, "SPAM:".concat(errMsg));
                        return [2 /*return*/];
                    }
                    // User not found / invalid
                    if (errMsg.includes('PEER_ID_INVALID') ||
                        errMsg.includes('INPUT_USER_DEACTIVATED') ||
                        errMsg.includes('USERNAME_NOT_OCCUPIED') ||
                        errMsg.includes('Could not find the input entity')) {
                        reply(id, false, "PEER_INVALID:".concat(targetId));
                        return [2 /*return*/];
                    }
                    // Auth issues
                    if (errMsg.includes('AUTH_KEY_UNREGISTERED') ||
                        errMsg.includes('SESSION_REVOKED') ||
                        errMsg.includes('USER_DEACTIVATED')) {
                        reply(id, false, "SESSION_DEAD:".concat(errMsg));
                        return [2 /*return*/];
                    }
                    throw error_2;
                case 20: return [2 /*return*/];
            }
        });
    });
}
/**
 * Guruh xabaridan sender'ni topib DM yuborish.
 * TG SMS session guruhda a'zo bo'lsa — xabarni fetch qilib sender entity'ni oladi.
 */
function cmdSendDmViaGroupMsg(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, groupEntity, rawId, tryIds, _i, tryIds_1, tryId, _c, msgId, messages, msg, senderId, peer, result, error_3, errMsg, match;
        var id = _b.id, sessionId = _b.sessionId, targetId = _b.targetId, sourceGroupId = _b.sourceGroupId, sourceMessageId = _b.sourceMessageId, message = _b.message;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!client)
                        throw new Error("Session ".concat(sessionId, " ulangan emas"));
                    if (!client.connected)
                        throw new Error("Session ".concat(sessionId, " aloqa uzilgan"));
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 11, , 12]);
                    groupEntity = void 0;
                    rawId = String(sourceGroupId).replace(/^-100/, '');
                    tryIds = [
                        "-100".concat(rawId), // supergroup: -100XXXXXXXXX
                        rawId, // raw ID
                        sourceGroupId, // original
                    ];
                    _i = 0, tryIds_1 = tryIds;
                    _d.label = 2;
                case 2:
                    if (!(_i < tryIds_1.length)) return [3 /*break*/, 7];
                    tryId = tryIds_1[_i];
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.getEntity(BigInt(tryId))];
                case 4:
                    groupEntity = _d.sent();
                    if (groupEntity)
                        return [3 /*break*/, 7];
                    return [3 /*break*/, 6];
                case 5:
                    _c = _d.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    // Agar entity topilmasa — InputPeerChannel bilan urinish
                    if (!groupEntity) {
                        try {
                            groupEntity = new telegram_1.Api.InputPeerChannel({
                                channelId: BigInt(rawId),
                                accessHash: BigInt(0),
                            });
                            // Test: xabar olishga urinish — accessHash 0 bilan ishlamasa xato beradi
                        }
                        catch (_e) { }
                    }
                    if (!groupEntity) {
                        throw new Error("Guruh topilmadi: ".concat(sourceGroupId));
                    }
                    msgId = Number(sourceMessageId);
                    log('info', "Guruh xabar fetch: group=".concat(sourceGroupId, " (").concat(rawId, "), msg=").concat(msgId));
                    return [4 /*yield*/, client.getMessages(groupEntity, { ids: [msgId] })];
                case 8:
                    messages = _d.sent();
                    if (!messages || messages.length === 0 || !messages[0]) {
                        throw new Error("Xabar topilmadi: group=".concat(sourceGroupId, ", msg=").concat(sourceMessageId));
                    }
                    msg = messages[0];
                    senderId = msg.senderId;
                    if (!senderId) {
                        throw new Error("Sender topilmadi: group=".concat(sourceGroupId, ", msg=").concat(sourceMessageId));
                    }
                    log('info', "Guruh xabardan sender topildi: ".concat(senderId, " (target: ").concat(targetId, ")"));
                    return [4 /*yield*/, client.getEntity(senderId)];
                case 9:
                    peer = _d.sent();
                    return [4 /*yield*/, client.sendMessage(peer, { message: message })];
                case 10:
                    result = _d.sent();
                    reply(id, true, { messageId: result === null || result === void 0 ? void 0 : result.id });
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _d.sent();
                    errMsg = error_3.errorMessage || error_3.message || '';
                    if (errMsg.includes('FLOOD_WAIT')) {
                        match = errMsg.match(/(\d+)/);
                        reply(id, false, "FLOOD_WAIT:".concat(match ? parseInt(match[1]) : 60));
                        return [2 /*return*/];
                    }
                    if (errMsg.includes('PEER_FLOOD') || errMsg.includes('USER_PRIVACY')) {
                        reply(id, false, "SPAM:".concat(errMsg));
                        return [2 /*return*/];
                    }
                    if (errMsg.includes('CHANNEL_PRIVATE') || errMsg.includes('CHAT_ADMIN_REQUIRED')) {
                        reply(id, false, "GROUP_ACCESS_DENIED:".concat(sourceGroupId));
                        return [2 /*return*/];
                    }
                    throw error_3;
                case 12: return [2 /*return*/];
            }
        });
    });
}
function cmdCheckSpamBot(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, result, messages, lastMsg, text, spamStatus, expectedEnd, dateMatch, error_4;
        var id = _b.id, sessionId = _b.sessionId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Session not connected');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, client.sendMessage('SpamBot', { message: '/start' })];
                case 2:
                    result = _c.sent();
                    // Wait for response (poll for 5 seconds)
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 3000); })];
                case 3:
                    // Wait for response (poll for 5 seconds)
                    _c.sent();
                    return [4 /*yield*/, client.getMessages('SpamBot', { limit: 3 })];
                case 4:
                    messages = _c.sent();
                    lastMsg = messages === null || messages === void 0 ? void 0 : messages[0];
                    text = (lastMsg === null || lastMsg === void 0 ? void 0 : lastMsg.message) || '';
                    spamStatus = 'CLEAN';
                    expectedEnd = null;
                    // "свободен" = toza, cheklov yo'q
                    if (text.includes('свободен') || text.includes('no limits') || text.includes('free')) {
                        spamStatus = 'CLEAN';
                    }
                    else if (text.includes('ограничен') || text.includes('limited') || text.includes('spam')) {
                        spamStatus = 'SPAM';
                        dateMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
                        if (dateMatch)
                            expectedEnd = dateMatch[1];
                        if (text.includes('навсегда') || text.includes('permanently')) {
                            spamStatus = 'BANNED';
                        }
                    }
                    reply(id, true, { spamStatus: spamStatus, text: text, expectedEnd: expectedEnd });
                    return [3 /*break*/, 6];
                case 5:
                    error_4 = _c.sent();
                    reply(id, false, "SpamBot check error: ".concat(error_4.message));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function cmdGetMe(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, me;
        var id = _b.id, sessionId = _b.sessionId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Session not connected');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, client.getMe()];
                case 1:
                    me = _c.sent();
                    reply(id, true, {
                        id: String(me.id),
                        phone: me.phone,
                        firstName: me.firstName,
                        lastName: me.lastName,
                        username: me.username,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function cmdIsConnected(_a) {
    var id = _a.id, sessionId = _a.sessionId;
    var client = clients.get(sessionId);
    reply(id, true, { connected: !!(client === null || client === void 0 ? void 0 : client.connected) });
}
function cmdGetConnectedList(_a) {
    var id = _a.id;
    var list = Array.from(clients.keys());
    reply(id, true, { sessions: list, count: list.length });
}
function cmdSetupProfile(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, fileBuffer, fileSize, CustomFile, customFile, inputFile, photoErr_1, error_5;
        var id = _b.id, sessionId = _b.sessionId, firstName = _b.firstName, lastName = _b.lastName, photoPath = _b.photoPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Session not connected');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    // 1. Set name
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.account.UpdateProfile({
                            firstName: firstName || "YO'LDA menejer",
                            lastName: lastName || '',
                        }))];
                case 2:
                    // 1. Set name
                    _c.sent();
                    log('info', "Profile name updated: ".concat(sessionId, " -> ").concat(firstName));
                    if (!(photoPath && fs.existsSync(photoPath))) return [3 /*break*/, 7];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    fileBuffer = fs.readFileSync(photoPath);
                    fileSize = fs.statSync(photoPath).size;
                    CustomFile = require('telegram/client/uploads').CustomFile;
                    customFile = new CustomFile('profile.png', fileSize, '', fileBuffer);
                    return [4 /*yield*/, client.uploadFile({
                            file: customFile,
                            workers: 1,
                        })];
                case 4:
                    inputFile = _c.sent();
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.photos.UploadProfilePhoto({
                            file: inputFile,
                        }))];
                case 5:
                    _c.sent();
                    log('info', "Profile photo updated: ".concat(sessionId));
                    return [3 /*break*/, 7];
                case 6:
                    photoErr_1 = _c.sent();
                    log('warn', "Profile photo update failed: ".concat(photoErr_1.message));
                    return [3 /*break*/, 7];
                case 7:
                    reply(id, true);
                    return [3 /*break*/, 9];
                case 8:
                    error_5 = _c.sent();
                    log('warn', "Profile setup error: ".concat(error_5.message));
                    reply(id, false, error_5.message);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Heartbeat
send({ type: 'ready' });
