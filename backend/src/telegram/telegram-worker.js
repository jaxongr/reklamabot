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
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
// Suppress gramJS console spam (flood waits, reconnects, etc.)
// Redirect to our IPC-based log function
var origConsoleLog = console.log;
var origConsoleWarn = console.warn;
var origConsoleError = console.error;
console.log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var msg = args.map(String).join(' ');
    // Skip noisy gramJS messages
    if (msg.includes('flood wait') || msg.includes('Sleeping for') ||
        msg.includes('TCPFull') || msg.includes('Connecting to') ||
        msg.includes('LAYER') || msg.includes('Running gramJS') ||
        msg.includes('reconnect') || msg.includes('Handling reconnect')) {
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
// Config from command line args
var apiId = parseInt(process.argv[2] || '0');
var apiHash = process.argv[3] || '';
var clients = new Map();
var entityCacheTimes = new Map();
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
                    case 'sendMessage': return [3 /*break*/, 7];
                    case 'deleteMessage': return [3 /*break*/, 9];
                    case 'getDialogs': return [3 /*break*/, 11];
                    case 'getMe': return [3 /*break*/, 13];
                    case 'isConnected': return [3 /*break*/, 15];
                    case 'getConnectedCount': return [3 /*break*/, 16];
                    case 'resolveUser': return [3 /*break*/, 17];
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
            case 7: return [4 /*yield*/, cmdSendMessage(msg)];
            case 8:
                _b.sent();
                return [3 /*break*/, 20];
            case 9: return [4 /*yield*/, cmdDeleteMessage(msg)];
            case 10:
                _b.sent();
                return [3 /*break*/, 20];
            case 11: return [4 /*yield*/, cmdGetDialogs(msg)];
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
                cmdGetConnectedCount(msg);
                return [3 /*break*/, 20];
            case 17: return [4 /*yield*/, cmdResolveUser(msg)];
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
        var existing, _c, client, lastCacheKey, lastCacheTime, CACHE_TTL_MS, err_1;
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
                    _d.sent();
                    lastCacheKey = "entity_cache_".concat(sessionId);
                    lastCacheTime = entityCacheTimes.get(lastCacheKey);
                    CACHE_TTL_MS = 60 * 60 * 1000;
                    if (!(!lastCacheTime || (Date.now() - lastCacheTime) > CACHE_TTL_MS)) return [3 /*break*/, 11];
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, client.getDialogs({ limit: 300 })];
                case 9:
                    _d.sent();
                    entityCacheTimes.set(lastCacheKey, Date.now());
                    log('info', "Entity cache filled: ".concat(sessionId));
                    return [3 /*break*/, 11];
                case 10:
                    err_1 = _d.sent();
                    log('warn', "Dialog load error (".concat(sessionId, "): ").concat(err_1.message));
                    return [3 /*break*/, 11];
                case 11:
                    clients.set(sessionId, client);
                    log('info', "Session connected: ".concat(sessionId));
                    reply(id, true);
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
                    log('info', "Session disconnected: ".concat(sessionId));
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
                    log('info', "Session disconnected: ".concat(sid));
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
function cmdSendMessage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, numPeer, result, error_2, match, waitSeconds, waitSeconds, reason;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        var id = _b.id, sessionId = _b.sessionId, peer = _b.peer, message = _b.message;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!client)
                        throw new Error("Session ".concat(sessionId, " ulangan emas"));
                    if (!client.connected)
                        throw new Error("Session ".concat(sessionId, " aloqa uzilgan"));
                    _r.label = 1;
                case 1:
                    _r.trys.push([1, 3, , 4]);
                    numPeer = Number(peer);
                    if (isNaN(numPeer))
                        throw new Error("Noto'g'ri guruh ID: ".concat(peer));
                    return [4 /*yield*/, client.sendMessage(numPeer, { message: message })];
                case 2:
                    result = _r.sent();
                    reply(id, true, { messageId: result === null || result === void 0 ? void 0 : result.id });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _r.sent();
                    // Propagate specific error types for the main process to handle
                    if (((_c = error_2.errorMessage) === null || _c === void 0 ? void 0 : _c.includes('FLOOD_WAIT')) || ((_d = error_2.message) === null || _d === void 0 ? void 0 : _d.includes('FLOOD_WAIT'))) {
                        match = (error_2.errorMessage || error_2.message).match(/(\d+)/);
                        waitSeconds = match ? parseInt(match[1]) : 60;
                        reply(id, false, "FLOOD_WAIT:".concat(waitSeconds));
                        return [2 /*return*/];
                    }
                    if (((_e = error_2.errorMessage) === null || _e === void 0 ? void 0 : _e.includes('SLOWMODE_WAIT')) || error_2.seconds) {
                        waitSeconds = error_2.seconds || 300;
                        reply(id, false, "SLOWMODE_WAIT:".concat(waitSeconds));
                        return [2 /*return*/];
                    }
                    if (((_f = error_2.errorMessage) === null || _f === void 0 ? void 0 : _f.includes('CHAT_WRITE_FORBIDDEN')) ||
                        ((_g = error_2.errorMessage) === null || _g === void 0 ? void 0 : _g.includes('USER_BANNED')) ||
                        ((_h = error_2.errorMessage) === null || _h === void 0 ? void 0 : _h.includes('CHANNEL_PRIVATE')) ||
                        ((_j = error_2.errorMessage) === null || _j === void 0 ? void 0 : _j.includes('CHAT_ADMIN_REQUIRED')) ||
                        ((_k = error_2.errorMessage) === null || _k === void 0 ? void 0 : _k.includes('ADD_USER')) ||
                        ((_l = error_2.errorMessage) === null || _l === void 0 ? void 0 : _l.includes('INVITE_HASH')) ||
                        ((_m = error_2.message) === null || _m === void 0 ? void 0 : _m.includes('need to add'))) {
                        reason = error_2.errorMessage || 'UNKNOWN';
                        reply(id, false, "WRITE_FORBIDDEN:".concat(reason, ":").concat(peer));
                        return [2 /*return*/];
                    }
                    if (((_o = error_2.errorMessage) === null || _o === void 0 ? void 0 : _o.includes('PEER_ID_INVALID')) ||
                        ((_p = error_2.errorMessage) === null || _p === void 0 ? void 0 : _p.includes('INPUT_USER_DEACTIVATED')) ||
                        ((_q = error_2.message) === null || _q === void 0 ? void 0 : _q.includes('Could not find the input entity'))) {
                        reply(id, false, "PEER_INVALID:".concat(peer));
                        return [2 /*return*/];
                    }
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function cmdDeleteMessage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, _c, inputPeer, innerErr_1;
        var id = _b.id, sessionId = _b.sessionId, chatId = _b.chatId, messageId = _b.messageId;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, true, false);
                        return [2 /*return*/];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 9]);
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.messages.DeleteMessages({
                            id: [messageId],
                            revoke: true,
                        }))];
                case 2:
                    _d.sent();
                    reply(id, true, true);
                    return [3 /*break*/, 9];
                case 3:
                    _c = _d.sent();
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 7, , 8]);
                    return [4 /*yield*/, client.getInputEntity(Number(chatId))];
                case 5:
                    inputPeer = _d.sent();
                    return [4 /*yield*/, client.invoke(new telegram_1.Api.channels.DeleteMessages({
                            channel: inputPeer,
                            id: [messageId],
                        }))];
                case 6:
                    _d.sent();
                    reply(id, true, true);
                    return [3 /*break*/, 8];
                case 7:
                    innerErr_1 = _d.sent();
                    log('warn', "Delete error (session: ".concat(sessionId, ", chat: ").concat(chatId, ", msg: ").concat(messageId, "): ").concat(innerErr_1.message));
                    reply(id, true, false);
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function cmdGetDialogs(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, allGroups, batchSize, offsetDate, iterations, MAX_ITERATIONS, dialogs, groups, lastDialog, lastDate, seen, uniqueGroups;
        var _c;
        var id = _b.id, sessionId = _b.sessionId, limit = _b.limit;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    client = clients.get(sessionId);
                    if (!(client === null || client === void 0 ? void 0 : client.connected)) {
                        reply(id, false, 'Session not connected');
                        return [2 /*return*/];
                    }
                    allGroups = [];
                    batchSize = limit || 500;
                    offsetDate = 0;
                    iterations = 0;
                    MAX_ITERATIONS = 5;
                    _d.label = 1;
                case 1:
                    if (!(iterations < MAX_ITERATIONS)) return [3 /*break*/, 3];
                    iterations++;
                    return [4 /*yield*/, client.getDialogs(__assign({ limit: batchSize }, (offsetDate ? { offsetDate: offsetDate } : {})))];
                case 2:
                    dialogs = _d.sent();
                    if (!dialogs || dialogs.length === 0)
                        return [3 /*break*/, 3];
                    groups = dialogs
                        .filter(function (d) { return d.isGroup || d.isChannel; })
                        .map(function (d) { return ({ id: String(d.id), title: d.title || '', isGroup: d.isGroup, isChannel: d.isChannel }); });
                    allGroups.push.apply(allGroups, groups);
                    // Keyingi sahifa uchun oxirgi dialog sanasi
                    if (dialogs.length < batchSize)
                        return [3 /*break*/, 3]; // Hammasi olindi
                    lastDialog = dialogs[dialogs.length - 1];
                    lastDate = (lastDialog === null || lastDialog === void 0 ? void 0 : lastDialog.date) || ((_c = lastDialog === null || lastDialog === void 0 ? void 0 : lastDialog.message) === null || _c === void 0 ? void 0 : _c.date);
                    if (!lastDate || lastDate === offsetDate)
                        return [3 /*break*/, 3]; // Progress yo'q
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
                        firstName: me.firstName,
                        lastName: me.lastName,
                        username: me.username,
                        phone: me.phone,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function cmdIsConnected(_a) {
    var id = _a.id, sessionId = _a.sessionId;
    var client = clients.get(sessionId);
    reply(id, true, !!(client === null || client === void 0 ? void 0 : client.connected));
}
function cmdGetConnectedCount(_a) {
    var id = _a.id;
    var count = 0;
    for (var _i = 0, clients_2 = clients; _i < clients_2.length; _i++) {
        var _b = clients_2[_i], client = _b[1];
        if (client.connected)
            count++;
    }
    reply(id, true, count);
}
function cmdResolveUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var bigId, _i, clients_3, _c, sessionId, client, entity, _d;
        var id = _b.id, telegramId = _b.telegramId;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    bigId = BigInt(telegramId);
                    _i = 0, clients_3 = clients;
                    _e.label = 1;
                case 1:
                    if (!(_i < clients_3.length)) return [3 /*break*/, 6];
                    _c = clients_3[_i], sessionId = _c[0], client = _c[1];
                    if (!client.connected)
                        return [3 /*break*/, 5];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.getEntity(bigId)];
                case 3:
                    entity = _e.sent();
                    if (entity && entity.accessHash) {
                        reply(id, true, {
                            id: String(entity.id),
                            accessHash: String(entity.accessHash),
                            sessionId: sessionId,
                        });
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _d = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    reply(id, false, 'User not found in any session cache');
                    return [2 /*return*/];
            }
        });
    });
}
log('info', 'Telegram posting worker process initialized');
