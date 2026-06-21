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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorService = void 0;
var common_1 = require("@nestjs/common");
var telegram_1 = require("telegram");
var sessions_1 = require("telegram/sessions");
var Password_1 = require("telegram/Password");
var child_process_1 = require("child_process");
var path = require("path");
var client_1 = require("@prisma/client");
var dispatcher_keywords_1 = require("./data/dispatcher-keywords");
var city_distances_1 = require("./data/city-distances");
var MAX_MONITOR_SESSIONS = 20;
var MonitorService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MonitorService = _classThis = /** @class */ (function () {
        function MonitorService_1(prisma, config, systemConfig, gateway, messageFilter, smsService, telegramSmsService) {
            var _this = this;
            this.prisma = prisma;
            this.config = config;
            this.systemConfig = systemConfig;
            this.gateway = gateway;
            this.messageFilter = messageFilter;
            this.smsService = smsService;
            this.telegramSmsService = telegramSmsService;
            this.logger = new common_1.Logger(MonitorService.name);
            this.pendingAuths = new Map();
            // Duplikat tekshiruv: phone+groupId → timestamp (barcha sessionlar uchun umumiy)
            this.recentOrders = new Map();
            this.MAX_DEDUP_ENTRIES = 20000; // Map hajmi cheklangan — 20K dan oshsa eskilari tozalanadi
            this.DEDUP_TTL = 60 * 60000; // 1 soat (matn va sender dedup uchun)
            // Diagnostika counters — har 5 daqiqada log qiladi
            this.diagCounters = { total: 0, excludeKw: 0, noKeyword: 0, noPhone: 0, phoneDup: 0, senderDup: 0, textDup: 0, dbDup: 0, blocked: 0, created: 0 };
            // Per-session diagnostics
            this.perSessionDiag = new Map();
            // Phone dedup owner tracking (diagnostika uchun)
            this.phoneDedupOwner = new Map();
            // Sender stats in-memory tracker (cleanup har 6 soatda)
            this.senderStats = new Map();
            this.MAX_SENDER_STATS = 10000;
            // MonitorSession cache (har xabar uchun DB query qilmaslik uchun)
            this.sessionCache = new Map();
            this.SESSION_CACHE_TTL = 5 * 60000;
            this.GROUP_SYNC_INTERVAL = 30 * 60000;
            // ===== CHILD PROCESSES (har session uchun alohida) =====
            this.childProcesses = new Map();
            this.pendingRequests = new Map();
            this.requestIdCounter = 0;
            // Track which sessions are connected
            this.connectedSessions = new Set();
            // Track last message received from worker per session (for health monitoring)
            this.lastWorkerActivity = new Map();
            this.HEALTH_CHECK_INTERVAL = 3 * 60000;
            this.SESSION_STALE_THRESHOLD = 5 * 60000;
            // Filter rules cache
            this.filterRulesCache = null;
            this.filterRulesCacheTime = 0;
            this.FILTER_RULES_CACHE_TTL = 2 * 60000;
            // ============================================================
            // PRIORITY GURUHLAR
            // ============================================================
            this.priorityGroupsCache = null;
            this.priorityGroupsCacheTime = 0;
            this.PRIORITY_CACHE_TTL = 60000;
            this.apiId = parseInt(this.config.get('TELEGRAM_API_ID') || '0');
            this.apiHash = this.config.get('TELEGRAM_API_HASH') || '';
            // Duplikat cleanup har 2 minutda
            this.dedupCleanupInterval = setInterval(function () {
                var now = Date.now();
                var phoneTTL = 4 * 60 * 60000;
                var cleaned = 0;
                for (var _i = 0, _a = _this.recentOrders; _i < _a.length; _i++) {
                    var _b = _a[_i], key = _b[0], ts = _b[1];
                    var ttl = key.startsWith('phone_') ? phoneTTL : _this.DEDUP_TTL;
                    if (now - ts > ttl) {
                        _this.recentOrders.delete(key);
                        cleaned++;
                    }
                }
                // Hard limit — agar hali ham katta bo'lsa, eng eskilarini tozalash
                if (_this.recentOrders.size > _this.MAX_DEDUP_ENTRIES) {
                    var entries = __spreadArray([], _this.recentOrders.entries(), true).sort(function (a, b) { return a[1] - b[1]; });
                    var toRemove = entries.slice(0, entries.length - _this.MAX_DEDUP_ENTRIES);
                    for (var _c = 0, toRemove_1 = toRemove; _c < toRemove_1.length; _c++) {
                        var key = toRemove_1[_c][0];
                        _this.recentOrders.delete(key);
                    }
                    cleaned += toRemove.length;
                }
                // SenderStats cleanup — eskilarini tozalash
                var todayStr = new Date().toISOString().slice(0, 10);
                for (var _d = 0, _e = _this.senderStats; _d < _e.length; _d++) {
                    var _f = _e[_d], key = _f[0], val = _f[1];
                    if (val.date !== todayStr)
                        _this.senderStats.delete(key);
                }
                if (_this.senderStats.size > _this.MAX_SENDER_STATS) {
                    var oldest = __spreadArray([], _this.senderStats.keys(), true).slice(0, _this.senderStats.size - _this.MAX_SENDER_STATS);
                    for (var _g = 0, oldest_1 = oldest; _g < oldest_1.length; _g++) {
                        var key = oldest_1[_g];
                        _this.senderStats.delete(key);
                    }
                }
                if (cleaned > 0 || _this.senderStats.size > 1000) {
                    _this.logger.debug("Cleanup: dedup=".concat(_this.recentOrders.size, " (cleaned ").concat(cleaned, "), senderStats=").concat(_this.senderStats.size));
                }
            }, 2 * 60000);
        }
        MonitorService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.logger.log('Monitor Service initialized');
                    // Diagnostika: har 5 daqiqada qayerda nechta xabar filtrlanyotganini log qilish
                    this.diagInterval = setInterval(function () {
                        var d = _this.diagCounters;
                        if (d.total > 0) {
                            _this.logger.log("[DIAG 5min] total=".concat(d.total, " | excludeKw=").concat(d.excludeKw, " noKeyword=").concat(d.noKeyword, " noPhone=").concat(d.noPhone, " ") +
                                "phoneDup=".concat(d.phoneDup, " senderDup=").concat(d.senderDup, " textDup=").concat(d.textDup, " dbDup=").concat(d.dbDup, " ") +
                                "blocked=".concat(d.blocked, " | CREATED=").concat(d.created));
                            // Per-session breakdown
                            for (var _i = 0, _a = _this.perSessionDiag; _i < _a.length; _i++) {
                                var _b = _a[_i], sid = _b[0], sd = _b[1];
                                if (sd.total > 0) {
                                    _this.logger.log("[DIAG session ".concat(sid.slice(-8), "] total=").concat(sd.total, " created=").concat(sd.created, " phoneDup=").concat(sd.phoneDup, "(self=").concat(sd.selfDup || 0, ",other=").concat(sd.otherDup || 0, ") noPhone=").concat(sd.noPhone, " noKeyword=").concat(sd.noKeyword));
                                }
                            }
                            _this.phoneDedupOwner.clear();
                            _this.diagCounters = { total: 0, excludeKw: 0, noKeyword: 0, noPhone: 0, phoneDup: 0, senderDup: 0, textDup: 0, dbDup: 0, blocked: 0, created: 0 };
                            _this.perSessionDiag.clear();
                        }
                    }, 5 * 60000);
                    if (!this.apiId || !this.apiHash) {
                        this.logger.warn('TELEGRAM_API_ID yoki TELEGRAM_API_HASH sozlanmagan!');
                        return [2 /*return*/];
                    }
                    // Sessionlarni 5s kechiktirish
                    setTimeout(function () {
                        _this.loadActiveSessions().catch(function (error) {
                            _this.logger.warn('Monitor sessionlarni yuklashda xatolik: ' + error.message);
                        });
                    }, 5000);
                    // Har 30 minutda barcha aktiv sessionlar guruhlarini sinxronlash
                    this.groupSyncInterval = setInterval(function () {
                        _this.syncAllSessionGroups().catch(function (err) {
                            return _this.logger.warn("Guruh sinxronlash xatolik: ".concat(err.message));
                        });
                    }, this.GROUP_SYNC_INTERVAL);
                    // Har 3 minutda session health check
                    this.healthCheckInterval = setInterval(function () {
                        _this.performHealthCheck().catch(function (err) {
                            return _this.logger.warn("Health check xatolik: ".concat(err.message));
                        });
                    }, this.HEALTH_CHECK_INTERVAL);
                    return [2 /*return*/];
                });
            });
        };
        MonitorService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, _b, pending_1, _c, _d, _e, _f, sid, child, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            clearInterval(this.dedupCleanupInterval);
                            clearInterval(this.groupSyncInterval);
                            clearInterval(this.healthCheckInterval);
                            clearInterval(this.diagInterval);
                            _i = 0, _a = this.pendingAuths;
                            _h.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            _b = _a[_i], pending_1 = _b[1];
                            _h.label = 2;
                        case 2:
                            _h.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, pending_1.client.disconnect()];
                        case 3:
                            _h.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            _c = _h.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            this.pendingAuths.clear();
                            _d = 0, _e = this.childProcesses;
                            _h.label = 7;
                        case 7:
                            if (!(_d < _e.length)) return [3 /*break*/, 13];
                            _f = _e[_d], sid = _f[0], child = _f[1];
                            _h.label = 8;
                        case 8:
                            _h.trys.push([8, 10, , 11]);
                            return [4 /*yield*/, this.sendToSession(sid, 'disconnect')];
                        case 9:
                            _h.sent();
                            return [3 /*break*/, 11];
                        case 10:
                            _g = _h.sent();
                            return [3 /*break*/, 11];
                        case 11:
                            child.kill();
                            _h.label = 12;
                        case 12:
                            _d++;
                            return [3 /*break*/, 7];
                        case 13:
                            this.childProcesses.clear();
                            this.connectedSessions.clear();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // CHILD PROCESS MANAGEMENT (har session uchun alohida process)
        // ============================================================
        /**
         * Spawn a dedicated child process for a specific session
         */
        MonitorService_1.prototype.spawnSessionProcess = function (sessionId) {
            var _this = this;
            var childPath = path.join(__dirname, 'monitor-worker.js');
            var child = (0, child_process_1.fork)(childPath, [String(this.apiId), this.apiHash, sessionId], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
            });
            child.on('message', function (msg) { return _this.handleChildMessage(sessionId, msg); });
            child.on('error', function (err) {
                _this.logger.error("Worker [".concat(sessionId.slice(-8), "] error: ").concat(err.message));
            });
            child.on('exit', function (code) {
                _this.logger.warn("Worker [".concat(sessionId.slice(-8), "] exited (code ").concat(code, ")"));
                _this.childProcesses.delete(sessionId);
                _this.connectedSessions.delete(sessionId);
                // Reject pending requests for this session
                for (var _i = 0, _a = _this.pendingRequests; _i < _a.length; _i++) {
                    var _b = _a[_i], id = _b[0], pending_2 = _b[1];
                    if (id.startsWith(sessionId + '_')) {
                        clearTimeout(pending_2.timer);
                        pending_2.reject(new Error('Child process exited'));
                        _this.pendingRequests.delete(id);
                    }
                }
                // Auto-restart if session is still ACTIVE
                if (code !== 0 && code !== null) {
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var session, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, this.prisma.monitorSession.findUnique({
                                            where: { id: sessionId },
                                            select: { status: true, sessionString: true },
                                        })];
                                case 1:
                                    session = _a.sent();
                                    if (!((session === null || session === void 0 ? void 0 : session.status) === client_1.MonitorSessionStatus.ACTIVE && session.sessionString)) return [3 /*break*/, 3];
                                    this.logger.log("Auto-restart worker [".concat(sessionId.slice(-8), "]"));
                                    return [4 /*yield*/, this.connectSessionInWorker(sessionId, session.sessionString)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    err_1 = _a.sent();
                                    this.logger.warn("Auto-restart failed [".concat(sessionId.slice(-8), "]: ").concat(err_1.message));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }, 5000);
                }
            });
            this.childProcesses.set(sessionId, child);
            return child;
        };
        MonitorService_1.prototype.handleChildMessage = function (sessionId, msg) {
            var _this = this;
            switch (msg.type) {
                case 'response': {
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
                    break;
                }
                case 'newMessage':
                    this.handleWorkerNewMessage(msg.sessionId, msg.data).catch(function (err) {
                        _this.logger.error("Message processing error [".concat(sessionId.slice(-8), "]: ").concat(err.message));
                    });
                    break;
                case 'heartbeat':
                    this.lastWorkerActivity.set(sessionId, Date.now());
                    break;
                case 'log':
                    if (msg.level === 'error')
                        this.logger.error("[W] ".concat(msg.message));
                    else if (msg.level === 'warn')
                        this.logger.warn("[W] ".concat(msg.message));
                    else
                        this.logger.log("[W] ".concat(msg.message));
                    break;
            }
        };
        /**
         * Send command to a specific session's worker process
         */
        MonitorService_1.prototype.sendToSession = function (sessionId, type, data) {
            var _this = this;
            if (data === void 0) { data = {}; }
            return new Promise(function (resolve, reject) {
                var child = _this.childProcesses.get(sessionId);
                if (!child) {
                    reject(new Error("No worker process for session ".concat(sessionId.slice(-8))));
                    return;
                }
                var id = "".concat(sessionId, "_").concat(++_this.requestIdCounter);
                var timeoutMs = (type === 'connect' || type === 'getDialogs') ? 120000 : 60000;
                var timer = setTimeout(function () {
                    if (_this.pendingRequests.has(id)) {
                        _this.pendingRequests.delete(id);
                        reject(new Error("Worker request timeout (".concat(timeoutMs / 1000, "s)")));
                    }
                }, timeoutMs);
                _this.pendingRequests.set(id, { resolve: resolve, reject: reject, timer: timer });
                child.send(__assign({ type: type, id: id }, data));
            });
        };
        // ============================================================
        // SESSION MANAGEMENT (uses worker for gramJS)
        // ============================================================
        /**
         * Load active monitor sessions on startup — sends them to worker
         * Batch parallel (3 tadan) + retry mexanizmi
         */
        MonitorService_1.prototype.loadActiveSessions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, validSessions, BATCH_SIZE, BATCH_DELAY, failedSessions, batchStart, batch, results, _i, results_1, r;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.monitorSession.findMany({
                                where: { status: client_1.MonitorSessionStatus.ACTIVE },
                            })];
                        case 1:
                            sessions = _a.sent();
                            this.logger.log("".concat(sessions.length, " ta aktiv monitor session topildi"));
                            validSessions = sessions.filter(function (s) { return s.sessionString; });
                            BATCH_SIZE = 5;
                            BATCH_DELAY = 5000;
                            failedSessions = [];
                            batchStart = 0;
                            _a.label = 2;
                        case 2:
                            if (!(batchStart < validSessions.length)) return [3 /*break*/, 6];
                            batch = validSessions.slice(batchStart, batchStart + BATCH_SIZE);
                            return [4 /*yield*/, Promise.allSettled(batch.map(function (session) {
                                    return _this.connectSessionInWorker(session.id, session.sessionString)
                                        .then(function () { return ({ id: session.id, ok: true }); })
                                        .catch(function (error) {
                                        _this.logger.warn("Monitor session ".concat(session.id, " ulanmadi: ").concat(error.message));
                                        return { id: session.id, ok: false, session: session };
                                    });
                                }))];
                        case 3:
                            results = _a.sent();
                            // Xato bo'lganlarga retry uchun saqlash
                            for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                                r = results_1[_i];
                                if (r.status === 'fulfilled' && !r.value.ok && r.value.session) {
                                    failedSessions.push(r.value.session);
                                }
                            }
                            if (!(batchStart + BATCH_SIZE < validSessions.length)) return [3 /*break*/, 5];
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, BATCH_DELAY); })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            batchStart += BATCH_SIZE;
                            return [3 /*break*/, 2];
                        case 6:
                            this.logger.log("Monitor sessions: ".concat(this.connectedSessions.size, " ulandi, ").concat(failedSessions.length, " xato"));
                            // 2-bosqich: Xato bo'lganlarni 30s dan keyin qayta ulash (retry)
                            if (failedSessions.length > 0) {
                                this.logger.log("".concat(failedSessions.length, " ta session 30s dan keyin qayta ulanadi..."));
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _i, failedSessions_1, session, error_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _i = 0, failedSessions_1 = failedSessions;
                                                _a.label = 1;
                                            case 1:
                                                if (!(_i < failedSessions_1.length)) return [3 /*break*/, 9];
                                                session = failedSessions_1[_i];
                                                _a.label = 2;
                                            case 2:
                                                _a.trys.push([2, 4, , 6]);
                                                return [4 /*yield*/, this.connectSessionInWorker(session.id, session.sessionString)];
                                            case 3:
                                                _a.sent();
                                                this.logger.log("Retry muvaffaqiyatli: ".concat(session.id));
                                                return [3 /*break*/, 6];
                                            case 4:
                                                error_1 = _a.sent();
                                                this.logger.error("Retry ham xato: ".concat(session.id, " \u2014 ").concat(error_1.message));
                                                // Faqat retry ham ishlamasa INACTIVE
                                                return [4 /*yield*/, this.prisma.monitorSession.update({
                                                        where: { id: session.id },
                                                        data: { status: client_1.MonitorSessionStatus.INACTIVE },
                                                    }).catch(function () { })];
                                            case 5:
                                                // Faqat retry ham ishlamasa INACTIVE
                                                _a.sent();
                                                return [3 /*break*/, 6];
                                            case 6: 
                                            // Retrylar orasida 10s
                                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10000); })];
                                            case 7:
                                                // Retrylar orasida 10s
                                                _a.sent();
                                                _a.label = 8;
                                            case 8:
                                                _i++;
                                                return [3 /*break*/, 1];
                                            case 9:
                                                this.logger.log("Retry tugadi. Jami ulangan: ".concat(this.connectedSessions.size));
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, 30000);
                            }
                            // Dastlabki guruh sinxronlash — 2 minutdan keyin
                            setTimeout(function () {
                                _this.syncAllSessionGroups().catch(function (err) {
                                    return _this.logger.warn("Guruh sinxronlash xatolik: ".concat(err.message));
                                });
                            }, 2 * 60000);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Connect a session in the worker thread
         */
        MonitorService_1.prototype.connectSessionInWorker = function (sessionId, sessionString) {
            return __awaiter(this, void 0, void 0, function () {
                var existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            existing = this.childProcesses.get(sessionId);
                            if (existing) {
                                try {
                                    existing.kill();
                                }
                                catch (_b) { }
                                this.childProcesses.delete(sessionId);
                            }
                            // Spawn new process for this session
                            this.spawnSessionProcess(sessionId);
                            // Send connect command
                            return [4 /*yield*/, this.sendToSession(sessionId, 'connect', { sessionString: sessionString })];
                        case 1:
                            // Send connect command
                            _a.sent();
                            this.connectedSessions.add(sessionId);
                            this.lastWorkerActivity.set(sessionId, Date.now());
                            this.logger.log("Monitor session ulandi: ".concat(sessionId.slice(-8)));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get all monitor sessions for a user
         */
        MonitorService_1.prototype.getSessions = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.monitorSession.findMany({
                            where: {
                                userId: userId,
                                status: { not: client_1.MonitorSessionStatus.DELETED },
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        /**
         * Get single monitor session
         */
        MonitorService_1.prototype.getSession = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.monitorSession.findUnique({ where: { id: id } })];
                });
            });
        };
        /**
         * Step 1: Send auth code to phone for monitor session
         * Auth runs in MAIN THREAD (short-lived, doesn't block for long)
         */
        MonitorService_1.prototype.sendCode = function (userId, phone, name) {
            return __awaiter(this, void 0, void 0, function () {
                var count, session, stringSession, client, result, phoneCodeHash, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.monitorSession.count({
                                where: {
                                    userId: userId,
                                    status: { in: [client_1.MonitorSessionStatus.ACTIVE, client_1.MonitorSessionStatus.CONNECTING, client_1.MonitorSessionStatus.PENDING] },
                                },
                            })];
                        case 1:
                            count = _a.sent();
                            if (count >= MAX_MONITOR_SESSIONS) {
                                throw new Error("Maksimal ".concat(MAX_MONITOR_SESSIONS, " ta kuzatuv session ruxsat etiladi"));
                            }
                            return [4 /*yield*/, this.prisma.monitorSession.create({
                                    data: {
                                        userId: userId,
                                        name: name || "Monitor ".concat(phone.slice(-4)),
                                        phone: phone,
                                        status: client_1.MonitorSessionStatus.CONNECTING,
                                    },
                                })];
                        case 2:
                            session = _a.sent();
                            stringSession = new sessions_1.StringSession('');
                            client = new telegram_1.TelegramClient(stringSession, this.apiId, this.apiHash, {
                                connectionRetries: 3,
                                requestRetries: 2,
                                useWSS: true,
                                floodSleepThreshold: 60,
                            });
                            client._errorHandler = function (err) {
                                var msg = (err === null || err === void 0 ? void 0 : err.message) || '';
                                if (msg === 'TIMEOUT' || msg === 'Not connected')
                                    return;
                                _this.logger.error("gramJS auth error: ".concat(msg));
                            };
                            return [4 /*yield*/, client.connect()];
                        case 3:
                            _a.sent();
                            this.logger.log("Monitor client ulandi, kod yuborilmoqda: ".concat(phone));
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 6, , 9]);
                            return [4 /*yield*/, client.invoke(new telegram_1.Api.auth.SendCode({
                                    phoneNumber: phone,
                                    apiId: this.apiId,
                                    apiHash: this.apiHash,
                                    settings: new telegram_1.Api.CodeSettings({}),
                                }))];
                        case 5:
                            result = _a.sent();
                            phoneCodeHash = result.phoneCodeHash;
                            this.pendingAuths.set(session.id, {
                                client: client,
                                phone: phone,
                                phoneCodeHash: phoneCodeHash,
                                monitorSessionId: session.id,
                            });
                            return [2 /*return*/, { monitorSessionId: session.id, phoneCodeHash: phoneCodeHash }];
                        case 6:
                            error_2 = _a.sent();
                            return [4 /*yield*/, client.disconnect()];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: session.id },
                                    data: { status: client_1.MonitorSessionStatus.INACTIVE },
                                })];
                        case 8:
                            _a.sent();
                            throw error_2;
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Step 2: Sign in with code
         * Auth runs in MAIN THREAD, then session is handed to worker for listening
         */
        MonitorService_1.prototype.signIn = function (monitorSessionId, code, password) {
            return __awaiter(this, void 0, void 0, function () {
                var pending, error_3, passwordResult, srp, sessionString, _a, result, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            pending = this.pendingAuths.get(monitorSessionId);
                            if (!pending) {
                                throw new Error('Auth sessiya topilmadi. Qaytadan kod yuboring.');
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 9]);
                            return [4 /*yield*/, pending.client.invoke(new telegram_1.Api.auth.SignIn({
                                    phoneNumber: pending.phone,
                                    phoneCodeHash: pending.phoneCodeHash,
                                    phoneCode: code,
                                }))];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 9];
                        case 3:
                            error_3 = _b.sent();
                            if (!(error_3.errorMessage === 'SESSION_PASSWORD_NEEDED')) return [3 /*break*/, 7];
                            if (!password) {
                                return [2 /*return*/, { success: false, needPassword: true }];
                            }
                            return [4 /*yield*/, pending.client.invoke(new telegram_1.Api.account.GetPassword())];
                        case 4:
                            passwordResult = _b.sent();
                            return [4 /*yield*/, (0, Password_1.computeCheck)(passwordResult, password)];
                        case 5:
                            srp = _b.sent();
                            return [4 /*yield*/, pending.client.invoke(new telegram_1.Api.auth.CheckPassword({ password: srp }))];
                        case 6:
                            _b.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            if (error_3.errorMessage === 'PHONE_CODE_EXPIRED') {
                                this.pendingAuths.delete(monitorSessionId);
                                throw new Error('Kod muddati tugagan. Qaytadan kod yuboring.');
                            }
                            else {
                                throw error_3;
                            }
                            _b.label = 8;
                        case 8: return [3 /*break*/, 9];
                        case 9:
                            sessionString = pending.client.session.save();
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: monitorSessionId },
                                    data: {
                                        sessionString: sessionString,
                                        status: client_1.MonitorSessionStatus.ACTIVE,
                                    },
                                })];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            _b.trys.push([11, 13, , 14]);
                            return [4 /*yield*/, pending.client.disconnect()];
                        case 12:
                            _b.sent();
                            return [3 /*break*/, 14];
                        case 13:
                            _a = _b.sent();
                            return [3 /*break*/, 14];
                        case 14:
                            this.pendingAuths.delete(monitorSessionId);
                            // Connect in worker thread for listening
                            return [4 /*yield*/, this.connectSessionInWorker(monitorSessionId, sessionString)];
                        case 15:
                            // Connect in worker thread for listening
                            _b.sent();
                            _b.label = 16;
                        case 16:
                            _b.trys.push([16, 19, , 20]);
                            return [4 /*yield*/, this.sendToSession(monitorSessionId, 'getDialogs')];
                        case 17:
                            result = _b.sent();
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: monitorSessionId },
                                    data: { totalGroups: result.total },
                                })];
                        case 18:
                            _b.sent();
                            return [3 /*break*/, 20];
                        case 19:
                            error_4 = _b.sent();
                            this.logger.warn("Guruhlar sanashda xatolik: ".concat(error_4.message));
                            return [3 /*break*/, 20];
                        case 20:
                            this.logger.log("Monitor session muvaffaqiyatli ulandi: ".concat(monitorSessionId));
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        // ============================================================
        // MESSAGE HANDLING (runs in main thread, data from worker)
        // ============================================================
        /**
         * Handle pre-extracted message from worker thread
         * All gramJS calls already done in worker — here we do DB ops, filtering, parsing
         */
        MonitorService_1.prototype.handleWorkerNewMessage = function (monitorSessionId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var text, textLower, groupTelegramId, chatTitle, priorityGroups, normalizedGroupId, isPriority, psd, rules, _i, _a, keyword, userKeywords, keywordsToCheck, keywordMatch, _b, keywordsToCheck_1, keyword, parsed, now, PHONE_DEDUP_TTL, phoneDedupKey, existingPhone, owner, senderDedupKey, existingSender, textHash, textDedupKey, existingText, dedupSince, dbPhoneDup, userId, senderTelegramId, senderName, senderLastName, senderUsername, fullSenderName, groupTitle, filterResult, driverInfo, orderType, vehicleType, vehicleCapacity, _c, VEHICLE_TYPES_1, vt, capMatch, senderTodayAds, senderTotalAds, stats, sanitize, scope, additionalCargoPatterns, isAdditionalCargo, order, distStr, routeStr;
                var _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            // Track activity — har bir xabar kelganda yangilanadi
                            this.lastWorkerActivity.set(monitorSessionId, Date.now());
                            text = data.text;
                            textLower = text.toLowerCase();
                            groupTelegramId = data.groupTelegramId;
                            chatTitle = data.chatTitle || '';
                            return [4 /*yield*/, this.getPriorityGroups()];
                        case 1:
                            priorityGroups = _f.sent();
                            normalizedGroupId = this.normalizeGroupId(groupTelegramId);
                            isPriority = priorityGroups.has(normalizedGroupId);
                            if (isPriority && chatTitle) {
                                this.updatePriorityGroupTitle(groupTelegramId, chatTitle).catch(function () { });
                            }
                            // ===== 1. CARGO KEYWORD FILTER =====
                            this.diagCounters.total++;
                            // Per-session diag
                            if (!this.perSessionDiag.has(monitorSessionId)) {
                                this.perSessionDiag.set(monitorSessionId, { total: 0, created: 0, phoneDup: 0, noPhone: 0, noKeyword: 0 });
                            }
                            psd = this.perSessionDiag.get(monitorSessionId);
                            psd.total++;
                            return [4 /*yield*/, this.getFilterRules(monitorSessionId)];
                        case 2:
                            rules = _f.sent();
                            if ((rules === null || rules === void 0 ? void 0 : rules.enabled) && ((_d = rules.excludeKeywords) === null || _d === void 0 ? void 0 : _d.length)) {
                                for (_i = 0, _a = rules.excludeKeywords; _i < _a.length; _i++) {
                                    keyword = _a[_i];
                                    if (textLower.includes(keyword.toLowerCase())) {
                                        this.diagCounters.excludeKw++;
                                        return [2 /*return*/];
                                    }
                                }
                            }
                            if (!isPriority) {
                                userKeywords = ((rules === null || rules === void 0 ? void 0 : rules.enabled) && ((_e = rules.keywords) === null || _e === void 0 ? void 0 : _e.length)) ? rules.keywords : null;
                                keywordsToCheck = userKeywords || __spreadArray(__spreadArray([], dispatcher_keywords_1.CARGO_KEYWORDS, true), dispatcher_keywords_1.DRIVER_KEYWORDS, true);
                                keywordMatch = false;
                                for (_b = 0, keywordsToCheck_1 = keywordsToCheck; _b < keywordsToCheck_1.length; _b++) {
                                    keyword = keywordsToCheck_1[_b];
                                    if (textLower.includes(keyword.toLowerCase())) {
                                        keywordMatch = true;
                                        break;
                                    }
                                }
                                if (!keywordMatch) {
                                    this.diagCounters.noKeyword++;
                                    psd.noKeyword++;
                                    return [2 /*return*/];
                                }
                            }
                            parsed = this.parseCargoInfo(text);
                            if (!parsed.phone) {
                                this.diagCounters.noPhone++;
                                psd.noPhone++;
                                return [2 /*return*/];
                            }
                            // Keyword match'dan o'tgan xabar — messagesRead ni oshir (dedup bo'lsa ham)
                            this.incrementMessagesRead(monitorSessionId).catch(function () { });
                            return [4 /*yield*/, this.messageFilter.isBlockedSender(data.senderId || '', parsed.phone || '')];
                        case 3:
                            // ===== 2b. BLOKLANGAN SENDER — dedup'dan OLDIN tekshirish =====
                            // Agar sender bloklangan bo'lsa, dedup'ni kutmasdan darhol to'xtatamiz
                            if (_f.sent()) {
                                this.diagCounters.blocked++;
                                return [2 /*return*/];
                            }
                            now = Date.now();
                            PHONE_DEDUP_TTL = 4 * 60 * 60000;
                            if (parsed.phone) {
                                phoneDedupKey = "phone_".concat(parsed.phone);
                                existingPhone = this.recentOrders.get(phoneDedupKey);
                                if (existingPhone && now - existingPhone < PHONE_DEDUP_TTL) {
                                    this.diagCounters.phoneDup++;
                                    psd.phoneDup++;
                                    owner = this.phoneDedupOwner.get(parsed.phone);
                                    if (owner === monitorSessionId) {
                                        if (!psd['selfDup'])
                                            psd['selfDup'] = 0;
                                        psd['selfDup']++;
                                    }
                                    else {
                                        if (!psd['otherDup'])
                                            psd['otherDup'] = 0;
                                        psd['otherDup']++;
                                    }
                                    return [2 /*return*/];
                                }
                                this.recentOrders.set(phoneDedupKey, now);
                                this.phoneDedupOwner.set(parsed.phone, monitorSessionId);
                            }
                            // 3b. Sender bo'yicha GLOBAL dedup — 1 soat (bir odam 1 soatda faqat 1 order)
                            if (data.senderId) {
                                senderDedupKey = "sender_".concat(data.senderId);
                                existingSender = this.recentOrders.get(senderDedupKey);
                                if (existingSender && now - existingSender < 60 * 60000) {
                                    this.diagCounters.senderDup++;
                                    return [2 /*return*/];
                                }
                                this.recentOrders.set(senderDedupKey, now);
                            }
                            textHash = text.trim().substring(0, 100).toLowerCase().replace(/\s+/g, ' ');
                            textDedupKey = "text_".concat(this.simpleHash(textHash));
                            existingText = this.recentOrders.get(textDedupKey);
                            if (existingText && now - existingText < this.DEDUP_TTL) {
                                this.diagCounters.textDup++;
                                return [2 /*return*/];
                            }
                            this.recentOrders.set(textDedupKey, now);
                            if (!(parsed.phone && this.recentOrders.size < 100)) return [3 /*break*/, 5];
                            dedupSince = new Date(now - 4 * 60 * 60000);
                            return [4 /*yield*/, this.prisma.order.findFirst({
                                    where: {
                                        phone: parsed.phone,
                                        createdAt: { gte: dedupSince },
                                    },
                                    select: { id: true },
                                })];
                        case 4:
                            dbPhoneDup = _f.sent();
                            if (dbPhoneDup) {
                                this.recentOrders.set("phone_".concat(parsed.phone), now);
                                this.diagCounters.dbDup++;
                                return [2 /*return*/];
                            }
                            _f.label = 5;
                        case 5: return [4 /*yield*/, this.getCachedSessionUserId(monitorSessionId)];
                        case 6:
                            userId = _f.sent();
                            if (!userId)
                                return [2 /*return*/];
                            senderTelegramId = data.senderId || undefined;
                            senderName = data.senderFirstName;
                            senderLastName = data.senderLastName;
                            senderUsername = data.senderUsername;
                            fullSenderName = [senderName, senderLastName].filter(Boolean).join(' ');
                            groupTitle = chatTitle || 'Noma\'lum guruh';
                            return [4 /*yield*/, this.messageFilter.filterMessage({
                                    messageText: text,
                                    groupTitle: groupTitle,
                                    groupTelegramId: groupTelegramId,
                                    messageId: data.messageId,
                                    senderAccessHash: data.senderAccessHash,
                                    sender: {
                                        telegramId: senderTelegramId || '',
                                        firstName: senderName,
                                        lastName: senderLastName,
                                        username: senderUsername,
                                    },
                                    phone: parsed.phone,
                                    monitorSessionId: monitorSessionId,
                                    userId: userId,
                                })];
                        case 7:
                            filterResult = _f.sent();
                            if (!filterResult.blocked) return [3 /*break*/, 9];
                            this.diagCounters.blocked++;
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: monitorSessionId },
                                    data: {
                                        messagesRead: { increment: 1 },
                                        lastMessageAt: new Date(),
                                    },
                                })];
                        case 8:
                            _f.sent();
                            return [2 /*return*/];
                        case 9:
                            driverInfo = this.detectDriverAd(textLower);
                            orderType = driverInfo.isDriver ? client_1.OrderType.DRIVER : client_1.OrderType.CARGO;
                            vehicleType = driverInfo.vehicleType;
                            vehicleCapacity = driverInfo.capacity;
                            if (!vehicleType) {
                                for (_c = 0, VEHICLE_TYPES_1 = dispatcher_keywords_1.VEHICLE_TYPES; _c < VEHICLE_TYPES_1.length; _c++) {
                                    vt = VEHICLE_TYPES_1[_c];
                                    if (vt.pattern.test(textLower)) {
                                        vehicleType = vt.type;
                                        break;
                                    }
                                }
                            }
                            if (!vehicleCapacity) {
                                capMatch = textLower.match(/(\d+[\d.,]*)\s*(?:tonna?(?:lik|li)?|tunna?(?:lik|li)?|tonn?|tn|kub(?:a?lik?|a)?|kg|klo|тонн?(?:а(?:ли[кк])?)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i);
                                if (capMatch)
                                    vehicleCapacity = capMatch[0].trim();
                            }
                            senderTodayAds = 0;
                            senderTotalAds = 0;
                            if (!senderTelegramId) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.trackSenderStats(senderTelegramId)];
                        case 10:
                            stats = _f.sent();
                            senderTodayAds = stats.today;
                            senderTotalAds = stats.total;
                            _f.label = 11;
                        case 11:
                            sanitize = function (s) { return s
                                .replace(/\x00/g, '')
                                .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                                .replace(/\\x[0-9a-fA-F]{0,2}/g, '')
                                .replace(/\\/g, '/'); };
                            scope = (0, dispatcher_keywords_1.classifyOrderScope)(parsed.cargoFrom, parsed.cargoTo, text);
                            additionalCargoPatterns = /qo['']?shimcha\s*yuk|dogru[sz]|dagruz|дополнит|догруз|do['']?gruz|pustoy|пустой/i;
                            isAdditionalCargo = additionalCargoPatterns.test(text);
                            this.diagCounters.created++;
                            psd.created++;
                            return [4 /*yield*/, this.prisma.order.create({
                                    data: {
                                        userId: userId,
                                        messageText: sanitize(text),
                                        groupTitle: sanitize(groupTitle),
                                        groupTelegramId: groupTelegramId,
                                        senderName: fullSenderName ? sanitize(fullSenderName) : undefined,
                                        senderUsername: senderUsername ? sanitize(senderUsername) : undefined,
                                        senderTelegramId: senderTelegramId,
                                        messageDate: new Date(data.date * 1000),
                                        cargoFrom: parsed.cargoFrom,
                                        cargoTo: parsed.cargoTo,
                                        cargoType: parsed.cargoType,
                                        cargoWeight: parsed.cargoWeight,
                                        price: parsed.price,
                                        phone: parsed.phone,
                                        distance: parsed.distance,
                                        type: orderType,
                                        vehicleType: vehicleType,
                                        vehicleCapacity: vehicleCapacity,
                                        senderTodayAds: senderTodayAds,
                                        senderTotalAds: senderTotalAds,
                                        status: client_1.OrderStatus.NEW,
                                        monitorSessionId: monitorSessionId,
                                        scope: scope,
                                        isAdditionalCargo: isAdditionalCargo,
                                    },
                                })];
                        case 12:
                            order = _f.sent();
                            // Update stats
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: monitorSessionId },
                                    data: {
                                        ordersFound: { increment: 1 },
                                        messagesRead: { increment: 1 },
                                        lastMessageAt: new Date(),
                                    },
                                })];
                        case 13:
                            // Update stats
                            _f.sent();
                            // Emit to dashboard via WebSocket + FCM push (offline userlarga)
                            this.gateway.emitNewOrderWithFcm(userId, order);
                            // Auto-SMS: yangi order topilganda avtomatik SMS yuborish
                            this.smsService.onNewOrder({
                                phone: parsed.phone,
                                type: orderType,
                                cargoFrom: parsed.cargoFrom,
                                cargoTo: parsed.cargoTo,
                                groupTitle: groupTitle,
                            }).catch(function () { });
                            // Auto-TG SMS: Telegram DM orqali habar yuborish
                            this.telegramSmsService.onNewOrder({
                                senderTelegramId: senderTelegramId,
                                senderUsername: senderUsername || null,
                                type: orderType,
                                cargoFrom: parsed.cargoFrom,
                                cargoTo: parsed.cargoTo,
                                senderName: fullSenderName || senderUsername || null,
                                phone: parsed.phone,
                                monitorSessionId: monitorSessionId,
                                sourceGroupId: data.groupTelegramId,
                                sourceMessageId: data.messageId,
                                senderAccessHash: data.senderAccessHash || undefined,
                            }).catch(function () { });
                            distStr = parsed.distance ? " | ".concat(parsed.distance, " km") : '';
                            routeStr = parsed.cargoFrom && parsed.cargoTo
                                ? " | ".concat(parsed.cargoFrom, " \u2192 ").concat(parsed.cargoTo)
                                : '';
                            this.logger.log("Yangi ".concat(orderType, ": ").concat(parsed.phone).concat(routeStr).concat(distStr, " | ").concat(groupTitle));
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // PARSING & DETECTION (pure computation, no gramJS)
        // ============================================================
        /**
         * Haydovchi e'lonini aniqlash
         */
        MonitorService_1.prototype.detectDriverAd = function (textLower) {
            // Yangi qatorlarni bo'shliqqa almashtirish — "yuk bolsa\nolamiz" → "yuk bolsa olamiz"
            textLower = textLower.replace(/\n+/g, ' ').replace(/\s+/g, ' ')
                // Combining diacritical marks — "бу́лса" → "булса", "бу́ш" → "буш"
                .replace(/[\u0300-\u036F]/g, '')
                // Math Monospace/Bold/Sans Unicode → oddiy ASCII
                .replace(/[\u{1D400}-\u{1D7FF}]/gu, function (ch) {
                var cp = ch.codePointAt(0);
                if (cp >= 0x1D41A && cp <= 0x1D433)
                    return String.fromCharCode(cp - 0x1D41A + 97);
                if (cp >= 0x1D44E && cp <= 0x1D467)
                    return String.fromCharCode(cp - 0x1D44E + 97);
                if (cp >= 0x1D482 && cp <= 0x1D49B)
                    return String.fromCharCode(cp - 0x1D482 + 97);
                if (cp >= 0x1D5BA && cp <= 0x1D5D3)
                    return String.fromCharCode(cp - 0x1D5BA + 97);
                if (cp >= 0x1D5EE && cp <= 0x1D607)
                    return String.fromCharCode(cp - 0x1D5EE + 97);
                if (cp >= 0x1D68A && cp <= 0x1D6A3)
                    return String.fromCharCode(cp - 0x1D68A + 97);
                return ch;
            });
            var vehicleType;
            for (var _i = 0, VEHICLE_TYPES_2 = dispatcher_keywords_1.VEHICLE_TYPES; _i < VEHICLE_TYPES_2.length; _i++) {
                var vt = VEHICLE_TYPES_2[_i];
                if (vt.pattern.test(textLower)) {
                    vehicleType = vt.type;
                    break;
                }
            }
            var driverKeywordMatch = false;
            for (var _a = 0, DRIVER_KEYWORDS_1 = dispatcher_keywords_1.DRIVER_KEYWORDS; _a < DRIVER_KEYWORDS_1.length; _a++) {
                var keyword = DRIVER_KEYWORDS_1[_a];
                if (textLower.includes(keyword)) {
                    driverKeywordMatch = true;
                    break;
                }
            }
            var strongDriverPatterns = [
                // === LATIN O'ZBEK ===
                // Mashina/transport taklif
                'mashina bor', 'moshina bor', 'mashina bo\'sh', 'mashina bosh',
                'moshina bo\'sh', 'moshina bosh', 'mashina tayyor', 'moshina tayyor',
                'mashina chiqyapti', 'mashina ketyapti', 'mashina chiqadi', 'mashina ketadi',
                'mashina chiqmoqda', 'mashinam bor', 'moshinam bor',
                'transport bor', 'transportim bor', 'transport tayyor',
                // Fura taklif
                'fura bor', 'fura bo\'sh', 'fura bosh', 'fura tayyor',
                'fura chiqyapti', 'fura ketyapti', 'fura chiqadi', 'furam bor',
                // Yuk olish — asosiy
                'yuk olaman', 'yuk olamiz', 'yuk olamz', 'yuk oladi',
                'yuk olib ketaman', 'yuk olib ketamiz', 'yuk olib boraman',
                'yuk qabul qilaman', 'yuk qabul qilamiz',
                'yuk tashiyman', 'yuk tashiymiz', 'yuk tashiydi',
                'yuk tashib beraman', 'yuk tashib beramiz',
                'yuk eltaman', 'yuk eltamiz', 'yuk olib kelaman',
                // Yuk bolsa — barcha variantlar
                'yuk bolsa olamiz', 'yuk bolsa olaman', 'yuk bolsa olamz',
                'yuk bo\'lsa olamiz', 'yuk bo\'lsa olaman',
                'yuklar bolsa', 'yuklar bo\'lsa', 'yuklar bolsa olamiz',
                'yuk bersa olamiz', 'yuk bersa olaman', 'yuklar bersa',
                'yuk bolsa tashiymiz', 'yuk bolsa tashiyman',
                'yuk bolsa chiqamiz', 'yuk bolsa chiqaman',
                // Yuk kerak / izlash
                'yuk kerak', 'yuklar kerak', 'yuk izlayman', 'yuk izlayapmiz',
                'yuk qidiraman', 'yuk qidiryapmiz', 'yuk qidiramiz',
                'yukka chiqaman', 'yukka chiqamiz', 'yukka chiqmoqchiman',
                'yukka tayyormiz', 'yukka tayyorman', 'yukka tayyor',
                'yukka ketaman', 'yukka ketamiz',
                // Haydovchi / shofer
                'haydovchiman', 'haydovchimiz', 'shoferman', 'shofermiz',
                'men haydovchi', 'biz haydovchi',
                // Bo'sh transport
                'bo\'sh mashina', 'bosh mashina', 'bo\'sh transport', 'bosh transport',
                'bo\'sh fura', 'bosh fura', 'bo\'sh isuzu', 'bosh isuzu',
                'bo\'sh kamaz', 'bosh kamaz', 'bo\'sh tent', 'bosh tent',
                // Ortish / yuklash tayyor
                'ortishga tayyor', 'yuklashga tayyor', 'yuklay olamiz', 'yuklay olaman',
                'ortish mumkin', 'yuklash mumkin',
                // Qaytish / ketish
                'bosh qaytaman', 'bo\'sh qaytaman', 'bosh qaytamiz', 'bo\'sh qaytamiz',
                'bosh ketaman', 'bo\'sh ketaman', 'bosh ketamiz', 'bo\'sh ketamiz',
                'bosh boraman', 'bo\'sh boraman', 'bosh boramiz', 'bo\'sh boramiz',
                'boshiga ketaman', 'bo\'shiga ketaman',
                // === KIRILL O'ZBEK ===
                // Mashina/transport
                'машина бор', 'мошина бор', 'машина бўш', 'мошина бўш',
                'машина буш', 'мошина буш', 'машина бош', 'мошина бош',
                'машина тайёр', 'мошина тайёр', 'машинам бор', 'мошинам бор',
                'машина чиқяпти', 'машина кетяпти', 'машина чиқади', 'машина кетади',
                'транспорт бор', 'транспортим бор', 'транспорт тайёр',
                // Фура
                'фура бор', 'фура бўш', 'фура буш', 'фура бош', 'фура тайёр',
                'фура чиқяпти', 'фура кетяпти', 'фура чиқади', 'фурам бор',
                // Юк олиш — асосий
                'юк оламан', 'юк оламиз', 'юк олади', 'юк оламз',
                'юк олиб кетаман', 'юк олиб кетамиз', 'юк олиб бораман',
                'юк қабул қиламан', 'юк қабул қиламиз',
                'юк ташийман', 'юк ташиймиз', 'юк ташийди',
                'юк ташиб бераман', 'юк ташиб берамиз',
                'юк элтаман', 'юк элтамиз', 'юк олиб келаман',
                // Юк бўлса / болса / булса — барча вариантлар
                'юк бўлса оламиз', 'юк бўлса оламан', 'юклар бўлса оламиз', 'юклар бўлса оламан',
                'юк булса оламиз', 'юк булса олам', 'юклар булса оламиз', 'юклар булса',
                'юк болса оламиз', 'юк болса оламан', 'юклар болса оламиз', 'юклар болса',
                'юк бўлса ташиймиз', 'юк болса ташиймиз', 'юк булса ташиймиз',
                'юк бўлса чиқамиз', 'юк болса чиқамиз', 'юк булса чиқамиз',
                'юк берса оламиз', 'юк берса оламан', 'юклар берса',
                'юк берса ташиймиз', 'юклар берса оламиз',
                // Юк керак / излаш
                'юк керак', 'юклар керак', 'юк излайман', 'юк излаяпмиз',
                'юк қидираман', 'юк қидиряпмиз', 'юк қидирамиз',
                'юкка чиқаман', 'юкка чиқамиз', 'юкка чиқмоқчиман',
                'юкка тайёрмиз', 'юкка тайёрман', 'юкка тайёр',
                'юкка кетаман', 'юкка кетамиз',
                // Ҳайдовчи / шофер
                'ҳайдовчиман', 'ҳайдовчимиз', 'шоферман', 'шофермиз',
                'мен ҳайдовчи', 'биз ҳайдовчи',
                'хайдовчиман', 'хайдовчимиз',
                // Бўш транспорт
                'бўш машина', 'бўш фура', 'бўш транспорт',
                'буш машина', 'буш фура', 'бош машина', 'бош фура',
                'бўш исузу', 'бўш камаз', 'бўш тент',
                // Ортиш / юклаш тайёр
                'ортишга тайёр', 'юклашга тайёр', 'юклай оламиз', 'юклай оламан',
                'ортиш мумкин', 'юклаш мумкин',
                // Қайтиш / кетиш
                'бўш қайтаман', 'бўш қайтамиз', 'буш қайтаман', 'буш қайтамиз',
                'бош қайтаман', 'бош қайтамиз', 'бош кетаман', 'бош кетамиз',
                'бўш кетаман', 'бўш кетамиз', 'бўш бораман', 'бўш борамиз',
                'бошига кетаман', 'бўшига кетаман',
                // === РУССКИЙ ===
                // Машина/транспорт
                'машина есть', 'машина свободн', 'машина пустая', 'машина готова',
                'фура есть', 'фура свободн', 'фура пустая', 'фура готова',
                'газель есть', 'газель свободн', 'газель пустая', 'газель готова',
                'камаз есть', 'камаз свободен', 'камаз пустой', 'камаз готов',
                'свободная машина', 'пустая машина', 'свободная фура', 'пустая фура',
                // Груз взять / искать
                'возьму груз', 'возьмем груз', 'возьмём груз',
                'беру груз', 'берем груз', 'берём груз',
                'заберу груз', 'заберем груз',
                'ищу груз', 'ищем груз', 'нужен груз', 'нужны грузы',
                'ищу загрузку', 'ищем загрузку', 'нужна загрузка',
                'ищу попутный', 'попутный груз',
                'готов к погрузке', 'готовы к погрузке',
                'готов к загрузке', 'готовы к загрузке',
                'подам машину', 'подам фуру', 'подадим машину',
                // Водитель
                'я водитель', 'я шофер', 'я шофёр',
                'мы водители', 'мы шоферы',
                // Еду — маршрут
                'еду пустой', 'еду пустая', 'еду порожний', 'еду порожняком',
                'едем пустые', 'едем порожняком',
                'иду пустой', 'идем пустые', 'идём пустые',
                'машина идет', 'машина идёт', 'машина едет',
                'фура идет', 'фура идёт', 'фура едет',
                'грузы возьмем', 'грузы возьму', 'грузы беру', 'грузы берем',
            ];
            var strongMatch = false;
            for (var _b = 0, strongDriverPatterns_1 = strongDriverPatterns; _b < strongDriverPatterns_1.length; _b++) {
                var kw = strongDriverPatterns_1[_b];
                if (textLower.includes(kw)) {
                    strongMatch = true;
                    break;
                }
            }
            var isDriver = strongMatch || (driverKeywordMatch && !!vehicleType);
            if (!isDriver)
                return { isDriver: false };
            var capacity;
            var capMatch = textLower.match(/(\d+[\d.,]*)\s*(?:tonna?(?:lik|li)?|tunna?(?:lik|li)?|tonn?|tn|kub(?:a?lik?|a)?|kg|klo|тонн?(?:а(?:ли[кк])?)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i);
            if (capMatch) {
                capacity = capMatch[0].trim();
            }
            return { isDriver: true, vehicleType: vehicleType, capacity: capacity };
        };
        /**
         * Parse cargo info from message text
         */
        MonitorService_1.prototype.parseCargoInfo = function (text) {
            var result = {};
            var normalizedText = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060\u02BD\u02BE\u02C8\u02CA]/g, "'");
            // ===== TELEFON RAQAM =====
            var phonePatterns = [
                /\+?998[\s.-]?\(?(\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})/,
                /\b(\d{2})[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})\b/,
            ];
            for (var _i = 0, phonePatterns_1 = phonePatterns; _i < phonePatterns_1.length; _i++) {
                var pattern = phonePatterns_1[_i];
                var match = text.match(pattern);
                if (match) {
                    var digits = match[0].replace(/[\s.()\-+]/g, '');
                    var normalized = void 0;
                    if (digits.length === 9 && /^[0-9]/.test(digits)) {
                        normalized = '998' + digits;
                    }
                    else if (digits.length >= 12) {
                        normalized = digits.slice(-12);
                    }
                    else if (digits.length >= 9) {
                        normalized = '998' + digits.slice(-9);
                    }
                    else {
                        continue;
                    }
                    if (normalized.startsWith('998') && normalized.length === 12) {
                        result.phone = '+' + normalized;
                    }
                    break;
                }
            }
            // ===== OG'IRLIK (avval — narxdan oldin, chunki "25 tonna" narx emas) =====
            var weightMatch = text.match(/(\d+[\d.,]*)\s*(?:tonna?(?:lik|li|gacha)?|tunna?(?:lik|li)?|tonn?(?:alik|ali|o)?|tn|kub(?:a?lik?|a(?:li[кк])?)?|kg|klo|тонн?(?:а(?:ли[кк]|гача)?|о)?|тунн?(?:а(?:ли[кк])?)?|куб(?:а?ли[кк]?|а)?|кг|тн|т(?![а-яА-ЯўқғҳёЎҚҒҲЁa-zA-Z])|t(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ]))/i);
            if (weightMatch) {
                // Standardized format: "25 t", "150 kg", "22 kub"
                var numStr = weightMatch[1].replace(/\s/g, '').replace(',', '.');
                var num = parseFloat(numStr);
                var unitPart = weightMatch[0].substring(weightMatch[1].length).trim().toLowerCase();
                if (!isNaN(num)) {
                    if (/kg|кг|klo/i.test(unitPart)) {
                        result.cargoWeight = "".concat(num, " kg");
                    }
                    else if (/kub|куб/i.test(unitPart)) {
                        result.cargoWeight = "".concat(num, " kub");
                    }
                    else {
                        result.cargoWeight = "".concat(num, " t");
                    }
                }
            }
            // ===== NARX =====
            // Telefon raqamni narx deb olmaslik uchun: narx so'zdan keyin keladi yoki valyuta belgisi bor
            // Narx telefon raqamdan farqlanadi: 9 raqamdan kam YOKI valyuta so'zi/belgisi bor
            var pricePatterns = [
                // $1500, $ 1500
                { re: /\$\s*(\d[\d\s.,]*\d|\d+)/i, type: 'usd' },
                // 1500$, 6000 $
                { re: /(\d[\d\s.,]*\d|\d+)\s*\$/i, type: 'usd' },
                // 1500 dollar, 6000 доллар
                { re: /(\d[\d\s.,]*\d|\d+)\s*(?:dollar|доллар|долл)/i, type: 'usd' },
                // 5 mln, 3млн, 1.5 million
                { re: /(\d[\d.,]*)\s*(?:mln|млн|million|миллион)/i, type: 'sum' },
                // 500 ming, 800 минг
                { re: /(\d[\d\s.,]*\d|\d+)\s*(?:ming|минг)/i, type: 'sum' },
                // 1 600 000 so'm, 500000 сум
                { re: /(\d[\d\s.,]*\d|\d+)\s*(?:so'm|som|sum|сом|сум|сўм|сумгач)/i, type: 'sum' },
                // Narxi: ..., Фрахт: ..., yo'l haqi ...
                { re: /(?:narx[iu]?|фрахт|fraxt|yo'l\s*(?:haqi|haqqi)|йўл\s*кир[оа])\s*[:=]?\s*(\d[\d\s.,]*\d|\d+)\b/i, type: 'sum' },
            ];
            for (var _a = 0, pricePatterns_1 = pricePatterns; _a < pricePatterns_1.length; _a++) {
                var _b = pricePatterns_1[_a], re = _b.re, type = _b.type;
                var pm = text.match(re);
                if (pm) {
                    var rawNum = (pm[1] || pm[0].replace(/[$\s]/g, '')).replace(/\s/g, '').replace(',', '.');
                    var num = parseFloat(rawNum);
                    if (isNaN(num) || num <= 0)
                        continue;
                    // Telefon raqam filtr: 9+ raqamli son narx emas (998901234567 kabi)
                    var digitCount = rawNum.replace(/[^0-9]/g, '').length;
                    if (digitCount >= 9 && type !== 'usd')
                        continue;
                    // Format
                    if (type === 'usd') {
                        result.price = "".concat(num, " $");
                    }
                    else {
                        // mln → so'mga aylantirish
                        if (/mln|млн|million|миллион/i.test(pm[0])) {
                            result.price = "".concat(num, " mln so'm");
                        }
                        else if (/ming|минг/i.test(pm[0])) {
                            var full = num * 1000;
                            if (full >= 1000000) {
                                result.price = "".concat(full / 1000000, " mln so'm");
                            }
                            else {
                                result.price = "".concat(num, " ming so'm");
                            }
                        }
                        else {
                            // Raw number — formatlab chiqarish
                            if (num >= 1000000) {
                                result.price = "".concat((num / 1000000).toFixed(1).replace('.0', ''), " mln so'm");
                            }
                            else if (num >= 1000) {
                                result.price = "".concat((num / 1000).toFixed(0), " ming so'm");
                            }
                            else {
                                result.price = "".concat(num, " so'm");
                            }
                        }
                    }
                    break;
                }
            }
            // ===== YO'NALISH (MARSHRUT) =====
            var routeMatch = normalizedText.match(/([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})\s*[-–—→➡►>⏩]\s*([A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+(?:\s+[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ']+){0,2})/);
            if (routeMatch) {
                result.cargoFrom = routeMatch[1].trim();
                result.cargoTo = routeMatch[2].trim();
            }
            var WBE = '(?![a-zA-Zа-яА-ЯўқғҳёЎҚҒҲЁ])';
            var LETTER = '[A-ZА-ЯЎҚҒҲa-zа-яўқғҳ\']';
            if (!result.cargoFrom) {
                var danGaMatch = normalizedText.match(new RegExp("(".concat(LETTER, "+(?:\\s+").concat(LETTER, "+){0,1})\\s*(?:dan|\u0434\u0430\u043D)\\s+[\\s\\S]*?(").concat(LETTER, "+(?:\\s+").concat(LETTER, "+){0,1})\\s*(?:ga|\u0433\u0430|ge|\u0433\u0435|qa)").concat(WBE), 'i'));
                if (danGaMatch) {
                    result.cargoFrom = danGaMatch[1].trim();
                    result.cargoTo = danGaMatch[2].trim();
                }
            }
            if (!result.cargoFrom) {
                var attachedMatch = normalizedText.match(new RegExp("(".concat(LETTER, "{3,})(?:\u0434\u0430\u043D|\u0434\u0438\u043D|\u0434\u0435\u043D|dan|din|den)[\\s\\S]+?(").concat(LETTER, "{3,})(?:\u0433\u0430|\u0433\u0435|\u0433\u043E|\u0433\u0430\u0447\u0430|qa|\u043A\u0430|ga|ge|go|gacha)").concat(WBE), 'i'));
                if (attachedMatch) {
                    result.cargoFrom = attachedMatch[1].trim();
                    result.cargoTo = attachedMatch[2].trim();
                }
            }
            if (!result.cargoFrom) {
                var fromOnlyMatch = normalizedText.match(new RegExp("(".concat(LETTER, "{3,})(?:\u0434\u0430\u043D|\u0434\u0438\u043D|\u0434\u0435\u043D|dan|din|den)").concat(WBE), 'i'));
                if (fromOnlyMatch)
                    result.cargoFrom = fromOnlyMatch[1].trim();
            }
            // toOnlyMatch MUSTAQIL — cargoFrom topilsa ham cargoTo izlanishi kerak
            if (!result.cargoTo) {
                var toOnlyMatch = normalizedText.match(new RegExp("(".concat(LETTER, "{3,})(?:\u0433\u0430|\u0433\u0435|\u0433\u043E|\u0433\u0430\u0447\u0430|qa|\u043A\u0430|ga|ge|go|gacha)").concat(WBE), 'i'));
                if (toOnlyMatch)
                    result.cargoTo = toOnlyMatch[1].trim();
            }
            if (result.cargoFrom) {
                var cityFrom = (0, city_distances_1.findCity)(result.cargoFrom);
                result.cargoFrom = cityFrom ? cityFrom.name : undefined;
            }
            if (result.cargoTo) {
                var cityTo = (0, city_distances_1.findCity)(result.cargoTo);
                result.cargoTo = cityTo ? cityTo.name : undefined;
            }
            // FALLBACK: findCitiesInText
            if (!result.cargoFrom || !result.cargoTo) {
                var citiesInText = (0, city_distances_1.findCitiesInText)(normalizedText);
                if (citiesInText.length >= 2) {
                    if (!result.cargoFrom)
                        result.cargoFrom = citiesInText[0].name;
                    if (!result.cargoTo)
                        result.cargoTo = citiesInText[1].name;
                }
                else if (citiesInText.length === 1) {
                    if (!result.cargoFrom)
                        result.cargoFrom = citiesInText[0].name;
                }
            }
            // Masofa hisoblash
            if (result.cargoFrom && result.cargoTo) {
                var dist = (0, city_distances_1.calculateDistance)(result.cargoFrom, result.cargoTo);
                if (dist !== null) {
                    result.distance = dist;
                }
            }
            // ===== YUK TURI =====
            var typePatterns = [
                { pattern: /(?:bug'doy|пшениц|g'alla)/i, type: "Bug'doy" },
                { pattern: /(?:paxta|хлопок|cotton)/i, type: 'Paxta' },
                { pattern: /(?:ko'mir|уголь|coal)/i, type: "Ko'mir" },
                { pattern: /(?:sement|цемент|cement)/i, type: 'Sement' },
                { pattern: /(?:temir|металл|metal|armat)/i, type: 'Temir' },
                { pattern: /(?:meva|фрукт|fruit|sabzavot|овощ)/i, type: 'Meva-sabzavot' },
                { pattern: /(?:un\b|мука|flour)/i, type: 'Un' },
                { pattern: /(?:yog'|масл|oil)/i, type: "Yog'" },
                { pattern: /(?:qurilish|строй|construction)/i, type: 'Qurilish materiallari' },
                { pattern: /(?:shifer|шифер)/i, type: 'Shifer' },
                { pattern: /(?:kirpich|кирпич)/i, type: 'G\'isht' },
                { pattern: /(?:qum\b|pesok|песок)/i, type: 'Qum' },
                { pattern: /(?:shag'al|щебень|sheben)/i, type: "Shag'al" },
                { pattern: /(?:don\b|зерно|grain)/i, type: 'Don' },
                { pattern: /(?:guruch|рис|rice)/i, type: 'Guruch' },
                { pattern: /(?:kartoshka|картошка|kartofil)/i, type: 'Kartoshka' },
                { pattern: /(?:piyoz|лук|onion)/i, type: 'Piyoz' },
            ];
            for (var _c = 0, typePatterns_1 = typePatterns; _c < typePatterns_1.length; _c++) {
                var _d = typePatterns_1[_c], pattern = _d.pattern, type = _d.type;
                if (pattern.test(text)) {
                    result.cargoType = type;
                    break;
                }
            }
            return result;
        };
        // ============================================================
        // UTILITY & STATS (DB only, no gramJS)
        // ============================================================
        /**
         * Sender statistikasi — DB + in-memory cache
         */
        MonitorService_1.prototype.trackSenderStats = function (senderTelegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var todayStr, existing, todayStart, totalCount, stats, _a, stats;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            todayStr = new Date().toISOString().slice(0, 10);
                            existing = this.senderStats.get(senderTelegramId);
                            if (existing) {
                                if (existing.date === todayStr) {
                                    existing.today++;
                                }
                                else {
                                    existing.today = 1;
                                    existing.date = todayStr;
                                }
                                existing.total++;
                                return [2 /*return*/, { today: existing.today, total: existing.total }];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            todayStart = new Date(todayStr + 'T00:00:00.000Z');
                            return [4 /*yield*/, this.prisma.order.count({
                                    where: { senderTelegramId: senderTelegramId },
                                })];
                        case 2:
                            totalCount = _b.sent();
                            stats = { today: 1, total: totalCount + 1, date: todayStr };
                            this.senderStats.set(senderTelegramId, stats);
                            return [2 /*return*/, { today: stats.today, total: stats.total }];
                        case 3:
                            _a = _b.sent();
                            stats = { today: 1, total: 1, date: todayStr };
                            this.senderStats.set(senderTelegramId, stats);
                            return [2 /*return*/, { today: 1, total: 1 }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * MonitorSession userId — cached
         */
        MonitorService_1.prototype.getCachedSessionUserId = function (monitorSessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var now, cached, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            cached = this.sessionCache.get(monitorSessionId);
                            if (cached && now - cached.cachedAt < this.SESSION_CACHE_TTL) {
                                return [2 /*return*/, cached.userId];
                            }
                            return [4 /*yield*/, this.prisma.monitorSession.findUnique({
                                    where: { id: monitorSessionId },
                                    select: { userId: true },
                                })];
                        case 1:
                            session = _a.sent();
                            if (!session)
                                return [2 /*return*/, null];
                            this.sessionCache.set(monitorSessionId, { userId: session.userId, cachedAt: now });
                            return [2 /*return*/, session.userId];
                    }
                });
            });
        };
        MonitorService_1.prototype.simpleHash = function (str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return hash.toString(36);
        };
        /**
         * messagesRead ni oshirish — dedup bo'lgan xabarlar uchun ham
         */
        MonitorService_1.prototype.incrementMessagesRead = function (monitorSessionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.monitorSession.update({
                                where: { id: monitorSessionId },
                                data: {
                                    messagesRead: { increment: 1 },
                                    lastMessageAt: new Date(),
                                },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // HEALTH CHECK — o'lik sessionlarni aniqlash va qayta ulash
        // ============================================================
        /**
         * Har 3 minutda:
         * 1. Worker da har session connected mi tekshirish
         * 2. Uzoq vaqt xabar olmagan sessionlarni reconnect qilish
         * 3. DB da ACTIVE lekin worker da yo'q sessionlarni ulash
         */
        MonitorService_1.prototype.performHealthCheck = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, _i, _a, sessionId, child, health, _b, activeSessions, _c, activeSessions_1, session, err_2;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (this.connectedSessions.size === 0)
                                return [2 /*return*/];
                            now = Date.now();
                            _i = 0, _a = __spreadArray([], this.connectedSessions, true);
                            _d.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 10];
                            sessionId = _a[_i];
                            child = this.childProcesses.get(sessionId);
                            if (!!child) return [3 /*break*/, 3];
                            this.logger.warn("Health: [".concat(sessionId.slice(-8), "] process yo'q \u2014 reconnect"));
                            return [4 /*yield*/, this.reconnectSession(sessionId)];
                        case 2:
                            _d.sent();
                            return [3 /*break*/, 9];
                        case 3:
                            _d.trys.push([3, 7, , 9]);
                            return [4 /*yield*/, this.sendToSession(sessionId, 'healthCheck')];
                        case 4:
                            health = _d.sent();
                            if (!!health.connected) return [3 /*break*/, 6];
                            this.logger.warn("Health: [".concat(sessionId.slice(-8), "] disconnected \u2014 reconnect"));
                            return [4 /*yield*/, this.reconnectSession(sessionId)];
                        case 5:
                            _d.sent();
                            _d.label = 6;
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            _b = _d.sent();
                            this.logger.warn("Health: [".concat(sessionId.slice(-8), "] ping failed \u2014 reconnect"));
                            return [4 /*yield*/, this.reconnectSession(sessionId)];
                        case 8:
                            _d.sent();
                            return [3 /*break*/, 9];
                        case 9:
                            _i++;
                            return [3 /*break*/, 1];
                        case 10: return [4 /*yield*/, this.prisma.monitorSession.findMany({
                                where: { status: client_1.MonitorSessionStatus.ACTIVE },
                                select: { id: true, sessionString: true },
                            })];
                        case 11:
                            activeSessions = _d.sent();
                            _c = 0, activeSessions_1 = activeSessions;
                            _d.label = 12;
                        case 12:
                            if (!(_c < activeSessions_1.length)) return [3 /*break*/, 17];
                            session = activeSessions_1[_c];
                            if (!(!this.connectedSessions.has(session.id) && session.sessionString)) return [3 /*break*/, 16];
                            this.logger.log("Health: [".concat(session.id.slice(-8), "] ACTIVE lekin ulanmagan \u2014 ulanadi"));
                            _d.label = 13;
                        case 13:
                            _d.trys.push([13, 15, , 16]);
                            return [4 /*yield*/, this.connectSessionInWorker(session.id, session.sessionString)];
                        case 14:
                            _d.sent();
                            return [3 /*break*/, 16];
                        case 15:
                            err_2 = _d.sent();
                            this.logger.warn("Health: [".concat(session.id.slice(-8), "] ulashda xatolik: ").concat(err_2.message));
                            return [3 /*break*/, 16];
                        case 16:
                            _c++;
                            return [3 /*break*/, 12];
                        case 17:
                            this.logger.log("Health: ".concat(this.connectedSessions.size, " session, ").concat(this.childProcesses.size, " process"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Send DM via a connected monitor session (has entity cache for group members).
         * Used by TelegramSmsService for users without username.
         */
        MonitorService_1.prototype.sendDmViaMonitor = function (targetId, targetUsername, message, targetPhone, specificSessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var sessionsToTry, _i, _a, sid, _b, sessionsToTry_1, sessionId, result, err_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            sessionsToTry = [];
                            if (specificSessionId && this.connectedSessions.has(specificSessionId)) {
                                sessionsToTry.push(specificSessionId);
                            }
                            // Then try remaining connected sessions
                            for (_i = 0, _a = this.connectedSessions; _i < _a.length; _i++) {
                                sid = _a[_i];
                                if (!sessionsToTry.includes(sid))
                                    sessionsToTry.push(sid);
                            }
                            _b = 0, sessionsToTry_1 = sessionsToTry;
                            _c.label = 1;
                        case 1:
                            if (!(_b < sessionsToTry_1.length)) return [3 /*break*/, 6];
                            sessionId = sessionsToTry_1[_b];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            this.logger.log("Monitor DM urinish: target=".concat(targetId, ", session=").concat(sessionId.slice(-8)));
                            return [4 /*yield*/, this.sendToSession(sessionId, 'sendDm', {
                                    targetId: targetId,
                                    targetUsername: targetUsername || undefined,
                                    targetPhone: targetPhone || undefined,
                                    message: message,
                                })];
                        case 3:
                            result = _c.sent();
                            this.logger.log("Monitor DM natija: ".concat(JSON.stringify(result)));
                            if (result === null || result === void 0 ? void 0 : result.messageId) {
                                this.logger.log("Monitor DM yuborildi: target=".concat(targetId, ", session=").concat(sessionId.slice(-8)));
                                return [2 /*return*/, { success: true, messageId: result.messageId }];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            err_3 = _c.sent();
                            this.logger.warn("Monitor DM xato (".concat(sessionId.slice(-8), "): ").concat(err_3.message));
                            return [3 /*break*/, 5];
                        case 5:
                            _b++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/, { success: false, error: 'Hech bir monitor session userni topa olmadi' }];
                    }
                });
            });
        };
        MonitorService_1.prototype.reconnectSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var oldChild, session, err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            oldChild = this.childProcesses.get(sessionId);
                            if (oldChild) {
                                try {
                                    oldChild.kill();
                                }
                                catch (_b) { }
                                this.childProcesses.delete(sessionId);
                            }
                            this.connectedSessions.delete(sessionId);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, this.prisma.monitorSession.findUnique({
                                    where: { id: sessionId },
                                    select: { sessionString: true, status: true },
                                })];
                        case 2:
                            session = _a.sent();
                            if (!((session === null || session === void 0 ? void 0 : session.sessionString) && session.status === client_1.MonitorSessionStatus.ACTIVE)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.connectSessionInWorker(sessionId, session.sessionString)];
                        case 3:
                            _a.sent();
                            this.logger.log("Reconnect OK: [".concat(sessionId.slice(-8), "]"));
                            _a.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            err_4 = _a.sent();
                            this.logger.error("Reconnect failed [".concat(sessionId.slice(-8), "]: ").concat(err_4.message));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        MonitorService_1.prototype.getFilterRules = function (monitorSessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var now, userId, rulesStr, globalRules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            if (this.filterRulesCache !== undefined && now - this.filterRulesCacheTime < this.FILTER_RULES_CACHE_TTL) {
                                return [2 /*return*/, this.filterRulesCache];
                            }
                            return [4 /*yield*/, this.getCachedSessionUserId(monitorSessionId)];
                        case 1:
                            userId = _a.sent();
                            if (!userId)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.systemConfig.get("filter_rules_".concat(userId))];
                        case 2:
                            rulesStr = _a.sent();
                            if (!!rulesStr) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.systemConfig.get('filter_rules_global')];
                        case 3:
                            globalRules = _a.sent();
                            if (!globalRules) {
                                this.filterRulesCache = null;
                                this.filterRulesCacheTime = now;
                                return [2 /*return*/, null];
                            }
                            try {
                                this.filterRulesCache = JSON.parse(globalRules);
                            }
                            catch (_b) {
                                this.filterRulesCache = null;
                            }
                            this.filterRulesCacheTime = now;
                            return [2 /*return*/, this.filterRulesCache];
                        case 4:
                            try {
                                this.filterRulesCache = JSON.parse(rulesStr);
                            }
                            catch (_c) {
                                this.filterRulesCache = null;
                            }
                            this.filterRulesCacheTime = now;
                            return [2 /*return*/, this.filterRulesCache];
                    }
                });
            });
        };
        // ============================================================
        // GROUP SYNC (via worker)
        // ============================================================
        MonitorService_1.prototype.syncSessionGroups = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.sendToSession(sessionId, 'getDialogs')];
                        case 1:
                            result = _a.sent();
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: sessionId },
                                    data: { totalGroups: result.total },
                                })];
                        case 2:
                            _a.sent();
                            this.logger.debug("Guruhlar sinxronlandi: ".concat(sessionId.slice(-8), " \u2192 ").concat(result.total, " ta"));
                            return [3 /*break*/, 4];
                        case 3:
                            error_5 = _a.sent();
                            this.logger.warn("Guruh sinxronlash xatolik (".concat(sessionId.slice(-8), "): ").concat(error_5.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        MonitorService_1.prototype.syncAllSessionGroups = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, sessionId;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, _a = this.connectedSessions;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            sessionId = _a[_i];
                            return [4 /*yield*/, this.syncSessionGroups(sessionId)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            this.logger.log("".concat(this.connectedSessions.size, " ta session guruxlari sinxronlandi"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        MonitorService_1.prototype.manualSyncGroups = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.connectedSessions.has(sessionId)) {
                                throw new Error('Session ulanmagan');
                            }
                            return [4 /*yield*/, this.syncSessionGroups(sessionId)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.monitorSession.findUnique({
                                    where: { id: sessionId },
                                })];
                        case 2:
                            session = _a.sent();
                            return [2 /*return*/, { totalGroups: (session === null || session === void 0 ? void 0 : session.totalGroups) || 0 }];
                    }
                });
            });
        };
        MonitorService_1.prototype.normalizeGroupId = function (id) {
            var s = id.trim();
            if (s.startsWith('-100') && s.length > 4)
                return s.substring(4);
            if (s.startsWith('-') && s.length > 1)
                return s.substring(1);
            return s;
        };
        MonitorService_1.prototype.getPriorityGroups = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, raw, parsed, ids, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            now = Date.now();
                            if (this.priorityGroupsCache && now - this.priorityGroupsCacheTime < this.PRIORITY_CACHE_TTL) {
                                return [2 /*return*/, this.priorityGroupsCache];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.systemConfig.get('monitor_priority_groups')];
                        case 2:
                            raw = _b.sent();
                            if (raw) {
                                parsed = JSON.parse(raw);
                                if (Array.isArray(parsed)) {
                                    ids = parsed.map(function (item) {
                                        var rawId = typeof item === 'string' ? item : item.groupTelegramId;
                                        return _this.normalizeGroupId(rawId);
                                    });
                                    this.priorityGroupsCache = new Set(ids);
                                }
                                else {
                                    this.priorityGroupsCache = new Set();
                                }
                            }
                            else {
                                this.priorityGroupsCache = new Set();
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            this.priorityGroupsCache = new Set();
                            return [3 /*break*/, 4];
                        case 4:
                            this.priorityGroupsCacheTime = now;
                            return [2 /*return*/, this.priorityGroupsCache];
                    }
                });
            });
        };
        MonitorService_1.prototype.getPriorityGroupsList = function () {
            return __awaiter(this, void 0, void 0, function () {
                var raw, parsed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.systemConfig.get('monitor_priority_groups')];
                        case 1:
                            raw = _a.sent();
                            if (!raw)
                                return [2 /*return*/, []];
                            try {
                                parsed = JSON.parse(raw);
                                if (!Array.isArray(parsed))
                                    return [2 /*return*/, []];
                                return [2 /*return*/, parsed.map(function (item) {
                                        if (typeof item === 'string') {
                                            return { groupTelegramId: item, title: '' };
                                        }
                                        return { groupTelegramId: item.groupTelegramId, title: item.title || '' };
                                    })];
                            }
                            catch (_b) {
                                return [2 /*return*/, []];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        MonitorService_1.prototype.savePriorityGroupsList = function (list) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.systemConfig.set('monitor_priority_groups', JSON.stringify(list), 'JSON', 'Monitor priority guruhlar')];
                        case 1:
                            _a.sent();
                            this.priorityGroupsCache = null;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Telegram guruh nomini aniqlash — worker orqali
         */
        MonitorService_1.prototype.resolveGroupTitle = function (groupTelegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, sessionId, title, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _i = 0, _a = this.connectedSessions;
                            _c.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            sessionId = _a[_i];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.sendToSession(sessionId, 'resolveGroupTitle', { groupTelegramId: groupTelegramId })];
                        case 3:
                            title = _c.sent();
                            if (title)
                                return [2 /*return*/, title];
                            return [3 /*break*/, 5];
                        case 4:
                            _b = _c.sent();
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/, ''];
                    }
                });
            });
        };
        MonitorService_1.prototype.addPriorityGroup = function (groupTelegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var list, normalizedId, exists, title;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getPriorityGroupsList()];
                        case 1:
                            list = _a.sent();
                            normalizedId = this.normalizeGroupId(groupTelegramId);
                            exists = list.some(function (g) { return _this.normalizeGroupId(g.groupTelegramId) === normalizedId; });
                            if (!!exists) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.resolveGroupTitle(groupTelegramId)];
                        case 2:
                            title = _a.sent();
                            list.push({ groupTelegramId: normalizedId, title: title || '' });
                            return [4 /*yield*/, this.savePriorityGroupsList(list)];
                        case 3:
                            _a.sent();
                            this.logger.log("Priority guruh qo'shildi: ".concat(normalizedId, " (").concat(title || 'nomi topilmadi', ")"));
                            _a.label = 4;
                        case 4: return [2 /*return*/, list];
                    }
                });
            });
        };
        MonitorService_1.prototype.removePriorityGroup = function (groupTelegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var list, normalizedId, filtered;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getPriorityGroupsList()];
                        case 1:
                            list = _a.sent();
                            normalizedId = this.normalizeGroupId(groupTelegramId);
                            filtered = list.filter(function (g) { return _this.normalizeGroupId(g.groupTelegramId) !== normalizedId; });
                            return [4 /*yield*/, this.savePriorityGroupsList(filtered)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, filtered];
                    }
                });
            });
        };
        MonitorService_1.prototype.updatePriorityGroupTitle = function (groupTelegramId, title) {
            return __awaiter(this, void 0, void 0, function () {
                var list, normalizedId, group;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getPriorityGroupsList()];
                        case 1:
                            list = _a.sent();
                            normalizedId = this.normalizeGroupId(groupTelegramId);
                            group = list.find(function (g) { return _this.normalizeGroupId(g.groupTelegramId) === normalizedId; });
                            if (!(group && !group.title && title)) return [3 /*break*/, 3];
                            group.title = title;
                            return [4 /*yield*/, this.savePriorityGroupsList(list)];
                        case 2:
                            _a.sent();
                            this.logger.log("Priority guruh nomi yangilandi: ".concat(normalizedId, " \u2192 ").concat(title));
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // SESSION CRUD
        // ============================================================
        /**
         * Delete monitor session — disconnect in worker + DB update
         */
        MonitorService_1.prototype.deleteSession = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var child, _a, pending, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!this.connectedSessions.has(id)) return [3 /*break*/, 6];
                            child = this.childProcesses.get(id);
                            if (!child) return [3 /*break*/, 5];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.sendToSession(id, 'disconnect')];
                        case 2:
                            _c.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            try {
                                child.kill();
                            }
                            catch (_d) { }
                            this.childProcesses.delete(id);
                            _c.label = 5;
                        case 5:
                            this.connectedSessions.delete(id);
                            this.lastWorkerActivity.delete(id);
                            _c.label = 6;
                        case 6:
                            pending = this.pendingAuths.get(id);
                            if (!pending) return [3 /*break*/, 11];
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, pending.client.disconnect()];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _b = _c.sent();
                            return [3 /*break*/, 10];
                        case 10:
                            this.pendingAuths.delete(id);
                            _c.label = 11;
                        case 11: return [2 /*return*/, this.prisma.monitorSession.update({
                                where: { id: id },
                                data: { status: client_1.MonitorSessionStatus.DELETED },
                            })];
                    }
                });
            });
        };
        /**
         * Get session stats
         */
        MonitorService_1.prototype.getStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalSessions, activeSessions, totalOrders, newOrders;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.monitorSession.count({
                                    where: { userId: userId, status: { not: client_1.MonitorSessionStatus.DELETED } },
                                }),
                                this.prisma.monitorSession.count({
                                    where: { userId: userId, status: client_1.MonitorSessionStatus.ACTIVE },
                                }),
                                this.prisma.order.count({ where: { userId: userId } }),
                                this.prisma.order.count({ where: { userId: userId, status: client_1.OrderStatus.NEW } }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalSessions = _a[0], activeSessions = _a[1], totalOrders = _a[2], newOrders = _a[3];
                            return [2 /*return*/, { totalSessions: totalSessions, activeSessions: activeSessions, totalOrders: totalOrders, newOrders: newOrders }];
                    }
                });
            });
        };
        /**
         * Check if a session is connected (local tracking, no worker call)
         */
        MonitorService_1.prototype.isConnected = function (sessionId) {
            return this.connectedSessions.has(sessionId);
        };
        /**
         * Check if there's a pending auth
         */
        MonitorService_1.prototype.hasPendingAuth = function (sessionId) {
            return this.pendingAuths.has(sessionId);
        };
        /**
         * Resolve user accessHash from monitor session entity caches.
         * If specificSessionId given, tries it first (most likely to have the entity).
         * Then tries remaining connected sessions.
         */
        MonitorService_1.prototype.resolveUser = function (telegramId, specificSessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var sessionsToTry, _i, _a, sid, _b, sessionsToTry_2, sessionId, result, err_5;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            sessionsToTry = [];
                            if (specificSessionId && this.childProcesses.has(specificSessionId)) {
                                sessionsToTry.push(specificSessionId);
                            }
                            for (_i = 0, _a = this.childProcesses; _i < _a.length; _i++) {
                                sid = _a[_i][0];
                                if (!sessionsToTry.includes(sid))
                                    sessionsToTry.push(sid);
                            }
                            this.logger.log("resolveUser: ".concat(telegramId, ", sessions=").concat(sessionsToTry.length, ", specific=").concat((specificSessionId === null || specificSessionId === void 0 ? void 0 : specificSessionId.slice(-8)) || 'none'));
                            _b = 0, sessionsToTry_2 = sessionsToTry;
                            _c.label = 1;
                        case 1:
                            if (!(_b < sessionsToTry_2.length)) return [3 /*break*/, 6];
                            sessionId = sessionsToTry_2[_b];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.sendToSession(sessionId, 'resolveUser', { telegramId: telegramId })];
                        case 3:
                            result = _c.sent();
                            if (result === null || result === void 0 ? void 0 : result.accessHash) {
                                this.logger.log("resolveUser OK: ".concat(telegramId, " -> session ").concat(sessionId.slice(-8), ", hash=").concat(result.accessHash.slice(0, 8), "..."));
                                return [2 /*return*/, result];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            err_5 = _c.sent();
                            this.logger.debug("resolveUser miss: ".concat(telegramId, " @ ").concat(sessionId.slice(-8), " \u2014 ").concat(err_5.message));
                            return [3 /*break*/, 5];
                        case 5:
                            _b++;
                            return [3 /*break*/, 1];
                        case 6:
                            this.logger.warn("resolveUser FAIL: ".concat(telegramId, " \u2014 hech bir sessionda topilmadi"));
                            return [2 /*return*/, null];
                    }
                });
            });
        };
        return MonitorService_1;
    }());
    __setFunctionName(_classThis, "MonitorService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MonitorService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MonitorService = _classThis;
}();
exports.MonitorService = MonitorService;
