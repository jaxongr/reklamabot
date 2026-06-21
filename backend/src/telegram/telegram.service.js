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
exports.TelegramService = void 0;
var common_1 = require("@nestjs/common");
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var Password_1 = require("telegram/Password");
var child_process_1 = require("child_process");
var path = require("path");
var client_1 = require("@prisma/client");
var TelegramService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TelegramService = _classThis = /** @class */ (function () {
        function TelegramService_1(prisma, config) {
            this.prisma = prisma;
            this.config = config;
            this.logger = new common_1.Logger(TelegramService.name);
            this.pendingAuths = new Map();
            // ===== CHILD PROCESS =====
            this.child = null;
            this.childReady = false;
            this.pendingRequests = new Map();
            this.requestIdCounter = 0;
            this.connectedSessions = new Set();
            this.apiId = parseInt(this.config.get('TELEGRAM_API_ID') || '0');
            this.apiHash = this.config.get('TELEGRAM_API_HASH') || '';
        }
        TelegramService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Telegram Service initialized (API ID: ".concat(this.apiId, ")"));
                            if (!this.apiId || !this.apiHash) {
                                this.logger.warn('TELEGRAM_API_ID yoki TELEGRAM_API_HASH sozlanmagan!');
                                return [2 /*return*/];
                            }
                            this.spawnChild();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.loadActiveSessions()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.warn('Sessionlarni yuklashda xatolik: ' + error_1.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.onModuleDestroy = function () {
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
        TelegramService_1.prototype.spawnChild = function () {
            var _this = this;
            var childPath = path.join(__dirname, 'telegram-worker.js');
            this.logger.log("Spawning telegram posting child process: ".concat(childPath));
            this.child = (0, child_process_1.fork)(childPath, [String(this.apiId), this.apiHash], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });
            this.child.on('message', function (msg) { return _this.handleChildMessage(msg); });
            this.child.on('error', function (err) {
                _this.logger.error("Telegram child process error: ".concat(err.message));
            });
            this.child.on('exit', function (code) {
                _this.logger.warn("Telegram child process exited with code ".concat(code));
                _this.childReady = false;
                _this.connectedSessions.clear();
                for (var _i = 0, _a = _this.pendingRequests; _i < _a.length; _i++) {
                    var _b = _a[_i], pending_2 = _b[1];
                    clearTimeout(pending_2.timer);
                    pending_2.reject(new Error('Child process exited'));
                }
                _this.pendingRequests.clear();
                // Auto-restart
                if (code !== 0) {
                    setTimeout(function () {
                        _this.logger.log('Restarting telegram child process...');
                        _this.spawnChild();
                        setTimeout(function () {
                            _this.loadActiveSessions().catch(function (err) {
                                return _this.logger.warn('Session reload after child restart: ' + err.message);
                            });
                        }, 2000);
                    }, 5000);
                }
            });
            this.childReady = true;
        };
        TelegramService_1.prototype.handleChildMessage = function (msg) {
            if (msg.type === 'response') {
                var pending_3 = this.pendingRequests.get(msg.id);
                if (pending_3) {
                    clearTimeout(pending_3.timer);
                    this.pendingRequests.delete(msg.id);
                    if (msg.success) {
                        pending_3.resolve(msg.data);
                    }
                    else {
                        pending_3.reject(new Error(msg.error || 'Child request failed'));
                    }
                }
            }
            else if (msg.type === 'log') {
                if (msg.level === 'error')
                    this.logger.error("[Worker] ".concat(msg.message));
                else if (msg.level === 'warn')
                    this.logger.warn("[Worker] ".concat(msg.message));
                else
                    this.logger.log("[Worker] ".concat(msg.message));
            }
        };
        TelegramService_1.prototype.sendToChild = function (type, data) {
            var _this = this;
            if (data === void 0) { data = {}; }
            return new Promise(function (resolve, reject) {
                if (!_this.child || !_this.childReady) {
                    reject(new Error('Child process not running'));
                    return;
                }
                var id = String(++_this.requestIdCounter);
                var timer = setTimeout(function () {
                    if (_this.pendingRequests.has(id)) {
                        _this.pendingRequests.delete(id);
                        reject(new Error('Child request timeout (120s)'));
                    }
                }, 120000);
                _this.pendingRequests.set(id, { resolve: resolve, reject: reject, timer: timer });
                _this.child.send(__assign({ type: type, id: id }, data));
            });
        };
        // ============================================================
        // AUTH FLOW (main thread — brief, short-lived)
        // ============================================================
        TelegramService_1.prototype.sendCode = function (userId, phone, sessionName) {
            return __awaiter(this, void 0, void 0, function () {
                var session, stringSession, client, result, phoneCodeHash, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.create({
                                data: {
                                    userId: userId,
                                    name: sessionName || "Session ".concat(phone.slice(-4)),
                                    phone: phone,
                                    status: client_1.SessionStatus.INACTIVE,
                                },
                            })];
                        case 1:
                            session = _a.sent();
                            stringSession = new sessions_1.StringSession('');
                            client = new telegram_1.TelegramClient(stringSession, this.apiId, this.apiHash, {
                                connectionRetries: 5,
                                requestRetries: 3,
                            });
                            return [4 /*yield*/, client.connect()];
                        case 2:
                            _a.sent();
                            this.logger.log("Client ulandi, kod yuborilmoqda: ".concat(phone));
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 8]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SendCode({
                                    phoneNumber: phone,
                                    apiId: this.apiId,
                                    apiHash: this.apiHash,
                                    settings: new telegram_1.Api.CodeSettings({}),
                                }))];
                        case 4:
                            result = _a.sent();
                            phoneCodeHash = result.phoneCodeHash;
                            this.pendingAuths.set(session.id, {
                                client: client,
                                phone: phone,
                                phoneCodeHash: phoneCodeHash,
                                sessionId: session.id,
                            });
                            this.logger.log("Kod yuborildi: ".concat(phone, ", session: ").concat(session.id));
                            return [2 /*return*/, { sessionId: session.id, phoneCodeHash: phoneCodeHash }];
                        case 5:
                            error_2 = _a.sent();
                            return [4 /*yield*/, this.prisma.session.delete({ where: { id: session.id } }).catch(function () { })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, client.disconnect().catch(function () { })];
                        case 7:
                            _a.sent();
                            this.logger.error("Kod yuborishda xatolik: ".concat(error_2.message));
                            throw new Error("Kod yuborishda xatolik: ".concat(error_2.message));
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.signIn = function (sessionId, code, password) {
            return __awaiter(this, void 0, void 0, function () {
                var pending, client, phone, phoneCodeHash, srpPassword, _a, _b, _c, _d, error_3, srpPassword, _e, _f, _g, _h, resendResult, newHash, resendError_1, sessionString, _j, groupsCount, error_4;
                var _k, _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            pending = this.pendingAuths.get(sessionId);
                            if (!pending) {
                                throw new Error('Auth jarayoni topilmadi. Qayta telefon raqam yuboring.');
                            }
                            client = pending.client, phone = pending.phone, phoneCodeHash = pending.phoneCodeHash;
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 30, , 33]);
                            if (!(password && !code)) return [3 /*break*/, 5];
                            this.logger.log("2FA parol bilan kirish: ".concat(sessionId));
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.account.GetPassword())];
                        case 2:
                            srpPassword = _m.sent();
                            _b = (_a = client).invoke;
                            _d = (_c = telegram_1.Api.auth.CheckPassword).bind;
                            _k = {};
                            return [4 /*yield*/, (0, Password_1.computeCheck)(srpPassword, password)];
                        case 3: return [4 /*yield*/, _b.apply(_a, [new (_d.apply(_c, [void 0, (_k.password = _m.sent(),
                                        _k)]))()])];
                        case 4:
                            _m.sent();
                            this.logger.log("2FA muvaffaqiyatli: ".concat(sessionId));
                            return [3 /*break*/, 22];
                        case 5:
                            this.logger.log("Kod bilan sign in: ".concat(sessionId, ", kod: ").concat(code));
                            _m.label = 6;
                        case 6:
                            _m.trys.push([6, 8, , 22]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SignIn({
                                    phoneNumber: phone,
                                    phoneCodeHash: phoneCodeHash,
                                    phoneCode: code,
                                }))];
                        case 7:
                            _m.sent();
                            return [3 /*break*/, 22];
                        case 8:
                            error_3 = _m.sent();
                            this.logger.error("SignIn xatolik: errorMessage=".concat(error_3.errorMessage, ", message=").concat(error_3.message));
                            if (!(error_3.errorMessage === 'SESSION_PASSWORD_NEEDED')) return [3 /*break*/, 12];
                            if (!password)
                                throw new Error('2FA_REQUIRED');
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.account.GetPassword())];
                        case 9:
                            srpPassword = _m.sent();
                            _f = (_e = client).invoke;
                            _h = (_g = telegram_1.Api.auth.CheckPassword).bind;
                            _l = {};
                            return [4 /*yield*/, (0, Password_1.computeCheck)(srpPassword, password)];
                        case 10: return [4 /*yield*/, _f.apply(_e, [new (_h.apply(_g, [void 0, (_l.password = _m.sent(),
                                        _l)]))()])];
                        case 11:
                            _m.sent();
                            return [3 /*break*/, 21];
                        case 12:
                            if (!(error_3.errorMessage === 'PHONE_CODE_INVALID')) return [3 /*break*/, 13];
                            throw new Error('Kod noto\'g\'ri. Qayta tekshiring.');
                        case 13:
                            if (!(error_3.errorMessage === 'PHONE_CODE_EXPIRED')) return [3 /*break*/, 20];
                            this.logger.log("Kod muddati o'tgan, qayta yuborilmoqda: ".concat(phone));
                            _m.label = 14;
                        case 14:
                            _m.trys.push([14, 16, , 19]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.ResendCode({
                                    phoneNumber: phone,
                                    phoneCodeHash: phoneCodeHash,
                                }))];
                        case 15:
                            resendResult = _m.sent();
                            newHash = resendResult.phoneCodeHash;
                            this.pendingAuths.set(sessionId, {
                                client: client,
                                phone: phone,
                                phoneCodeHash: newHash,
                                sessionId: sessionId,
                            });
                            throw new Error('RESEND_CODE');
                        case 16:
                            resendError_1 = _m.sent();
                            if (resendError_1.message === 'RESEND_CODE')
                                throw resendError_1;
                            this.logger.error("Kodni qayta yuborishda xatolik: ".concat(resendError_1.message));
                            this.pendingAuths.delete(sessionId);
                            return [4 /*yield*/, client.disconnect().catch(function () { })];
                        case 17:
                            _m.sent();
                            return [4 /*yield*/, this.prisma.session.delete({ where: { id: sessionId } }).catch(function () { })];
                        case 18:
                            _m.sent();
                            throw new Error('Kod muddati o\'tgan. Qayta telefon raqam yuboring.');
                        case 19: return [3 /*break*/, 21];
                        case 20: throw error_3;
                        case 21: return [3 /*break*/, 22];
                        case 22:
                            sessionString = client.session.save();
                            return [4 /*yield*/, this.prisma.session.update({
                                    where: { id: sessionId },
                                    data: { sessionString: sessionString, status: client_1.SessionStatus.ACTIVE },
                                })];
                        case 23:
                            _m.sent();
                            _m.label = 24;
                        case 24:
                            _m.trys.push([24, 26, , 27]);
                            return [4 /*yield*/, client.disconnect()];
                        case 25:
                            _m.sent();
                            return [3 /*break*/, 27];
                        case 26:
                            _j = _m.sent();
                            return [3 /*break*/, 27];
                        case 27:
                            this.pendingAuths.delete(sessionId);
                            // Connect in worker for long-running usage
                            return [4 /*yield*/, this.sendToChild('connect', { sessionId: sessionId, sessionString: sessionString })];
                        case 28:
                            // Connect in worker for long-running usage
                            _m.sent();
                            this.connectedSessions.add(sessionId);
                            return [4 /*yield*/, this.syncGroups(sessionId)];
                        case 29:
                            groupsCount = _m.sent();
                            this.logger.log("Session muvaffaqiyatli ulandi: ".concat(sessionId, ", guruhlar: ").concat(groupsCount));
                            return [2 /*return*/, { success: true, groupsCount: groupsCount }];
                        case 30:
                            error_4 = _m.sent();
                            if (error_4.message === '2FA_REQUIRED')
                                throw error_4;
                            if (error_4.message === 'RESEND_CODE')
                                throw error_4;
                            if (error_4.message.includes('Kod noto\'g\'ri'))
                                throw error_4;
                            if (error_4.message.includes('Kod muddati'))
                                throw error_4;
                            this.pendingAuths.delete(sessionId);
                            return [4 /*yield*/, client.disconnect().catch(function () { })];
                        case 31:
                            _m.sent();
                            return [4 /*yield*/, this.prisma.session.delete({ where: { id: sessionId } }).catch(function () { })];
                        case 32:
                            _m.sent();
                            this.logger.error("Sign in xatolik: ".concat(error_4.errorMessage || error_4.message));
                            throw new Error("Kirishda xatolik: ".concat(error_4.errorMessage || error_4.message));
                        case 33: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // SESSION MANAGEMENT (via worker)
        // ============================================================
        TelegramService_1.prototype.loadActiveSessions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, i, batch;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.findMany({
                                where: {
                                    status: client_1.SessionStatus.ACTIVE,
                                    isFrozen: false,
                                    sessionString: { not: null },
                                },
                            })];
                        case 1:
                            sessions = _a.sent();
                            this.logger.log("".concat(sessions.length, " ta faol session yuklanmoqda..."));
                            i = 0;
                            _a.label = 2;
                        case 2:
                            if (!(i < sessions.length)) return [3 /*break*/, 5];
                            batch = sessions.slice(i, i + 5);
                            return [4 /*yield*/, Promise.allSettled(batch.map(function (session) {
                                    return _this.connectSession(session.id)
                                        .then(function () { return _this.logger.log("Session yuklandi: ".concat(session.id, " (").concat(session.name, ")")); })
                                        .catch(function (error) { return _this.logger.error("Session yuklanmadi ".concat(session.id, ": ").concat(error.message)); });
                                }))];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            i += 5;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.connectSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var session, connected, _a, error_5;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.findUnique({
                                where: { id: sessionId },
                            })];
                        case 1:
                            session = _d.sent();
                            if (!(session === null || session === void 0 ? void 0 : session.sessionString)) {
                                throw new Error('Session yoki session string topilmadi');
                            }
                            if (session.isFrozen) {
                                throw new Error('Session muzlatilgan — avval eritib oling');
                            }
                            if (!this.connectedSessions.has(sessionId)) return [3 /*break*/, 5];
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.sendToChild('isConnected', { sessionId: sessionId })];
                        case 3:
                            connected = _d.sent();
                            if (connected)
                                return [2 /*return*/];
                            return [3 /*break*/, 5];
                        case 4:
                            _a = _d.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            _d.trys.push([5, 7, , 10]);
                            return [4 /*yield*/, this.sendToChild('connect', { sessionId: sessionId, sessionString: session.sessionString })];
                        case 6:
                            _d.sent();
                            this.connectedSessions.add(sessionId);
                            this.logger.log("Session ulandi (worker): ".concat(sessionId));
                            return [3 /*break*/, 10];
                        case 7:
                            error_5 = _d.sent();
                            this.logger.error("Session ulashda xatolik ".concat(sessionId, ": ").concat(error_5.message));
                            if (!(((_b = error_5.message) === null || _b === void 0 ? void 0 : _b.includes('AUTH_KEY_UNREGISTERED')) || ((_c = error_5.message) === null || _c === void 0 ? void 0 : _c.includes('SESSION_REVOKED')))) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.markSessionDead(sessionId)];
                        case 8:
                            _d.sent();
                            _d.label = 9;
                        case 9: throw error_5;
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.disconnectSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) return [3 /*break*/, 5];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToChild('disconnect', { sessionId: sessionId })];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            this.connectedSessions.delete(sessionId);
                            _b.label = 5;
                        case 5: return [4 /*yield*/, this.prisma.session.update({
                                where: { id: sessionId },
                                data: { status: client_1.SessionStatus.INACTIVE },
                            })];
                        case 6:
                            _b.sent();
                            this.logger.log("Session uzildi: ".concat(sessionId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.deleteSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, pending, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) return [3 /*break*/, 5];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToChild('disconnect', { sessionId: sessionId })];
                        case 2:
                            _c.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            this.connectedSessions.delete(sessionId);
                            _c.label = 5;
                        case 5:
                            pending = this.pendingAuths.get(sessionId);
                            if (!pending) return [3 /*break*/, 10];
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, pending.client.disconnect()];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9:
                            this.pendingAuths.delete(sessionId);
                            _c.label = 10;
                        case 10: return [4 /*yield*/, this.prisma.session.update({
                                where: { id: sessionId },
                                data: { status: client_1.SessionStatus.DELETED },
                            })];
                        case 11:
                            _c.sent();
                            this.logger.log("Session o'chirildi: ".concat(sessionId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.markSessionDead = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.update({
                                where: { id: sessionId },
                                data: {
                                    status: client_1.SessionStatus.DELETED,
                                    sessionString: null,
                                    isFrozen: true,
                                    frozenAt: new Date(),
                                    freezeCount: { increment: 1 },
                                },
                            })];
                        case 1:
                            _a.sent();
                            this.connectedSessions.delete(sessionId);
                            this.logger.warn("Session o'lgan deb belgilandi (DELETED): ".concat(sessionId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.markSessionFrozen = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.update({
                                where: { id: sessionId },
                                data: {
                                    isFrozen: true,
                                    frozenAt: new Date(),
                                    freezeCount: { increment: 1 },
                                },
                            })];
                        case 1:
                            _a.sent();
                            this.logger.warn("Session muzlatildi: ".concat(sessionId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // MESSAGING (via worker)
        // ============================================================
        TelegramService_1.prototype.sendMessage = function (sessionId, groupTelegramId, messageText) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_6, msg, waitSeconds, waitSeconds, parts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                throw new Error("Session ".concat(sessionId, " ulangan emas"));
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 6]);
                            return [4 /*yield*/, this.sendToChild('sendMessage', {
                                    sessionId: sessionId,
                                    peer: groupTelegramId,
                                    message: messageText,
                                })];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, { messageId: result === null || result === void 0 ? void 0 : result.messageId }];
                        case 3:
                            error_6 = _a.sent();
                            msg = error_6.message || '';
                            // Parse error types from worker
                            if (msg.startsWith('FLOOD_WAIT:')) {
                                waitSeconds = parseInt(msg.split(':')[1]) || 60;
                                this.logger.warn("FLOOD_WAIT ".concat(waitSeconds, "s \u2014 session: ").concat(sessionId));
                                throw new Error("FLOOD_WAIT:".concat(waitSeconds));
                            }
                            if (msg.startsWith('SLOWMODE_WAIT:')) {
                                waitSeconds = parseInt(msg.split(':')[1]) || 300;
                                this.logger.warn("SLOWMODE_WAIT ".concat(waitSeconds, "s \u2014 group: ").concat(groupTelegramId));
                                throw new Error("SLOWMODE_WAIT:".concat(waitSeconds));
                            }
                            if (msg.startsWith('WRITE_FORBIDDEN:')) {
                                parts = msg.split(':');
                                this.logger.warn("WRITE_FORBIDDEN [".concat(parts[1], "] \u2014 session: ").concat(sessionId, ", group: ").concat(groupTelegramId));
                                throw error_6;
                            }
                            if (msg.startsWith('PEER_INVALID:')) {
                                throw new Error("CHANNEL_INVALID:".concat(groupTelegramId));
                            }
                            if (!(msg.includes('AUTH_KEY_UNREGISTERED') || msg.includes('SESSION_REVOKED'))) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.markSessionDead(sessionId)];
                        case 4:
                            _a.sent();
                            throw new Error("SESSION_DEAD:".concat(sessionId));
                        case 5: throw error_6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.deleteMessage = function (sessionId, chatId, messageId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                this.logger.warn("Session ".concat(sessionId, " ulangan emas \u2014 xabar o'chirilmadi"));
                                return [2 /*return*/, false];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToChild('deleteMessage', { sessionId: sessionId, chatId: chatId, messageId: messageId })];
                        case 2: return [2 /*return*/, _b.sent()];
                        case 3:
                            _a = _b.sent();
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.deleteAdMessages = function (postHistories) {
            return __awaiter(this, void 0, void 0, function () {
                var deleted, failed, bySession, _i, postHistories_1, h, existing, tasks;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            deleted = 0;
                            failed = 0;
                            bySession = new Map();
                            for (_i = 0, postHistories_1 = postHistories; _i < postHistories_1.length; _i++) {
                                h = postHistories_1[_i];
                                if (!h.messageId)
                                    continue;
                                existing = bySession.get(h.sessionId) || [];
                                existing.push({ messageId: h.messageId, chatId: h.groupTelegramId });
                                bySession.set(h.sessionId, existing);
                            }
                            tasks = Array.from(bySession.entries()).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var _i, messages_1, msg, success;
                                var sessionId = _b[0], messages = _b[1];
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _i = 0, messages_1 = messages;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < messages_1.length)) return [3 /*break*/, 5];
                                            msg = messages_1[_i];
                                            return [4 /*yield*/, this.deleteMessage(sessionId, msg.chatId, msg.messageId)];
                                        case 2:
                                            success = _c.sent();
                                            if (success)
                                                deleted++;
                                            else
                                                failed++;
                                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 200); })];
                                        case 3:
                                            _c.sent();
                                            _c.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [4 /*yield*/, Promise.allSettled(tasks)];
                        case 1:
                            _a.sent();
                            this.logger.log("E'lon xabarlari o'chirildi: ".concat(deleted, " muvaffaqiyat, ").concat(failed, " xato"));
                            return [2 /*return*/, { deleted: deleted, failed: failed }];
                    }
                });
            });
        };
        // ============================================================
        // GROUP SYNC (dialogs from worker, DB in main thread)
        // ============================================================
        TelegramService_1.prototype.syncGroups = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var dialogResult, groups, _i, _a, d, telegramGroupIds_1, existingGroups, existingIds_1, newGroups, staleGroups, totalGroups, activeGroups, error_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                throw new Error('Session ulangan emas');
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 12, , 13]);
                            return [4 /*yield*/, this.sendToChild('getDialogs', { sessionId: sessionId, limit: 500 })];
                        case 2:
                            dialogResult = _b.sent();
                            groups = [];
                            for (_i = 0, _a = dialogResult.groups; _i < _a.length; _i++) {
                                d = _a[_i];
                                groups.push({
                                    telegramId: d.id,
                                    title: d.title || 'Nomsiz',
                                    username: null,
                                    type: d.isChannel ? 'CHANNEL' : (d.isGroup ? 'GROUP' : 'GROUP'),
                                    memberCount: null,
                                });
                            }
                            telegramGroupIds_1 = new Set(groups.map(function (g) { return g.telegramId; }));
                            return [4 /*yield*/, this.prisma.group.findMany({
                                    where: { sessionId: sessionId },
                                    select: { id: true, telegramId: true },
                                })];
                        case 3:
                            existingGroups = _b.sent();
                            existingIds_1 = new Set(existingGroups.map(function (g) { return g.telegramId; }));
                            newGroups = groups.filter(function (g) { return !existingIds_1.has(g.telegramId); });
                            if (!(newGroups.length > 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.group.createMany({
                                    data: newGroups.map(function (g) { return ({
                                        sessionId: sessionId,
                                        telegramId: g.telegramId,
                                        title: g.title,
                                        username: g.username,
                                        type: g.type,
                                        memberCount: g.memberCount,
                                    }); }),
                                    skipDuplicates: true,
                                })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            staleGroups = existingGroups.filter(function (g) { return !telegramGroupIds_1.has(g.telegramId); });
                            if (!(staleGroups.length > 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.group.deleteMany({
                                    where: { id: { in: staleGroups.map(function (g) { return g.id; }) } },
                                })];
                        case 6:
                            _b.sent();
                            this.logger.log("".concat(staleGroups.length, " ta eskirgan guruh o'chirildi"));
                            _b.label = 7;
                        case 7: return [4 /*yield*/, this.prisma.group.updateMany({
                                where: { sessionId: sessionId, isSkipped: true },
                                data: { isSkipped: false, hasRestrictions: false, skipReason: null },
                            })];
                        case 8:
                            _b.sent();
                            return [4 /*yield*/, this.prisma.group.count({ where: { sessionId: sessionId } })];
                        case 9:
                            totalGroups = _b.sent();
                            return [4 /*yield*/, this.prisma.group.count({
                                    where: { sessionId: sessionId, isActive: true, isSkipped: false },
                                })];
                        case 10:
                            activeGroups = _b.sent();
                            return [4 /*yield*/, this.prisma.session.update({
                                    where: { id: sessionId },
                                    data: { totalGroups: totalGroups, activeGroups: activeGroups, lastSyncAt: new Date() },
                                })];
                        case 11:
                            _b.sent();
                            this.logger.log("Guruhlar sinxronlandi: ".concat(sessionId, " \u2014 jami: ").concat(totalGroups, ", yangi: ").concat(newGroups.length, ", o'chirildi: ").concat(staleGroups.length));
                            return [2 /*return*/, totalGroups];
                        case 12:
                            error_7 = _b.sent();
                            this.logger.error("Guruhlar sinxronlashda xatolik: ".concat(error_7.message));
                            throw error_7;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // QUERY / STATUS (no gramJS needed)
        // ============================================================
        TelegramService_1.prototype.getUserSessions = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.session.findMany({
                            where: {
                                userId: userId,
                                status: { not: client_1.SessionStatus.DELETED },
                            },
                            include: {
                                _count: { select: { groups: true } },
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        TelegramService_1.prototype.isClientConnected = function (sessionId) {
            return this.connectedSessions.has(sessionId);
        };
        TelegramService_1.prototype.getConnectedCount = function () {
            return this.connectedSessions.size;
        };
        TelegramService_1.prototype.checkSessionConnection = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var connected, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                return [2 /*return*/, { connected: false, error: 'Client topilmadi' }];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToChild('isConnected', { sessionId: sessionId })];
                        case 2:
                            connected = _a.sent();
                            return [2 /*return*/, { connected: connected }];
                        case 3:
                            error_8 = _a.sent();
                            return [2 /*return*/, { connected: false, error: error_8.message }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramService_1.prototype.checkAllSessionConnections = function (sessionIds) {
            return __awaiter(this, void 0, void 0, function () {
                var results;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.allSettled(sessionIds.map(function (sessionId) { return __awaiter(_this, void 0, void 0, function () {
                                var status;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.checkSessionConnection(sessionId)];
                                        case 1:
                                            status = _a.sent();
                                            return [2 /*return*/, __assign({ sessionId: sessionId }, status)];
                                    }
                                });
                            }); }))];
                        case 1:
                            results = _a.sent();
                            return [2 /*return*/, results.map(function (result, index) {
                                    var _a;
                                    if (result.status === 'fulfilled') {
                                        return result.value;
                                    }
                                    return {
                                        sessionId: sessionIds[index],
                                        connected: false,
                                        error: ((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) || 'Tekshirishda xatolik',
                                    };
                                })];
                    }
                });
            });
        };
        TelegramService_1.prototype.hasPendingAuth = function (sessionId) {
            return this.pendingAuths.has(sessionId);
        };
        TelegramService_1.prototype.cancelPendingAuth = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var pending;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pending = this.pendingAuths.get(sessionId);
                            if (!pending) return [3 /*break*/, 2];
                            return [4 /*yield*/, pending.client.disconnect().catch(function () { })];
                        case 1:
                            _a.sent();
                            this.pendingAuths.delete(sessionId);
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.session.delete({ where: { id: sessionId } }).catch(function () { })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Resolve user accessHash from monitor session entity cache.
         * Used by TG SMS service when it can't resolve user by phone.
         */
        TelegramService_1.prototype.resolveUser = function (telegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.child || !this.childReady)
                                return [2 /*return*/, null];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToChild('resolveUser', { telegramId: telegramId })];
                        case 2:
                            result = _b.sent();
                            return [2 /*return*/, result || null];
                        case 3:
                            _a = _b.sent();
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return TelegramService_1;
    }());
    __setFunctionName(_classThis, "TelegramService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TelegramService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TelegramService = _classThis;
}();
exports.TelegramService = TelegramService;
