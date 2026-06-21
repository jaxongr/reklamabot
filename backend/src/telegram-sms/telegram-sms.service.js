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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramSmsService = void 0;
var common_1 = require("@nestjs/common");
var child_process_1 = require("child_process");
var path = require("path");
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var Password_1 = require("telegram/Password");
var client_1 = require("@prisma/client");
var https = require("https");
var TelegramSmsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TelegramSmsService = _classThis = /** @class */ (function () {
        function TelegramSmsService_1(prisma, config, monitorService) {
            this.prisma = prisma;
            this.config = config;
            this.monitorService = monitorService;
            this.logger = new common_1.Logger(TelegramSmsService.name);
            this.pendingAuths = new Map();
            // Child process
            this.child = null;
            this.childReady = false;
            this.pendingRequests = new Map();
            this.requestIdCounter = 0;
            this.connectedSessions = new Set();
            // Round-robin index for session rotation
            this.roundRobinIndex = 0;
            this.apiId = parseInt(this.config.get('TELEGRAM_API_ID') || '0');
            this.apiHash = this.config.get('TELEGRAM_API_HASH') || '';
            this.botToken = this.config.get('TELEGRAM_BOT_TOKEN') || '';
        }
        /**
         * Send message via Bot API (works with any user who started the bot)
         */
        TelegramSmsService_1.prototype.sendViaBotApi = function (chatId, text) {
            var _this = this;
            return new Promise(function (resolve) {
                if (!_this.botToken) {
                    resolve({ ok: false, error: 'BOT_TOKEN not configured' });
                    return;
                }
                var payload = JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' });
                var req = https.request({
                    hostname: 'api.telegram.org',
                    path: "/bot".concat(_this.botToken, "/sendMessage"),
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
                }, function (res) {
                    var data = '';
                    res.on('data', function (c) { return (data += c); });
                    res.on('end', function () {
                        var _a;
                        try {
                            var json = JSON.parse(data);
                            if (json.ok) {
                                resolve({ ok: true, messageId: (_a = json.result) === null || _a === void 0 ? void 0 : _a.message_id });
                            }
                            else {
                                resolve({ ok: false, error: json.description || 'Bot API error' });
                            }
                        }
                        catch (_b) {
                            resolve({ ok: false, error: 'Bot API parse error' });
                        }
                    });
                });
                req.on('error', function (e) { return resolve({ ok: false, error: e.message }); });
                req.write(payload);
                req.end();
            });
        };
        TelegramSmsService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.logger.log('TelegramSms Service initialized');
                    if (!this.apiId || !this.apiHash) {
                        this.logger.warn('TELEGRAM_API_ID or TELEGRAM_API_HASH not configured');
                        return [2 /*return*/];
                    }
                    this.spawnChild();
                    setTimeout(function () { return _this.loadActiveSessions(); }, 5000);
                    return [2 /*return*/];
                });
            });
        };
        TelegramSmsService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, _b, pending_1, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _i = 0, _a = this.pendingAuths;
                            _e.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            _b = _a[_i], pending_1 = _b[1];
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, pending_1.client.disconnect()];
                        case 3:
                            _e.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            _c = _e.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            this.pendingAuths.clear();
                            if (!this.child) return [3 /*break*/, 11];
                            _e.label = 7;
                        case 7:
                            _e.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.sendToChild('disconnectAll')];
                        case 8:
                            _e.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _d = _e.sent();
                            return [3 /*break*/, 10];
                        case 10:
                            this.child.kill();
                            this.child = null;
                            _e.label = 11;
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // CHILD PROCESS MANAGEMENT
        // ============================================================
        TelegramSmsService_1.prototype.spawnChild = function () {
            var _this = this;
            var childPath = path.join(__dirname, 'telegram-sms-worker.js');
            this.logger.log("Spawning TG SMS child process: ".concat(childPath));
            this.child = (0, child_process_1.fork)(childPath, [String(this.apiId), this.apiHash], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });
            this.child.on('message', function (msg) { return _this.handleChildMessage(msg); });
            this.child.on('error', function (err) {
                _this.logger.error("TG SMS child error: ".concat(err.message));
            });
            this.child.on('exit', function (code) {
                _this.logger.warn("TG SMS child exited with code ".concat(code));
                _this.childReady = false;
                _this.connectedSessions.clear();
                for (var _i = 0, _a = _this.pendingRequests; _i < _a.length; _i++) {
                    var _b = _a[_i], pending_2 = _b[1];
                    clearTimeout(pending_2.timer);
                    pending_2.reject(new Error('Child process exited'));
                }
                _this.pendingRequests.clear();
                if (code !== 0) {
                    setTimeout(function () {
                        _this.logger.log('Restarting TG SMS child process...');
                        _this.spawnChild();
                        setTimeout(function () { return _this.loadActiveSessions(); }, 3000);
                    }, 5000);
                }
            });
            this.childReady = true;
        };
        TelegramSmsService_1.prototype.handleChildMessage = function (msg) {
            if (msg.type === 'response') {
                var pending_3 = this.pendingRequests.get(msg.id);
                if (pending_3) {
                    clearTimeout(pending_3.timer);
                    this.pendingRequests.delete(msg.id);
                    if (msg.success)
                        pending_3.resolve(msg.data);
                    else
                        pending_3.reject(new Error(msg.error || 'Child request failed'));
                }
            }
            else if (msg.type === 'log') {
                if (msg.level === 'error')
                    this.logger.error("[SMS-W] ".concat(msg.message));
                else if (msg.level === 'warn')
                    this.logger.warn("[SMS-W] ".concat(msg.message));
                else
                    this.logger.log("[SMS-W] ".concat(msg.message));
            }
        };
        TelegramSmsService_1.prototype.sendToChild = function (type, data) {
            var _this = this;
            if (data === void 0) { data = {}; }
            return new Promise(function (resolve, reject) {
                if (!_this.child || !_this.childReady) {
                    reject(new Error('TG SMS child process not running'));
                    return;
                }
                var id = String(++_this.requestIdCounter);
                var timer = setTimeout(function () {
                    if (_this.pendingRequests.has(id)) {
                        _this.pendingRequests.delete(id);
                        reject(new Error('TG SMS child request timeout (60s)'));
                    }
                }, 60000);
                _this.pendingRequests.set(id, { resolve: resolve, reject: reject, timer: timer });
                _this.child.send(__assign({ type: type, id: id }, data));
            });
        };
        // ============================================================
        // SESSION LOADING
        // ============================================================
        TelegramSmsService_1.prototype.loadActiveSessions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, _i, sessions_2, session, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // FROZEN/SPAM sessionlarni qayta ACTIVE qilish (server restart'da cooldown yo'qolgan)
                        return [4 /*yield*/, this.prisma.telegramSmsSession.updateMany({
                                where: {
                                    status: { in: [client_1.TgSmsSessionStatus.FROZEN, client_1.TgSmsSessionStatus.SPAM] },
                                    isEnabled: true,
                                },
                                data: {
                                    status: client_1.TgSmsSessionStatus.ACTIVE,
                                    spamType: null,
                                    spamDetectedAt: null,
                                    spamExpectedEnd: null,
                                },
                            })];
                        case 1:
                            // FROZEN/SPAM sessionlarni qayta ACTIVE qilish (server restart'da cooldown yo'qolgan)
                            _a.sent();
                            return [4 /*yield*/, this.prisma.telegramSmsSession.findMany({
                                    where: {
                                        status: client_1.TgSmsSessionStatus.ACTIVE,
                                        isEnabled: true,
                                        sessionString: { not: { equals: null } },
                                    },
                                })];
                        case 2:
                            sessions = _a.sent();
                            this.logger.log("Loading ".concat(sessions.length, " TG SMS sessions..."));
                            _i = 0, sessions_2 = sessions;
                            _a.label = 3;
                        case 3:
                            if (!(_i < sessions_2.length)) return [3 /*break*/, 11];
                            session = sessions_2[_i];
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 7, , 10]);
                            return [4 /*yield*/, this.sendToChild('connect', {
                                    sessionId: session.id,
                                    sessionString: session.sessionString,
                                })];
                        case 5:
                            _a.sent();
                            this.connectedSessions.add(session.id);
                            this.logger.log("TG SMS session connected: ".concat(session.id, " (").concat(session.phone, ")"));
                            // Auto-setup profile: name + icon
                            return [4 /*yield*/, this.sendToChild('setupProfile', {
                                    sessionId: session.id,
                                    firstName: "YO'LDA menejer",
                                    lastName: '',
                                    photoPath: require('path').join(process.cwd(), 'profile-icon.png'),
                                }).catch(function (e) { return _this.logger.warn("Profile setup: ".concat(e.message)); })];
                        case 6:
                            // Auto-setup profile: name + icon
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 7:
                            error_1 = _a.sent();
                            this.logger.error("TG SMS session load failed: ".concat(session.id, " - ").concat(error_1.message));
                            if (!(error_1.message.includes('SESSION_REVOKED') || error_1.message.includes('AUTH_KEY'))) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: session.id },
                                    data: { status: client_1.TgSmsSessionStatus.BANNED, lastError: error_1.message },
                                })];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [3 /*break*/, 10];
                        case 10:
                            _i++;
                            return [3 /*break*/, 3];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // AUTH FLOW (session ulash)
        // ============================================================
        TelegramSmsService_1.prototype.sendCode = function (phone, name) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, session, _a, stringSession, client, result, err_1, migMatch, dcId, phoneCodeHash, error_2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.telegramSmsSession.findUnique({ where: { phone: phone } })];
                        case 1:
                            existing = _c.sent();
                            if (existing && existing.status === client_1.TgSmsSessionStatus.ACTIVE) {
                                throw new common_1.BadRequestException('Bu raqam allaqachon ulangan');
                            }
                            if (!existing) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: existing.id },
                                    data: { name: name || existing.name, status: client_1.TgSmsSessionStatus.PENDING },
                                })];
                        case 2:
                            _a = _c.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.prisma.telegramSmsSession.create({
                                data: { phone: phone, name: name || "TG SMS ".concat(phone.slice(-4)), status: client_1.TgSmsSessionStatus.PENDING },
                            })];
                        case 4:
                            _a = _c.sent();
                            _c.label = 5;
                        case 5:
                            session = _a;
                            stringSession = new sessions_1.StringSession('');
                            client = new telegram_1.TelegramClient(stringSession, this.apiId, this.apiHash, {
                                connectionRetries: 5,
                                requestRetries: 3,
                                autoReconnect: true,
                            });
                            return [4 /*yield*/, client.connect()];
                        case 6:
                            _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 16, , 20]);
                            result = void 0;
                            _c.label = 8;
                        case 8:
                            _c.trys.push([8, 10, , 15]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SendCode({
                                    phoneNumber: phone,
                                    apiId: this.apiId,
                                    apiHash: this.apiHash,
                                    settings: new telegram_1.Api.CodeSettings({}),
                                }))];
                        case 9:
                            result = _c.sent();
                            return [3 /*break*/, 15];
                        case 10:
                            err_1 = _c.sent();
                            migMatch = (_b = err_1.errorMessage) === null || _b === void 0 ? void 0 : _b.match(/PHONE_MIGRATE_(\d+)/);
                            if (!migMatch) return [3 /*break*/, 13];
                            dcId = parseInt(migMatch[1]);
                            this.logger.log("Phone DC migrate: ".concat(phone, " -> DC").concat(dcId));
                            return [4 /*yield*/, client._switchDC(dcId)];
                        case 11:
                            _c.sent();
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SendCode({
                                    phoneNumber: phone,
                                    apiId: this.apiId,
                                    apiHash: this.apiHash,
                                    settings: new telegram_1.Api.CodeSettings({}),
                                }))];
                        case 12:
                            result = _c.sent();
                            return [3 /*break*/, 14];
                        case 13: throw err_1;
                        case 14: return [3 /*break*/, 15];
                        case 15:
                            phoneCodeHash = result.phoneCodeHash;
                            this.pendingAuths.set(session.id, { client: client, phone: phone, phoneCodeHash: phoneCodeHash, sessionId: session.id });
                            this.logger.log("TG SMS code sent: ".concat(phone, ", session: ").concat(session.id));
                            return [2 /*return*/, { sessionId: session.id, phoneCodeHash: phoneCodeHash }];
                        case 16:
                            error_2 = _c.sent();
                            return [4 /*yield*/, client.disconnect().catch(function () { })];
                        case 17:
                            _c.sent();
                            if (!!existing) return [3 /*break*/, 19];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.delete({ where: { id: session.id } }).catch(function () { })];
                        case 18:
                            _c.sent();
                            _c.label = 19;
                        case 19: throw new common_1.BadRequestException("Kod yuborishda xatolik: ".concat(error_2.message));
                        case 20: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.signIn = function (sessionId, code, password) {
            return __awaiter(this, void 0, void 0, function () {
                var pending, client, phone, phoneCodeHash, srpPassword, _a, _b, _c, _d, error_3, srpPassword, _e, _f, _g, _h, sessionString, e_1, error_4;
                var _j, _k;
                var _this = this;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            pending = this.pendingAuths.get(sessionId);
                            if (!pending)
                                throw new common_1.BadRequestException('Auth jarayoni topilmadi. Qayta kod yuboring.');
                            client = pending.client, phone = pending.phone, phoneCodeHash = pending.phoneCodeHash;
                            _l.label = 1;
                        case 1:
                            _l.trys.push([1, 21, , 22]);
                            if (!(password && !code)) return [3 /*break*/, 5];
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.account.GetPassword())];
                        case 2:
                            srpPassword = _l.sent();
                            _b = (_a = client).invoke;
                            _d = (_c = telegram_1.Api.auth.CheckPassword).bind;
                            _j = {};
                            return [4 /*yield*/, (0, Password_1.computeCheck)(srpPassword, password)];
                        case 3: return [4 /*yield*/, _b.apply(_a, [new (_d.apply(_c, [void 0, (_j.password = _l.sent(),
                                        _j)]))()])];
                        case 4:
                            _l.sent();
                            return [3 /*break*/, 13];
                        case 5:
                            _l.trys.push([5, 7, , 13]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SignIn({
                                    phoneNumber: phone,
                                    phoneCodeHash: phoneCodeHash,
                                    phoneCode: code,
                                }))];
                        case 6:
                            _l.sent();
                            return [3 /*break*/, 13];
                        case 7:
                            error_3 = _l.sent();
                            if (!(error_3.errorMessage === 'SESSION_PASSWORD_NEEDED')) return [3 /*break*/, 11];
                            if (!password)
                                throw new Error('2FA_REQUIRED');
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.account.GetPassword())];
                        case 8:
                            srpPassword = _l.sent();
                            _f = (_e = client).invoke;
                            _h = (_g = telegram_1.Api.auth.CheckPassword).bind;
                            _k = {};
                            return [4 /*yield*/, (0, Password_1.computeCheck)(srpPassword, password)];
                        case 9: return [4 /*yield*/, _f.apply(_e, [new (_h.apply(_g, [void 0, (_k.password = _l.sent(),
                                        _k)]))()])];
                        case 10:
                            _l.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            if (error_3.errorMessage === 'PHONE_CODE_EXPIRED') {
                                throw new Error('PHONE_CODE_EXPIRED');
                            }
                            else {
                                throw error_3;
                            }
                            _l.label = 12;
                        case 12: return [3 /*break*/, 13];
                        case 13:
                            sessionString = client.session.save();
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: sessionId },
                                    data: {
                                        sessionString: sessionString,
                                        status: client_1.TgSmsSessionStatus.ACTIVE,
                                    },
                                })];
                        case 14:
                            _l.sent();
                            // Disconnect auth client, connect in child process
                            return [4 /*yield*/, client.disconnect().catch(function () { })];
                        case 15:
                            // Disconnect auth client, connect in child process
                            _l.sent();
                            this.pendingAuths.delete(sessionId);
                            _l.label = 16;
                        case 16:
                            _l.trys.push([16, 19, , 20]);
                            return [4 /*yield*/, this.sendToChild('connect', { sessionId: sessionId, sessionString: sessionString })];
                        case 17:
                            _l.sent();
                            this.connectedSessions.add(sessionId);
                            // Auto-setup profile: name = "YO'LDA menejer" + icon
                            return [4 /*yield*/, this.sendToChild('setupProfile', {
                                    sessionId: sessionId,
                                    firstName: "YO'LDA menejer",
                                    lastName: '',
                                    photoPath: require('path').join(process.cwd(), 'profile-icon.png'),
                                }).catch(function (e) { return _this.logger.warn("Profile setup: ".concat(e.message)); })];
                        case 18:
                            // Auto-setup profile: name = "YO'LDA menejer" + icon
                            _l.sent();
                            return [3 /*break*/, 20];
                        case 19:
                            e_1 = _l.sent();
                            this.logger.warn("Child connect after auth: ".concat(e_1.message));
                            return [3 /*break*/, 20];
                        case 20:
                            this.logger.log("TG SMS session activated: ".concat(sessionId));
                            return [2 /*return*/, { success: true }];
                        case 21:
                            error_4 = _l.sent();
                            if (error_4.message === '2FA_REQUIRED')
                                throw new common_1.BadRequestException('2FA parol kerak');
                            if (error_4.message === 'PHONE_CODE_EXPIRED')
                                throw new common_1.BadRequestException('Kod muddati tugagan');
                            throw new common_1.BadRequestException("Kirish xatolik: ".concat(error_4.message));
                        case 22: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // SESSION MANAGEMENT
        // ============================================================
        TelegramSmsService_1.prototype.getSessions = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.telegramSmsSession.findMany({
                            orderBy: { createdAt: 'desc' },
                            select: {
                                id: true,
                                phone: true,
                                name: true,
                                status: true,
                                messagesSent: true,
                                messagesFailed: true,
                                lastUsedAt: true,
                                lastError: true,
                                spamDetectedAt: true,
                                spamType: true,
                                spamExpectedEnd: true,
                                isEnabled: true,
                                createdAt: true,
                                updatedAt: true,
                                _count: { select: { messages: true } },
                            },
                        })];
                });
            });
        };
        TelegramSmsService_1.prototype.toggleSession = function (sessionId, enabled) {
            return __awaiter(this, void 0, void 0, function () {
                var session, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } })];
                        case 1:
                            session = _b.sent();
                            if (!session)
                                throw new common_1.NotFoundException('Session topilmadi');
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: sessionId },
                                    data: { isEnabled: enabled },
                                })];
                        case 2:
                            _b.sent();
                            if (!(!enabled && this.connectedSessions.has(sessionId))) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.sendToChild('disconnect', { sessionId: sessionId }).catch(function () { })];
                        case 3:
                            _b.sent();
                            this.connectedSessions.delete(sessionId);
                            return [3 /*break*/, 8];
                        case 4:
                            if (!(enabled && session.status === client_1.TgSmsSessionStatus.ACTIVE && session.sessionString)) return [3 /*break*/, 8];
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.sendToChild('connect', { sessionId: sessionId, sessionString: session.sessionString })];
                        case 6:
                            _b.sent();
                            this.connectedSessions.add(sessionId);
                            return [3 /*break*/, 8];
                        case 7:
                            _a = _b.sent();
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.deleteSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.sendToChild('disconnect', { sessionId: sessionId }).catch(function () { })];
                        case 1:
                            _a.sent();
                            this.connectedSessions.delete(sessionId);
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.telegramSmsSession.delete({ where: { id: sessionId } })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.reconnectSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } })];
                        case 1:
                            session = _a.sent();
                            if (!(session === null || session === void 0 ? void 0 : session.sessionString))
                                throw new common_1.BadRequestException('Session string yo\'q');
                            if (!this.connectedSessions.has(sessionId)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.sendToChild('disconnect', { sessionId: sessionId }).catch(function () { })];
                        case 2:
                            _a.sent();
                            this.connectedSessions.delete(sessionId);
                            _a.label = 3;
                        case 3: 
                        // Reconnect
                        return [4 /*yield*/, this.sendToChild('connect', { sessionId: sessionId, sessionString: session.sessionString })];
                        case 4:
                            // Reconnect
                            _a.sent();
                            this.connectedSessions.add(sessionId);
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: sessionId },
                                    data: {
                                        status: client_1.TgSmsSessionStatus.ACTIVE,
                                        spamDetectedAt: null,
                                        spamType: null,
                                        lastError: null,
                                    },
                                })];
                        case 5:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.checkSpamStatus = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, spamStatus, text, expectedEnd, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                throw new common_1.BadRequestException('Session ulanmagan');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, this.sendToChild('checkSpamBot', { sessionId: sessionId })];
                        case 2:
                            result = _a.sent();
                            spamStatus = result.spamStatus, text = result.text, expectedEnd = result.expectedEnd;
                            if (!(spamStatus === 'SPAM' || spamStatus === 'BANNED')) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: sessionId },
                                    data: {
                                        status: spamStatus === 'BANNED' ? client_1.TgSmsSessionStatus.BANNED : client_1.TgSmsSessionStatus.SPAM,
                                        spamDetectedAt: new Date(),
                                        spamType: spamStatus,
                                        spamExpectedEnd: expectedEnd ? new Date(expectedEnd) : null,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                where: { id: sessionId },
                                data: {
                                    status: client_1.TgSmsSessionStatus.ACTIVE,
                                    spamDetectedAt: null,
                                    spamType: null,
                                    spamExpectedEnd: null,
                                },
                            })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/, { spamStatus: spamStatus, text: text, expectedEnd: expectedEnd }];
                        case 7:
                            error_5 = _a.sent();
                            return [2 /*return*/, { spamStatus: 'ERROR', text: error_5.message, expectedEnd: null }];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // TARGET LISTS
        // ============================================================
        TelegramSmsService_1.prototype.getDriverTargets = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverProfile.findMany({
                            where: { user: { telegramId: { not: '' } } },
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                                vehicleType: true,
                                lastCity: true,
                                user: { select: { telegramId: true } },
                            },
                            orderBy: { fullName: 'asc' },
                        })];
                });
            });
        };
        TelegramSmsService_1.prototype.getOrderTargets = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = { senderTelegramId: { not: { equals: null } } };
                    if (params.type)
                        where.type = params.type;
                    if (params.search) {
                        where.OR = [
                            { phone: { contains: params.search } },
                            { cargoFrom: { contains: params.search, mode: 'insensitive' } },
                            { cargoTo: { contains: params.search, mode: 'insensitive' } },
                            { senderName: { contains: params.search, mode: 'insensitive' } },
                        ];
                    }
                    return [2 /*return*/, this.prisma.order.findMany({
                            where: where,
                            select: {
                                id: true,
                                senderTelegramId: true,
                                senderName: true,
                                phone: true,
                                cargoFrom: true,
                                cargoTo: true,
                                type: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: params.limit || 100,
                        })];
                });
            });
        };
        TelegramSmsService_1.prototype.getBlockedTargets = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.blockedUser.findMany({
                            where: { isActive: true, senderTelegramId: { not: '' } },
                            select: {
                                id: true,
                                senderTelegramId: true,
                                senderName: true,
                                senderUsername: true,
                                phone: true,
                                reason: true,
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        TelegramSmsService_1.prototype.getAllTargets = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, drivers, orders, blocked, seen, targets, _i, drivers_1, d, tgId, _b, orders_1, o, route, _c, blocked_1, b;
                var _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.driverProfile.findMany({
                                    where: { user: { telegramId: { not: '' } } },
                                    select: { fullName: true, phone: true, user: { select: { telegramId: true, username: true } } },
                                    take: 2000,
                                }),
                                this.prisma.order.findMany({
                                    where: { senderTelegramId: { not: { equals: null } } },
                                    select: { senderTelegramId: true, senderUsername: true, senderName: true, phone: true, cargoFrom: true, cargoTo: true, type: true },
                                    orderBy: { createdAt: 'desc' },
                                    take: 5000,
                                }),
                                this.prisma.blockedUser.findMany({
                                    where: { isActive: true, senderTelegramId: { not: '' } },
                                    select: { senderTelegramId: true, senderUsername: true, senderName: true, phone: true },
                                }),
                            ])];
                        case 1:
                            _a = _f.sent(), drivers = _a[0], orders = _a[1], blocked = _a[2];
                            seen = new Set();
                            targets = [];
                            for (_i = 0, drivers_1 = drivers; _i < drivers_1.length; _i++) {
                                d = drivers_1[_i];
                                tgId = (_d = d.user) === null || _d === void 0 ? void 0 : _d.telegramId;
                                if (!tgId || seen.has(tgId))
                                    continue;
                                seen.add(tgId);
                                targets.push({ telegramId: tgId, name: d.fullName || d.phone || 'Haydovchi', phone: d.phone || undefined, username: ((_e = d.user) === null || _e === void 0 ? void 0 : _e.username) || undefined, source: 'Haydovchi' });
                            }
                            for (_b = 0, orders_1 = orders; _b < orders_1.length; _b++) {
                                o = orders_1[_b];
                                if (!o.senderTelegramId || seen.has(o.senderTelegramId))
                                    continue;
                                seen.add(o.senderTelegramId);
                                route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' -> ');
                                targets.push({
                                    telegramId: o.senderTelegramId,
                                    name: o.senderName || route || 'Order',
                                    phone: o.phone || undefined,
                                    username: o.senderUsername || undefined,
                                    source: o.type === 'DRIVER' ? 'Haydovchi order' : 'Yuk order',
                                });
                            }
                            for (_c = 0, blocked_1 = blocked; _c < blocked_1.length; _c++) {
                                b = blocked_1[_c];
                                if (!b.senderTelegramId || seen.has(b.senderTelegramId))
                                    continue;
                                seen.add(b.senderTelegramId);
                                targets.push({ telegramId: b.senderTelegramId, name: b.senderName || b.phone || 'Bloklangan', phone: b.phone || undefined, username: b.senderUsername || undefined, source: 'Bloklangan' });
                            }
                            return [2 /*return*/, targets];
                    }
                });
            });
        };
        /**
         * Send to ALL unique telegram users
         */
        TelegramSmsService_1.prototype.sendToAll = function (message, sentById) {
            return __awaiter(this, void 0, void 0, function () {
                var targets;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getAllTargets()];
                        case 1:
                            targets = _a.sent();
                            return [2 /*return*/, this.sendBulk(targets, message, { category: 'GENERAL', sentById: sentById })];
                    }
                });
            });
        };
        // ============================================================
        // SENDING MESSAGES
        // ============================================================
        /**
         * Get next available session for sending (round-robin)
         */
        TelegramSmsService_1.prototype.getNextSession = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, all, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.telegramSmsSession.findMany({
                                where: {
                                    status: client_1.TgSmsSessionStatus.ACTIVE,
                                    isEnabled: true,
                                    sessionString: { not: { equals: null } },
                                },
                                orderBy: { createdAt: 'asc' },
                            })];
                        case 1:
                            sessions = _a.sent();
                            this.logger.debug("getNextSession: ".concat(sessions.length, " ta faol session topildi"));
                            if (!(sessions.length === 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.findMany({
                                    select: { id: true, status: true, isEnabled: true, sessionString: true },
                                })];
                        case 2:
                            all = _a.sent();
                            this.logger.warn("Faol session yo'q! DB dagi sessionlar: ".concat(JSON.stringify(all.map(function (s) { return ({ id: s.id.slice(0, 8), status: s.status, enabled: s.isEnabled, hasString: !!s.sessionString }); }))));
                            return [2 /*return*/, null];
                        case 3:
                            // Round-robin
                            this.roundRobinIndex = this.roundRobinIndex % sessions.length;
                            session = sessions[this.roundRobinIndex];
                            this.roundRobinIndex++;
                            return [2 /*return*/, { id: session.id, sessionString: session.sessionString }];
                    }
                });
            });
        };
        /**
         * Send a single DM to a Telegram user
         */
        TelegramSmsService_1.prototype.sendDm = function (targetTelegramId_1, message_1) {
            return __awaiter(this, arguments, void 0, function (targetTelegramId, message, options) {
                var msgLog, session, e_2, result, firstErr_1, groupErr_1, resolved, ahErr_1, resolved, ahErr_2, error_6, errMsg, waitSec;
                var _this = this;
                var _a;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.telegramSmsMessage.create({
                                data: {
                                    targetTelegramId: targetTelegramId,
                                    targetPhone: options.targetPhone,
                                    targetName: options.targetName,
                                    message: message,
                                    category: options.category || 'GENERAL',
                                    referenceId: options.referenceId,
                                    sentById: options.sentById,
                                    status: client_1.TgSmsMessageStatus.PENDING,
                                },
                            })];
                        case 1:
                            msgLog = _b.sent();
                            // === STRATEGY: Phone import → Username → getEntity(ID) ===
                            this.logger.log("TG SMS yuborish: target=".concat(targetTelegramId, ", phone=").concat(options.targetPhone || '-', ", username=").concat(options.targetUsername || '-'));
                            return [4 /*yield*/, this.getNextSession()];
                        case 2:
                            session = _b.sent();
                            if (!!session) return [3 /*break*/, 4];
                            this.logger.warn("TG SMS: faol session yo'q!");
                            return [4 /*yield*/, this.prisma.telegramSmsMessage.update({
                                    where: { id: msgLog.id },
                                    data: { status: client_1.TgSmsMessageStatus.FAILED, errorMessage: 'Faol session yo\'q' },
                                })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, { success: false, error: 'Faol TG SMS session yo\'q' }];
                        case 4:
                            if (!!this.connectedSessions.has(session.id)) return [3 /*break*/, 9];
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 7, , 9]);
                            return [4 /*yield*/, this.sendToChild('connect', { sessionId: session.id, sessionString: session.sessionString })];
                        case 6:
                            _b.sent();
                            this.connectedSessions.add(session.id);
                            return [3 /*break*/, 9];
                        case 7:
                            e_2 = _b.sent();
                            return [4 /*yield*/, this.prisma.telegramSmsMessage.update({
                                    where: { id: msgLog.id },
                                    data: { status: client_1.TgSmsMessageStatus.FAILED, errorMessage: "Session ulash xatolik: ".concat(e_2.message) },
                                })];
                        case 8:
                            _b.sent();
                            return [2 /*return*/, { success: false, error: e_2.message }];
                        case 9:
                            _b.trys.push([9, 36, , 43]);
                            result = void 0;
                            _b.label = 10;
                        case 10:
                            _b.trys.push([10, 12, , 33]);
                            return [4 /*yield*/, this.sendToChild('sendDm', {
                                    sessionId: session.id,
                                    targetId: targetTelegramId,
                                    targetUsername: options.targetUsername || undefined,
                                    targetPhone: options.targetPhone || undefined,
                                    targetAccessHash: options.senderAccessHash || undefined,
                                    message: message,
                                })];
                        case 11:
                            result = _b.sent();
                            return [3 /*break*/, 33];
                        case 12:
                            firstErr_1 = _b.sent();
                            if (!((_a = firstErr_1.message) === null || _a === void 0 ? void 0 : _a.startsWith('PEER_INVALID:'))) return [3 /*break*/, 31];
                            this.logger.warn("PEER_INVALID: ".concat(targetTelegramId, " \u2014 fallback urinish..."));
                            if (!(options.sourceGroupId && options.sourceMessageId)) return [3 /*break*/, 24];
                            _b.label = 13;
                        case 13:
                            _b.trys.push([13, 15, , 23]);
                            this.logger.log("Guruh xabar fallback: group=".concat(options.sourceGroupId, ", msg=").concat(options.sourceMessageId));
                            return [4 /*yield*/, this.sendToChild('sendDmViaGroupMsg', {
                                    sessionId: session.id,
                                    targetId: targetTelegramId,
                                    sourceGroupId: options.sourceGroupId,
                                    sourceMessageId: options.sourceMessageId,
                                    message: message,
                                })];
                        case 14:
                            result = _b.sent();
                            if (result === null || result === void 0 ? void 0 : result.messageId) {
                                this.logger.log("Guruh xabar fallback muvaffaqiyatli: target=".concat(targetTelegramId));
                            }
                            return [3 /*break*/, 23];
                        case 15:
                            groupErr_1 = _b.sent();
                            this.logger.warn("Guruh xabar fallback xato: ".concat(groupErr_1.message));
                            _b.label = 16;
                        case 16:
                            _b.trys.push([16, 21, , 22]);
                            return [4 /*yield*/, this.monitorService.resolveUser(targetTelegramId, options.monitorSessionId)];
                        case 17:
                            resolved = _b.sent();
                            if (!(resolved === null || resolved === void 0 ? void 0 : resolved.accessHash)) return [3 /*break*/, 19];
                            this.logger.log("AccessHash fallback: ".concat(targetTelegramId, " -> ").concat(resolved.accessHash.slice(0, 8), "..."));
                            return [4 /*yield*/, this.sendToChild('sendDm', {
                                    sessionId: session.id,
                                    targetId: targetTelegramId,
                                    targetAccessHash: resolved.accessHash,
                                    message: message,
                                })];
                        case 18:
                            result = _b.sent();
                            return [3 /*break*/, 20];
                        case 19: throw new Error("PEER_INVALID: barcha fallback'lar ishlamadi");
                        case 20: return [3 /*break*/, 22];
                        case 21:
                            ahErr_1 = _b.sent();
                            this.logger.warn("AccessHash fallback xato: ".concat(ahErr_1.message));
                            throw ahErr_1;
                        case 22: return [3 /*break*/, 23];
                        case 23: return [3 /*break*/, 30];
                        case 24:
                            _b.trys.push([24, 29, , 30]);
                            return [4 /*yield*/, this.monitorService.resolveUser(targetTelegramId, options.monitorSessionId)];
                        case 25:
                            resolved = _b.sent();
                            if (!(resolved === null || resolved === void 0 ? void 0 : resolved.accessHash)) return [3 /*break*/, 27];
                            this.logger.log("AccessHash fallback: ".concat(targetTelegramId, " -> ").concat(resolved.accessHash.slice(0, 8), "..."));
                            return [4 /*yield*/, this.sendToChild('sendDm', {
                                    sessionId: session.id,
                                    targetId: targetTelegramId,
                                    targetAccessHash: resolved.accessHash,
                                    message: message,
                                })];
                        case 26:
                            result = _b.sent();
                            return [3 /*break*/, 28];
                        case 27: throw firstErr_1;
                        case 28: return [3 /*break*/, 30];
                        case 29:
                            ahErr_2 = _b.sent();
                            throw ahErr_2;
                        case 30: return [3 /*break*/, 32];
                        case 31: throw firstErr_1;
                        case 32: return [3 /*break*/, 33];
                        case 33: return [4 /*yield*/, this.prisma.telegramSmsMessage.update({
                                where: { id: msgLog.id },
                                data: {
                                    sessionId: session.id,
                                    status: client_1.TgSmsMessageStatus.SENT,
                                    telegramMsgId: result === null || result === void 0 ? void 0 : result.messageId,
                                    deliveredAt: new Date(),
                                },
                            })];
                        case 34:
                            _b.sent();
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: session.id },
                                    data: { messagesSent: { increment: 1 }, lastUsedAt: new Date() },
                                })];
                        case 35:
                            _b.sent();
                            this.logger.log("TG SMS yuborildi: target=".concat(targetTelegramId, ", session=").concat(session.id));
                            return [2 /*return*/, { success: true, messageId: msgLog.id, sessionId: session.id }];
                        case 36:
                            error_6 = _b.sent();
                            errMsg = error_6.message || '';
                            // Handle spam/peer_flood — session ni FROZEN QILMAYMIZ, faqat log
                            if (errMsg.startsWith('SPAM:')) {
                                this.logger.warn("Session ".concat(session.id, " SPAM xato: ").concat(errMsg, " \u2014 davom etamiz"));
                            }
                            if (!errMsg.startsWith('SESSION_DEAD:')) return [3 /*break*/, 38];
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: session.id },
                                    data: {
                                        status: client_1.TgSmsSessionStatus.BANNED,
                                        lastError: errMsg,
                                        lastErrorAt: new Date(),
                                    },
                                })];
                        case 37:
                            _b.sent();
                            this.connectedSessions.delete(session.id);
                            _b.label = 38;
                        case 38:
                            if (!errMsg.startsWith('FLOOD_WAIT:')) return [3 /*break*/, 40];
                            waitSec = parseInt(errMsg.split(':')[1]) || 60;
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: session.id },
                                    data: {
                                        status: client_1.TgSmsSessionStatus.FROZEN,
                                        spamType: 'FLOOD',
                                        spamDetectedAt: new Date(),
                                        spamExpectedEnd: new Date(Date.now() + waitSec * 1000),
                                        lastError: errMsg,
                                    },
                                })];
                        case 39:
                            _b.sent();
                            // Auto-unfreeze after wait
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                                where: { id: session.id },
                                                data: {
                                                    status: client_1.TgSmsSessionStatus.ACTIVE,
                                                    spamType: null,
                                                    spamDetectedAt: null,
                                                    spamExpectedEnd: null,
                                                },
                                            }).catch(function () { })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, (waitSec + 5) * 1000);
                            _b.label = 40;
                        case 40: 
                        // Update message as failed
                        return [4 /*yield*/, this.prisma.telegramSmsMessage.update({
                                where: { id: msgLog.id },
                                data: {
                                    sessionId: session.id,
                                    status: errMsg.startsWith('SPAM:') ? client_1.TgSmsMessageStatus.SPAM_BLOCKED : client_1.TgSmsMessageStatus.FAILED,
                                    errorMessage: errMsg,
                                },
                            })];
                        case 41:
                            // Update message as failed
                            _b.sent();
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: session.id },
                                    data: { messagesFailed: { increment: 1 }, lastErrorAt: new Date(), lastError: errMsg },
                                })];
                        case 42:
                            _b.sent();
                            return [2 /*return*/, { success: false, error: errMsg, messageId: msgLog.id }];
                        case 43: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.handleSpamDetection = function (sessionId, errMsg) {
            return __awaiter(this, void 0, void 0, function () {
                var cooldownMinutes;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cooldownMinutes = 5;
                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                    where: { id: sessionId },
                                    data: {
                                        status: client_1.TgSmsSessionStatus.FROZEN,
                                        spamDetectedAt: new Date(),
                                        spamType: 'PEER_FLOOD',
                                        spamExpectedEnd: new Date(Date.now() + cooldownMinutes * 60000),
                                        lastError: errMsg,
                                        lastErrorAt: new Date(),
                                        // isEnabled saqlanadi — o'chirilmaydi!
                                    },
                                })];
                        case 1:
                            _a.sent();
                            this.logger.warn("Session ".concat(sessionId, " PEER_FLOOD \u2014 ").concat(cooldownMinutes, " min cooldown"));
                            // Avtomatik qayta ACTIVE qilish
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var sess, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 4, , 5]);
                                            return [4 /*yield*/, this.prisma.telegramSmsSession.findUnique({ where: { id: sessionId } })];
                                        case 1:
                                            sess = _b.sent();
                                            if (!((sess === null || sess === void 0 ? void 0 : sess.status) === client_1.TgSmsSessionStatus.FROZEN)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.prisma.telegramSmsSession.update({
                                                    where: { id: sessionId },
                                                    data: {
                                                        status: client_1.TgSmsSessionStatus.ACTIVE,
                                                        spamDetectedAt: null,
                                                        spamType: null,
                                                        spamExpectedEnd: null,
                                                    },
                                                })];
                                        case 2:
                                            _b.sent();
                                            this.logger.log("Session ".concat(sessionId, " PEER_FLOOD cooldown tugadi, qayta ACTIVE"));
                                            _b.label = 3;
                                        case 3: return [3 /*break*/, 5];
                                        case 4:
                                            _a = _b.sent();
                                            return [3 /*break*/, 5];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); }, cooldownMinutes * 60000);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Bulk send to multiple targets
         */
        TelegramSmsService_1.prototype.sendBulk = function (targets_1, message_1) {
            return __awaiter(this, arguments, void 0, function (targets, message, options) {
                var results, delay, _i, targets_2, target, result;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            results = [];
                            delay = options.delayMs || 5000;
                            _i = 0, targets_2 = targets;
                            _a.label = 1;
                        case 1:
                            if (!(_i < targets_2.length)) return [3 /*break*/, 5];
                            target = targets_2[_i];
                            return [4 /*yield*/, this.sendDm(target.telegramId, message, {
                                    category: options.category,
                                    sentById: options.sentById,
                                    targetName: target.name,
                                    targetPhone: target.phone,
                                    targetUsername: target.username,
                                })];
                        case 2:
                            result = _a.sent();
                            results.push(__assign({ telegramId: target.telegramId, name: target.name }, result));
                            if (!(targets.indexOf(target) < targets.length - 1)) return [3 /*break*/, 4];
                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, delay); })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/, results];
                    }
                });
            });
        };
        /**
         * Send to drivers
         */
        TelegramSmsService_1.prototype.sendToDrivers = function (message, sentById, driverIds) {
            return __awaiter(this, void 0, void 0, function () {
                var where, drivers, targets;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = { user: { telegramId: { not: '' } } };
                            if (driverIds === null || driverIds === void 0 ? void 0 : driverIds.length)
                                where.id = { in: driverIds };
                            return [4 /*yield*/, this.prisma.driverProfile.findMany({
                                    where: where,
                                    select: { id: true, fullName: true, phone: true, user: { select: { telegramId: true, username: true } } },
                                })];
                        case 1:
                            drivers = _a.sent();
                            targets = drivers
                                .filter(function (d) { return d.user.telegramId; })
                                .map(function (d) { return ({
                                telegramId: d.user.telegramId,
                                name: d.fullName || d.phone || 'Haydovchi',
                                phone: d.phone || undefined,
                                username: d.user.username || undefined,
                            }); });
                            return [2 /*return*/, this.sendBulk(targets, message, { category: 'DRIVER', sentById: sentById })];
                    }
                });
            });
        };
        /**
         * Send to order contacts (by senderTelegramId)
         */
        TelegramSmsService_1.prototype.sendToOrders = function (message, sentById, orderIds) {
            return __awaiter(this, void 0, void 0, function () {
                var orders, seen, targets, _i, orders_2, o, route;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.findMany({
                                where: { id: { in: orderIds }, senderTelegramId: { not: { equals: null } } },
                                select: {
                                    id: true,
                                    senderTelegramId: true,
                                    senderUsername: true,
                                    senderName: true,
                                    phone: true,
                                    cargoFrom: true,
                                    cargoTo: true,
                                },
                            })];
                        case 1:
                            orders = _a.sent();
                            seen = new Set();
                            targets = [];
                            for (_i = 0, orders_2 = orders; _i < orders_2.length; _i++) {
                                o = orders_2[_i];
                                if (!o.senderTelegramId || seen.has(o.senderTelegramId))
                                    continue;
                                seen.add(o.senderTelegramId);
                                route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' -> ');
                                targets.push({
                                    telegramId: o.senderTelegramId,
                                    name: o.senderName || route || o.phone || 'Order',
                                    phone: o.phone || undefined,
                                    username: o.senderUsername || undefined,
                                });
                            }
                            return [2 /*return*/, this.sendBulk(targets, message, { category: 'ORDER', sentById: sentById })];
                    }
                });
            });
        };
        /**
         * Send to blocked user contacts
         */
        TelegramSmsService_1.prototype.sendToBlocked = function (message, sentById, blockedIds) {
            return __awaiter(this, void 0, void 0, function () {
                var where, blocked, seen, targets, _i, blocked_2, b;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = { isActive: true, senderTelegramId: { not: '' } };
                            if (blockedIds === null || blockedIds === void 0 ? void 0 : blockedIds.length)
                                where.id = { in: blockedIds };
                            return [4 /*yield*/, this.prisma.blockedUser.findMany({
                                    where: where,
                                    select: { id: true, senderTelegramId: true, senderUsername: true, senderName: true, phone: true },
                                })];
                        case 1:
                            blocked = _a.sent();
                            seen = new Set();
                            targets = [];
                            for (_i = 0, blocked_2 = blocked; _i < blocked_2.length; _i++) {
                                b = blocked_2[_i];
                                if (!b.senderTelegramId || seen.has(b.senderTelegramId))
                                    continue;
                                seen.add(b.senderTelegramId);
                                targets.push({
                                    telegramId: b.senderTelegramId,
                                    name: b.senderName || b.phone || 'Bloklangan',
                                    phone: b.phone || undefined,
                                    username: b.senderUsername || undefined,
                                });
                            }
                            return [2 /*return*/, this.sendBulk(targets, message, { category: 'BLOCKED', sentById: sentById })];
                    }
                });
            });
        };
        // ============================================================
        // MESSAGE HISTORY & STATS
        // ============================================================
        TelegramSmsService_1.prototype.getHistory = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, where, _a, data, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = params.page || 1;
                            limit = params.limit || 50;
                            skip = (page - 1) * limit;
                            where = {};
                            if (params.category)
                                where.category = params.category;
                            if (params.status)
                                where.status = params.status;
                            if (params.sessionId)
                                where.sessionId = params.sessionId;
                            if (params.search) {
                                where.OR = [
                                    { targetName: { contains: params.search, mode: 'insensitive' } },
                                    { targetTelegramId: { contains: params.search } },
                                    { targetPhone: { contains: params.search } },
                                    { message: { contains: params.search, mode: 'insensitive' } },
                                ];
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.telegramSmsMessage.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                        include: {
                                            session: { select: { phone: true, name: true } },
                                        },
                                    }),
                                    this.prisma.telegramSmsMessage.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), data = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.getStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var today, _a, totalMessages, sentCount, failedCount, spamCount, todayCount, activeSessions, totalSessions, spamSessions;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.telegramSmsMessage.count(),
                                    this.prisma.telegramSmsMessage.count({ where: { status: { in: [client_1.TgSmsMessageStatus.SENT, client_1.TgSmsMessageStatus.DELIVERED] } } }),
                                    this.prisma.telegramSmsMessage.count({ where: { status: client_1.TgSmsMessageStatus.FAILED } }),
                                    this.prisma.telegramSmsMessage.count({ where: { status: client_1.TgSmsMessageStatus.SPAM_BLOCKED } }),
                                    this.prisma.telegramSmsMessage.count({ where: { createdAt: { gte: today } } }),
                                    this.prisma.telegramSmsSession.count({ where: { status: client_1.TgSmsSessionStatus.ACTIVE, isEnabled: true } }),
                                    this.prisma.telegramSmsSession.count(),
                                    this.prisma.telegramSmsSession.count({ where: { status: { in: [client_1.TgSmsSessionStatus.SPAM, client_1.TgSmsSessionStatus.BANNED] } } }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalMessages = _a[0], sentCount = _a[1], failedCount = _a[2], spamCount = _a[3], todayCount = _a[4], activeSessions = _a[5], totalSessions = _a[6], spamSessions = _a[7];
                            return [2 /*return*/, {
                                    totalMessages: totalMessages,
                                    sentCount: sentCount,
                                    failedCount: failedCount,
                                    spamCount: spamCount,
                                    todayCount: todayCount,
                                    activeSessions: activeSessions,
                                    totalSessions: totalSessions,
                                    spamSessions: spamSessions,
                                    connectedNow: this.connectedSessions.size,
                                }];
                    }
                });
            });
        };
        // ============================================================
        // AUTO-SMS CONFIG (Telegram SMS uchun)
        // ============================================================
        TelegramSmsService_1.prototype.getAutoConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                var raw;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.systemConfig.findUnique({ where: { key: 'tg_sms_auto_config' } })];
                        case 1:
                            raw = _a.sent();
                            if (raw === null || raw === void 0 ? void 0 : raw.value) {
                                try {
                                    return [2 /*return*/, JSON.parse(raw.value)];
                                }
                                catch (_b) { }
                            }
                            return [2 /*return*/, {
                                    orderEnabled: false,
                                    orderTemplate: 'Sizning yuk e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
                                    driverOrderEnabled: false,
                                    driverOrderTemplate: 'Sizning haydovchi e\'loningiz topildi! {marshrut}.',
                                    blockedEnabled: false,
                                    blockedTemplate: 'Hurmatli {ism}, sizning e\'loningiz bloklandi. Sabab: {sabab}.',
                                }];
                    }
                });
            });
        };
        TelegramSmsService_1.prototype.setAutoConfig = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.systemConfig.upsert({
                                where: { key: 'tg_sms_auto_config' },
                                update: { value: JSON.stringify(config) },
                                create: { key: 'tg_sms_auto_config', value: JSON.stringify(config), type: 'JSON' },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, config];
                    }
                });
            });
        };
        /**
         * Auto-send on blocked user (called from message-filter service)
         */
        TelegramSmsService_1.prototype.onNewBlockedUser = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var config, msg;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!data.senderTelegramId || data.senderTelegramId.startsWith('phone_'))
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getAutoConfig()];
                        case 1:
                            config = _a.sent();
                            if (!config.blockedEnabled)
                                return [2 /*return*/];
                            msg = config.blockedTemplate || '';
                            if (!msg.trim())
                                return [2 /*return*/];
                            msg = msg
                                .replace(/{ism}/g, data.senderName || 'Foydalanuvchi')
                                .replace(/{sabab}/g, data.reason || 'qoidabuzarlik');
                            return [4 /*yield*/, this.sendDm(data.senderTelegramId, msg, {
                                    category: 'BLOCKED',
                                    targetName: data.senderName || 'Blocked user',
                                    targetPhone: data.phone || undefined,
                                    targetUsername: data.senderUsername || undefined,
                                    monitorSessionId: data.monitorSessionId,
                                    sourceGroupId: data.sourceGroupId,
                                    sourceMessageId: data.sourceMessageId,
                                    senderAccessHash: data.senderAccessHash,
                                }).catch(function (e) { return _this.logger.error("TG Auto-SMS blocked error: ".concat(e.message)); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Auto-send on new order (called from monitor service)
         */
        TelegramSmsService_1.prototype.onNewOrder = function (order) {
            return __awaiter(this, void 0, void 0, function () {
                var config, isDriver, msg, route;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!order.senderTelegramId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getAutoConfig()];
                        case 1:
                            config = _a.sent();
                            isDriver = order.type === 'DRIVER';
                            if (isDriver && !config.driverOrderEnabled)
                                return [2 /*return*/];
                            if (!isDriver && !config.orderEnabled)
                                return [2 /*return*/];
                            msg = isDriver ? (config.driverOrderTemplate || '') : (config.orderTemplate || '');
                            if (!msg.trim())
                                return [2 /*return*/];
                            route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' -> ');
                            msg = msg
                                .replace(/{marshrut}/g, route || 'belgilanmagan')
                                .replace(/{tur}/g, isDriver ? 'Haydovchi' : 'Yuk')
                                .replace(/{ism}/g, order.senderName || 'Foydalanuvchi');
                            return [4 /*yield*/, this.sendDm(order.senderTelegramId, msg, {
                                    category: isDriver ? 'DRIVER' : 'ORDER',
                                    targetName: order.senderName || route || 'Order',
                                    targetPhone: order.phone || undefined,
                                    targetUsername: order.senderUsername || undefined,
                                    monitorSessionId: order.monitorSessionId,
                                    sourceGroupId: order.sourceGroupId,
                                    sourceMessageId: order.sourceMessageId,
                                    senderAccessHash: order.senderAccessHash,
                                }).catch(function (e) { return _this.logger.error("TG Auto-SMS error: ".concat(e.message)); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return TelegramSmsService_1;
    }());
    __setFunctionName(_classThis, "TelegramSmsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TelegramSmsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TelegramSmsService = _classThis;
}();
exports.TelegramSmsService = TelegramSmsService;
