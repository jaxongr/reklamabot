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
exports.PostingService = void 0;
var common_1 = require("@nestjs/common");
// ==================== BROADCAST BOT INTERVALLAR ====================
//
// Oddiy rejim: 0.3-6 sekund (guruhlar orasida), 5 daqiqa (round orasida)
// Himoyalangan rejim: 1-15 sekund (guruhlar orasida), 10 daqiqa (round orasida)
//
// WRITE_FORBIDDEN / USER_BANNED / ADD_USER → doimiy block (tashlab o'tish)
// SLOWMODE → vaqti tugaguncha tashlab o'tish, keyin qayta yuborish
// FLOOD_WAIT → kichik: skip, katta: guruh block
// Oddiy rejim (loop posting — ehtiyotkor)
var NORMAL_MIN_DELAY = 300; // 0.3s
var NORMAL_MAX_DELAY = 6000; // 6s
var NORMAL_ROUND_PAUSE = 5 * 60 * 1000; // 5 daqiqa
// BroadcastOnce rejimi (findDriver — tezkor, 1 round)
// Telegram anti-spam: juda tez yuborsa SLOWMODE_WAIT beradi
// 3-5s orasida — xavfsiz va barqaror
var BROADCAST_MIN_DELAY = 2500; // 2.5s
var BROADCAST_MAX_DELAY = 5000; // 5s
// Himoyalangan rejim
var SAFE_MIN_DELAY = 1000; // 1s
var SAFE_MAX_DELAY = 15000; // 15s
var SAFE_ROUND_PAUSE = 10 * 60 * 1000; // 10 daqiqa
// FLOOD thresholds
var NORMAL_FLOOD_MAX_WAIT = 300; // 5 daqiqa
var SAFE_FLOOD_MAX_WAIT = 600; // 10 daqiqa
// Zero-width belgilar (xabar variatsiyasi — ban himoyasi)
var INVISIBLE_CHARS = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
// Progress har N ta guruhda yangilanadi
var PROGRESS_EVERY_N = 1;
var PostingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PostingService = _classThis = /** @class */ (function () {
        function PostingService_1(prisma, telegramService) {
            this.prisma = prisma;
            this.telegramService = telegramService;
            this.logger = new common_1.Logger(PostingService.name);
            this.activeJobs = new Map();
            this.jobTimers = new Map();
            // Bloklangan guruhlar (broadcast bot kabi — in-memory Set)
            // sessionId → Set<groupTelegramId>
            this.blockedGroups = new Map();
            // Master/tobe broadcast uchun
            // slaveUserId → broadcastId (unique — yangi broadcast eskisini to'xtatadi)
            this.activeBroadcasts = new Map();
            // BroadcastOnce cancel uchun: userId → cancelled flag
            this.broadcastOnceCancelled = new Set();
            // BroadcastOnce faol holati: userId → progress (mobile reconnect uchun)
            this.broadcastOnceStatus = new Map();
            // SLOWMODE guruhlar: groupTelegramId → timestamp (qachon qayta yuborish mumkin)
            // Vaqti tugasa — keyingi roundda yuboriladi
            this.slowmodeGroups = new Map();
        }
        // ==================== ANTI-BAN HELPERS ====================
        /**
         * Xabar oxiriga ko'rinmas belgilar qo'shish (har guruhga unique)
         * Telegram hash tekshiruvidan o'tadi — bir xil xabar yuborilmaydi
         */
        PostingService_1.prototype.addMessageVariation = function (text, groupIndex) {
            var suffix = '';
            var idx = groupIndex;
            for (var i = 0; i < 4; i++) {
                suffix += INVISIBLE_CHARS[idx % INVISIBLE_CHARS.length];
                idx = Math.floor(idx / INVISIBLE_CHARS.length) + i + 1;
            }
            var extraCount = 1 + Math.floor(Math.random() * 3);
            for (var i = 0; i < extraCount; i++) {
                suffix += INVISIBLE_CHARS[Math.floor(Math.random() * INVISIBLE_CHARS.length)];
            }
            return text + suffix;
        };
        /**
         * SLOWMODE guruh vaqti tugadimi tekshirish
         */
        PostingService_1.prototype.isSlowmodeExpired = function (groupKey) {
            var until = this.slowmodeGroups.get(groupKey);
            if (!until)
                return true; // slowmode yo'q = o'tish mumkin
            if (Date.now() >= until) {
                this.slowmodeGroups.delete(groupKey);
                return true; // vaqti tugadi
            }
            return false; // hali kutish kerak
        };
        /**
         * SLOWMODE guruhni belgilash
         */
        PostingService_1.prototype.markSlowmode = function (groupKey, waitSeconds) {
            this.slowmodeGroups.set(groupKey, Date.now() + waitSeconds * 1000);
        };
        // ==================== BLOCKED GROUPS ====================
        PostingService_1.prototype.isGroupBlocked = function (sessionId, groupTelegramId) {
            var blocked = this.blockedGroups.get(sessionId);
            return blocked ? blocked.has(groupTelegramId) : false;
        };
        PostingService_1.prototype.blockGroup = function (sessionId, groupTelegramId) {
            if (!this.blockedGroups.has(sessionId)) {
                this.blockedGroups.set(sessionId, new Set());
            }
            this.blockedGroups.get(sessionId).add(groupTelegramId);
        };
        /** Bloklangan guruhlar sonini olish */
        PostingService_1.prototype.getBlockedCount = function (sessionId) {
            var _a;
            if (sessionId) {
                return ((_a = this.blockedGroups.get(sessionId)) === null || _a === void 0 ? void 0 : _a.size) || 0;
            }
            var total = 0;
            for (var _i = 0, _b = this.blockedGroups.values(); _i < _b.length; _i++) {
                var set = _b[_i];
                total += set.size;
            }
            return total;
        };
        /** Bloklangan guruhlarni tozalash (yangi tarqatish uchun) */
        PostingService_1.prototype.clearBlockedGroups = function (sessionId) {
            if (sessionId) {
                this.blockedGroups.delete(sessionId);
            }
            else {
                this.blockedGroups.clear();
            }
        };
        // ==================== ASOSIY TARQATISH ====================
        PostingService_1.prototype.startPosting = function (adId_1, adContent_1, userId_1, sessionIds_1) {
            return __awaiter(this, arguments, void 0, function (adId, adContent, userId, sessionIds, safeMode) {
                var where, sessions, _i, sessions_1, session, error_1, connectedSessions, allGroups, _a, connectedSessions_1, session, _b, _c, group, perSessionStats, _loop_1, _d, connectedSessions_2, session, modeLabel, minDelay, maxDelay, roundPause, jobId, job;
                var _this = this;
                if (safeMode === void 0) { safeMode = false; }
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            where = {
                                userId: userId,
                                status: 'ACTIVE',
                                isFrozen: false,
                                sessionString: { not: null },
                            };
                            if (sessionIds && sessionIds.length > 0) {
                                where.id = { in: sessionIds };
                            }
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: where,
                                    include: {
                                        groups: {
                                            where: { isActive: true },
                                        },
                                    },
                                })];
                        case 1:
                            sessions = _e.sent();
                            if (sessions.length === 0) {
                                throw new Error('Faol session topilmadi. Iltimos, avval session ulang.');
                            }
                            _i = 0, sessions_1 = sessions;
                            _e.label = 2;
                        case 2:
                            if (!(_i < sessions_1.length)) return [3 /*break*/, 7];
                            session = sessions_1[_i];
                            if (!!this.telegramService.isClientConnected(session.id)) return [3 /*break*/, 6];
                            _e.label = 3;
                        case 3:
                            _e.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.telegramService.connectSession(session.id)];
                        case 4:
                            _e.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            error_1 = _e.sent();
                            this.logger.warn("Session ulanmadi: ".concat(session.id, " \u2014 ").concat(error_1.message));
                            return [3 /*break*/, 6];
                        case 6:
                            _i++;
                            return [3 /*break*/, 2];
                        case 7:
                            connectedSessions = sessions.filter(function (s) {
                                return _this.telegramService.isClientConnected(s.id);
                            });
                            if (connectedSessions.length === 0) {
                                throw new Error('Hech bir session ulanmadi. Sessionlarni tekshiring.');
                            }
                            allGroups = [];
                            for (_a = 0, connectedSessions_1 = connectedSessions; _a < connectedSessions_1.length; _a++) {
                                session = connectedSessions_1[_a];
                                for (_b = 0, _c = session.groups; _b < _c.length; _b++) {
                                    group = _c[_b];
                                    // Bloklangan guruhlarni o'tkazib yuborish
                                    if (this.isGroupBlocked(session.id, group.telegramId))
                                        continue;
                                    allGroups.push({
                                        id: group.id,
                                        telegramId: group.telegramId,
                                        name: group.title || 'Nomsiz',
                                        sessionId: session.id,
                                        sessionName: session.name || session.phone || 'Session',
                                        lastPostAt: group.lastPostAt,
                                    });
                                }
                            }
                            if (allGroups.length === 0) {
                                throw new Error("".concat(connectedSessions.length, " ta session bor, lekin guruhlar topilmadi. ") +
                                    'Avval guruhlarni sinxronlang.');
                            }
                            perSessionStats = new Map();
                            _loop_1 = function (session) {
                                var groupCount = allGroups.filter(function (g) { return g.sessionId === session.id; }).length;
                                perSessionStats.set(session.id, {
                                    name: session.name || session.phone || 'Session',
                                    sent: 0,
                                    failed: 0,
                                    skipped: 0,
                                    totalGroups: groupCount,
                                });
                            };
                            for (_d = 0, connectedSessions_2 = connectedSessions; _d < connectedSessions_2.length; _d++) {
                                session = connectedSessions_2[_d];
                                _loop_1(session);
                            }
                            modeLabel = safeMode ? 'HIMOYALANGAN' : 'ODDIY';
                            minDelay = safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
                            maxDelay = safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;
                            roundPause = safeMode ? SAFE_ROUND_PAUSE : NORMAL_ROUND_PAUSE;
                            jobId = "job_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8));
                            job = {
                                id: jobId,
                                adId: adId,
                                adContent: adContent,
                                userId: userId,
                                status: 'running',
                                startTime: new Date(),
                                totalGroups: allGroups.length,
                                postedGroups: 0,
                                failedGroups: 0,
                                skippedGroups: 0,
                                roundsCompleted: 0,
                                logs: [],
                                stopRequested: false,
                                pauseRequested: false,
                                safeMode: safeMode,
                                perSessionStats: perSessionStats,
                            };
                            this.activeJobs.set(jobId, job);
                            this.logger.log("\uD83D\uDE80 Tarqatish boshlandi [".concat(modeLabel, "]: ").concat(jobId, "\n") +
                                "   Sessions: ".concat(connectedSessions.length, "\n") +
                                "   Guruhlar: ".concat(allGroups.length, "\n") +
                                "   Delay: ".concat(minDelay / 1000, "-").concat(maxDelay / 1000, "s\n") +
                                "   Round pauza: ".concat(roundPause / 60000, " daqiqa"));
                            // Background da ishga tushirish
                            this.runPostingLoop(jobId, allGroups, connectedSessions.map(function (s) { return s.id; }));
                            return [2 /*return*/, job];
                    }
                });
            });
        };
        /**
         * Asosiy tarqatish tsikli — cheksiz roundlar (to'xtatilguncha)
         * Broadcast bot logikasi: group replacement, flood=skip
         */
        PostingService_1.prototype.runPostingLoop = function (jobId, initialGroups, sessionIds) {
            return __awaiter(this, void 0, void 0, function () {
                var job, roundPause, groups, shuffled, pauseEnd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            job = this.activeJobs.get(jobId);
                            if (!job)
                                return [2 /*return*/];
                            roundPause = job.safeMode ? SAFE_ROUND_PAUSE : NORMAL_ROUND_PAUSE;
                            _a.label = 1;
                        case 1:
                            if (!true) return [3 /*break*/, 9];
                            if (job.stopRequested) {
                                job.status = 'stopped';
                                job.endTime = new Date();
                                job.nextRoundAt = undefined;
                                this.emitProgress(job);
                                this.logger.log("\u23F9 Job to'xtatildi: ".concat(jobId));
                                return [3 /*break*/, 9];
                            }
                            if (!job.pauseRequested) return [3 /*break*/, 3];
                            job.status = 'paused';
                            return [4 /*yield*/, this.delay(5000)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 1];
                        case 3: return [4 /*yield*/, this.getGroupsWithReplacement(initialGroups, sessionIds)];
                        case 4:
                            groups = _a.sent();
                            if (groups.length === 0) {
                                this.logger.warn("\uD83D\uDED1 Barcha guruhlar bloklangan. To'xtatildi: ".concat(jobId));
                                job.status = 'stopped';
                                job.endTime = new Date();
                                job.nextRoundAt = undefined;
                                this.emitProgress(job);
                                return [3 /*break*/, 9];
                            }
                            shuffled = this.shuffleArray(__spreadArray([], groups, true));
                            // Round boshlash
                            job.currentRound = job.roundsCompleted + 1;
                            job.totalGroups = shuffled.length;
                            this.emitProgress(job);
                            return [4 /*yield*/, this.postRound(job, shuffled)];
                        case 5:
                            _a.sent();
                            if (job.stopRequested) {
                                job.status = 'stopped';
                                job.endTime = new Date();
                                job.nextRoundAt = undefined;
                                this.emitProgress(job);
                                return [3 /*break*/, 9];
                            }
                            job.roundsCompleted++;
                            job.currentRound = job.roundsCompleted;
                            this.logger.log("\uD83D\uDD04 Round #".concat(job.roundsCompleted, " tugadi. ") +
                                "\u2705".concat(job.postedGroups, " \u274C").concat(job.failedGroups, " \u23ED").concat(job.skippedGroups));
                            // Round orasidagi pauza (broadcast bot kabi — daqiqama-daqiqa)
                            this.logger.log("\u23F8 ".concat(roundPause / 60000, " daqiqa pauza..."));
                            pauseEnd = Date.now() + roundPause;
                            job.nextRoundAt = new Date(pauseEnd);
                            this.emitProgress(job);
                            _a.label = 6;
                        case 6:
                            if (!(Date.now() < pauseEnd)) return [3 /*break*/, 8];
                            if (job.stopRequested)
                                return [3 /*break*/, 8];
                            return [4 /*yield*/, this.delay(2000)];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 8:
                            job.nextRoundAt = undefined;
                            return [3 /*break*/, 1];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Group replacement logikasi (broadcast bot kabi)
         * Blocked guruhlar o'rniga DB dan yangilarini olish
         */
        PostingService_1.prototype.getGroupsWithReplacement = function (selectedGroups, sessionIds) {
            return __awaiter(this, void 0, void 0, function () {
                var activeGroups, blockedCount, selectedTelegramIds, extraGroups, _loop_2, this_1, _i, sessionIds_1, sessionId;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            activeGroups = selectedGroups.filter(function (g) { return !_this.isGroupBlocked(g.sessionId, g.telegramId); });
                            blockedCount = selectedGroups.length - activeGroups.length;
                            if (blockedCount === 0)
                                return [2 /*return*/, activeGroups];
                            selectedTelegramIds = new Set(selectedGroups.map(function (g) { return g.telegramId; }));
                            extraGroups = [];
                            _loop_2 = function (sessionId) {
                                var sessionBlocked, sessionSelectedCount, sessionActiveCount, neededExtra, blockedIds, dbGroups, _d, dbGroups_1, g;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            sessionBlocked = this_1.blockedGroups.get(sessionId);
                                            sessionSelectedCount = selectedGroups.filter(function (g) { return g.sessionId === sessionId; }).length;
                                            sessionActiveCount = activeGroups.filter(function (g) { return g.sessionId === sessionId; }).length;
                                            neededExtra = sessionSelectedCount - sessionActiveCount;
                                            if (neededExtra <= 0)
                                                return [2 /*return*/, "continue"];
                                            blockedIds = sessionBlocked ? Array.from(sessionBlocked) : [];
                                            return [4 /*yield*/, this_1.prisma.group.findMany({
                                                    where: {
                                                        sessionId: sessionId,
                                                        isActive: true,
                                                        isSkipped: false,
                                                        telegramId: {
                                                            notIn: __spreadArray(__spreadArray([], Array.from(selectedTelegramIds), true), blockedIds, true),
                                                        },
                                                    },
                                                    take: neededExtra,
                                                    include: {
                                                        session: { select: { name: true, phone: true } },
                                                    },
                                                })];
                                        case 1:
                                            dbGroups = _e.sent();
                                            for (_d = 0, dbGroups_1 = dbGroups; _d < dbGroups_1.length; _d++) {
                                                g = dbGroups_1[_d];
                                                extraGroups.push({
                                                    id: g.id,
                                                    telegramId: g.telegramId,
                                                    name: g.title || 'Nomsiz',
                                                    sessionId: g.sessionId,
                                                    sessionName: ((_a = g.session) === null || _a === void 0 ? void 0 : _a.name) || ((_b = g.session) === null || _b === void 0 ? void 0 : _b.phone) || 'Session',
                                                    lastPostAt: g.lastPostAt,
                                                });
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, sessionIds_1 = sessionIds;
                            _c.label = 1;
                        case 1:
                            if (!(_i < sessionIds_1.length)) return [3 /*break*/, 4];
                            sessionId = sessionIds_1[_i];
                            return [5 /*yield**/, _loop_2(sessionId)];
                        case 2:
                            _c.sent();
                            _c.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            if (extraGroups.length > 0) {
                                this.logger.log("\uD83D\uDD04 Group replacement: ".concat(blockedCount, " blocked, ").concat(extraGroups.length, " yangi qo'shildi"));
                            }
                            return [2 /*return*/, __spreadArray(__spreadArray([], activeGroups, true), extraGroups, true)];
                    }
                });
            });
        };
        /**
         * Bitta round — barcha sessionlar PARALLEL
         */
        PostingService_1.prototype.postRound = function (job, groups) {
            return __awaiter(this, void 0, void 0, function () {
                var roundStart, groupsBySession, _i, groups_1, group, existing, sessionTasks, results, totalPosted, _a, results_1, result, roundDuration;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            roundStart = Date.now();
                            groupsBySession = new Map();
                            for (_i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                                group = groups_1[_i];
                                existing = groupsBySession.get(group.sessionId) || [];
                                existing.push(group);
                                groupsBySession.set(group.sessionId, existing);
                            }
                            this.logger.log("\uD83D\uDD04 Round #".concat((job.roundsCompleted || 0) + 1, " boshlandi \u2014 ") +
                                "".concat(groupsBySession.size, " ta session PARALLEL, jami ").concat(groups.length, " guruh"));
                            sessionTasks = Array.from(groupsBySession.entries()).map(function (_a) {
                                var sessionId = _a[0], sessionGroups = _a[1];
                                return _this.postSessionGroups(job, sessionId, _this.shuffleArray(__spreadArray([], sessionGroups, true)));
                            });
                            return [4 /*yield*/, Promise.allSettled(sessionTasks)];
                        case 1:
                            results = _b.sent();
                            totalPosted = 0;
                            for (_a = 0, results_1 = results; _a < results_1.length; _a++) {
                                result = results_1[_a];
                                if (result.status === 'fulfilled') {
                                    totalPosted += result.value;
                                }
                                else {
                                    this.logger.error("Session task xatolik: ".concat(result.reason));
                                }
                            }
                            roundDuration = Math.floor((Date.now() - roundStart) / 1000);
                            this.emitProgress(job);
                            this.logger.log("\u2705 Round \u2014 ".concat(roundDuration, "s \u2014 Yuborildi: ").concat(totalPosted));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Bitta session guruhlariga ketma-ket yuborish
         * - Tezlik avvalgidek (0.3-6s oddiy, 1-15s xavfsiz)
         * - SLOWMODE guruhlar vaqti tugaguncha tashlab o'tiladi
         * - Bloklangan guruhlar tashlab o'tiladi
         */
        PostingService_1.prototype.postSessionGroups = function (job, sessionId, groups) {
            return __awaiter(this, void 0, void 0, function () {
                var messageCount, minDelay, maxDelay, processedCount, i, group, sessionStat, slowKey, result, delay;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            messageCount = 0;
                            minDelay = job.safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
                            maxDelay = job.safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;
                            processedCount = 0;
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < groups.length)) return [3 /*break*/, 9];
                            if (job.stopRequested)
                                return [3 /*break*/, 9];
                            if (!job.pauseRequested) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            if (!(job.pauseRequested && !job.stopRequested)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.delay(2000)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 2];
                        case 4:
                            if (job.stopRequested)
                                return [3 /*break*/, 9];
                            _a.label = 5;
                        case 5:
                            group = groups[i];
                            sessionStat = job.perSessionStats.get(group.sessionId);
                            // Bloklangan guruhni o'tkazish
                            if (this.isGroupBlocked(group.sessionId, group.telegramId)) {
                                job.skippedGroups++;
                                if (sessionStat)
                                    sessionStat.skipped++;
                                processedCount++;
                                return [3 /*break*/, 8];
                            }
                            slowKey = "".concat(group.sessionId, ":").concat(group.telegramId);
                            if (!this.isSlowmodeExpired(slowKey)) {
                                job.skippedGroups++;
                                if (sessionStat)
                                    sessionStat.skipped++;
                                processedCount++;
                                return [3 /*break*/, 8];
                            }
                            return [4 /*yield*/, this.postToGroup(job, group, i)];
                        case 6:
                            result = _a.sent();
                            if (result.success) {
                                job.postedGroups++;
                                messageCount++;
                                if (sessionStat)
                                    sessionStat.sent++;
                            }
                            else if (result.log.status === 'skipped') {
                                job.skippedGroups++;
                                if (sessionStat)
                                    sessionStat.skipped++;
                            }
                            else {
                                job.failedGroups++;
                                if (sessionStat)
                                    sessionStat.failed++;
                            }
                            job.logs.push(result.log);
                            // Loglar chegaralash
                            if (job.logs.length > 500) {
                                job.logs = job.logs.slice(-300);
                            }
                            processedCount++;
                            // Progress har PROGRESS_EVERY_N ta guruhda
                            if (processedCount % PROGRESS_EVERY_N === 0 || processedCount === groups.length) {
                                this.emitProgress(job);
                            }
                            if (!(i < groups.length - 1 && !job.stopRequested)) return [3 /*break*/, 8];
                            delay = this.getRandomDelay(minDelay, maxDelay);
                            return [4 /*yield*/, this.delay(delay)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            i++;
                            return [3 /*break*/, 1];
                        case 9: return [2 /*return*/, messageCount];
                    }
                });
            });
        };
        /**
         * Bitta guruhga xabar yuborish
         * ANTI-BAN: FLOOD_WAIT = DOIM KUTISH, xabar variatsiyasi
         */
        PostingService_1.prototype.postToGroup = function (job_1, group_1) {
            return __awaiter(this, arguments, void 0, function (job, group, groupIndex) {
                var startTime, _a, variedMessage, sendResult, error_2, errorMsg, waitSeconds, maxWait, slowMatch, slowSeconds, slowKey;
                if (groupIndex === void 0) { groupIndex = 0; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            startTime = Date.now();
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, , 9]);
                            if (!!this.telegramService.isClientConnected(group.sessionId)) return [3 /*break*/, 5];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.telegramService.connectSession(group.sessionId)];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            _a = _b.sent();
                            return [2 /*return*/, {
                                    success: false,
                                    log: {
                                        timestamp: new Date(),
                                        sessionId: group.sessionId,
                                        sessionName: group.sessionName,
                                        groupName: group.name,
                                        groupId: group.id,
                                        status: 'skipped',
                                        reason: 'Session ulangan emas',
                                    },
                                }];
                        case 5:
                            variedMessage = this.addMessageVariation(job.adContent, groupIndex + Date.now() % 1000);
                            return [4 /*yield*/, this.telegramService.sendMessage(group.sessionId, group.telegramId, variedMessage)];
                        case 6:
                            sendResult = _b.sent();
                            // DB yangilash
                            return [4 /*yield*/, this.prisma.group.update({
                                    where: { id: group.id },
                                    data: { lastPostAt: new Date() },
                                }).catch(function () { })];
                        case 7:
                            // DB yangilash
                            _b.sent();
                            // MessageId saqlash — keyinroq o'chirish uchun
                            if (sendResult === null || sendResult === void 0 ? void 0 : sendResult.messageId) {
                                this.savePostHistory(job, group, sendResult.messageId).catch(function () { });
                            }
                            return [2 /*return*/, {
                                    success: true,
                                    log: {
                                        timestamp: new Date(),
                                        sessionId: group.sessionId,
                                        sessionName: group.sessionName,
                                        groupName: group.name,
                                        groupId: group.id,
                                        status: 'success',
                                        duration: Date.now() - startTime,
                                    },
                                }];
                        case 8:
                            error_2 = _b.sent();
                            errorMsg = error_2.message || 'Noma\'lum xatolik';
                            // ======== FLOOD_WAIT — skip (tezlikni sekinlashtirmaslik) ========
                            if (errorMsg.startsWith('FLOOD_WAIT:')) {
                                waitSeconds = parseInt(errorMsg.split(':')[1]) || 60;
                                maxWait = job.safeMode ? SAFE_FLOOD_MAX_WAIT : NORMAL_FLOOD_MAX_WAIT;
                                if (waitSeconds > maxWait) {
                                    // Katta flood — guruhni bloklash
                                    this.blockGroup(group.sessionId, group.telegramId);
                                    this.logger.warn("\uD83D\uDEAB FLOOD_WAIT ".concat(waitSeconds, "s > ").concat(maxWait, "s \u2014 guruh bloklandi: ").concat(group.name));
                                }
                                else {
                                    // Oddiy flood — SKIP
                                    this.logger.warn("\u23ED FLOOD_WAIT ".concat(waitSeconds, "s \u2014 SKIP: ").concat(group.name));
                                }
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'failed',
                                            reason: "FLOOD_WAIT ".concat(waitSeconds, "s"),
                                            duration: Date.now() - startTime,
                                        },
                                    }];
                            }
                            // ======== YOZISH TAQIQLANGAN (broadcast bot kabi — doimiy block) ========
                            if (errorMsg.includes('WRITE_FORBIDDEN') ||
                                errorMsg.includes('CHAT_WRITE_FORBIDDEN') ||
                                errorMsg.includes('USER_BANNED') ||
                                errorMsg.includes('CHANNEL_PRIVATE') ||
                                errorMsg.includes('CHAT_ADMIN_REQUIRED') ||
                                errorMsg.includes('need to add') ||
                                errorMsg.includes('ADD_USER') ||
                                errorMsg.includes('INVITE')) {
                                this.blockGroup(group.sessionId, group.telegramId);
                                this.logger.log("\uD83D\uDEAB Bloklandi: ".concat(group.name, " \u2014 ").concat(errorMsg));
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'skipped',
                                            reason: errorMsg,
                                        },
                                    }];
                            }
                            // ======== SLOWMODE — vaqti tugaguncha tashlab o'tish, keyin qayta yuborish ========
                            if (errorMsg.includes('SLOWMODE_WAIT') || errorMsg.includes('slowmode')) {
                                slowMatch = errorMsg.match(/(\d+)/);
                                slowSeconds = slowMatch ? parseInt(slowMatch[1]) : 300;
                                slowKey = "".concat(group.sessionId, ":").concat(group.telegramId);
                                this.markSlowmode(slowKey, slowSeconds);
                                this.logger.log("\u23F3 SLOWMODE ".concat(slowSeconds, "s \u2014 tashlab o'tildi, keyingi roundda qayta: ").concat(group.name));
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'skipped',
                                            reason: "Slowmode ".concat(slowSeconds, "s"),
                                        },
                                    }];
                            }
                            // ======== CHANNEL_INVALID ========
                            if (errorMsg.includes('CHANNEL_INVALID')) {
                                this.blockGroup(group.sessionId, group.telegramId);
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'skipped',
                                            reason: 'Kanal yaroqsiz',
                                        },
                                    }];
                            }
                            // ======== SESSION O'LGAN ========
                            if (errorMsg.startsWith('SESSION_DEAD:')) {
                                this.logger.error("\uD83D\uDC80 Session o'lgan: ".concat(group.sessionName));
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'failed',
                                            reason: 'Session o\'lgan',
                                        },
                                    }];
                            }
                            // ======== CHAT_RESTRICTED ========
                            if (errorMsg.includes('CHAT_RESTRICTED') ||
                                errorMsg.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
                                errorMsg.includes('CHAT_GUEST_SEND_FORBIDDEN') ||
                                errorMsg.includes('PREMIUM_ACCOUNT_REQUIRED')) {
                                this.blockGroup(group.sessionId, group.telegramId);
                                return [2 /*return*/, {
                                        success: false,
                                        log: {
                                            timestamp: new Date(),
                                            sessionId: group.sessionId,
                                            sessionName: group.sessionName,
                                            groupName: group.name,
                                            groupId: group.id,
                                            status: 'skipped',
                                            reason: 'Cheklangan guruh',
                                        },
                                    }];
                            }
                            // ======== BOSHQA XATOLAR ========
                            return [2 /*return*/, {
                                    success: false,
                                    log: {
                                        timestamp: new Date(),
                                        sessionId: group.sessionId,
                                        sessionName: group.sessionName,
                                        groupName: group.name,
                                        groupId: group.id,
                                        status: 'failed',
                                        reason: errorMsg,
                                        duration: Date.now() - startTime,
                                    },
                                }];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        // ==================== BROADCAST ONCE (Haydovchi topish) ====================
        /**
         * Bir martalik tarqatish — barcha guruxlarga 1 ta round
         * Haydovchi topish uchun ishlatiladi
         */
        PostingService_1.prototype.broadcastOnce = function (content, userId, onProgress) {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, connectedSessions, groupSessionsMap, sessionNames, _i, connectedSessions_3, session, _a, _b, group, existing, allGroups, shuffled, progress, sentGroupIds, totalGroups, sessionCount, isCancelled, emitProgress, sentGroupDbIds, retryGroups, sessionSendCount, _c, connectedSessions_4, s, pickBestSession, deactivateGroupIds, _loop_3, this_2, i, state_1, sortedRetry, minSec, maxSec, retrySent, retrySkipped, retryStartTime, i, rg, elapsedMs, waitMs, sent, sessionsToTry, _d, sessionsToTry_1, sessionId, variedMessage, _e;
                var _this = this;
                var _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.findMany({
                                where: {
                                    userId: userId,
                                    status: 'ACTIVE',
                                    isFrozen: false,
                                    sessionString: { not: null },
                                },
                                include: {
                                    groups: { where: { isActive: true } },
                                },
                            })];
                        case 1:
                            sessions = _h.sent();
                            if (sessions.length === 0) {
                                throw new Error('Faol session topilmadi. Avval session ulang.');
                            }
                            // 2. Ulash — PARALLEL (10+ session tezkor)
                            return [4 /*yield*/, Promise.allSettled(sessions.map(function (session) {
                                    return !_this.telegramService.isClientConnected(session.id)
                                        ? _this.telegramService.connectSession(session.id).catch(function (error) {
                                            _this.logger.warn("BroadcastOnce session ulanmadi: ".concat(session.id, " \u2014 ").concat(error.message));
                                        })
                                        : Promise.resolve();
                                }))];
                        case 2:
                            // 2. Ulash — PARALLEL (10+ session tezkor)
                            _h.sent();
                            connectedSessions = sessions.filter(function (s) {
                                return _this.telegramService.isClientConnected(s.id);
                            });
                            if (connectedSessions.length === 0) {
                                throw new Error('Hech bir session ulanmadi.');
                            }
                            groupSessionsMap = new Map();
                            sessionNames = new Map();
                            for (_i = 0, connectedSessions_3 = connectedSessions; _i < connectedSessions_3.length; _i++) {
                                session = connectedSessions_3[_i];
                                sessionNames.set(session.id, session.name || session.phone || 'Session');
                                for (_a = 0, _b = session.groups; _a < _b.length; _a++) {
                                    group = _b[_a];
                                    existing = groupSessionsMap.get(group.telegramId);
                                    if (existing) {
                                        if (!existing.sessions.includes(session.id)) {
                                            existing.sessions.push(session.id);
                                        }
                                    }
                                    else {
                                        groupSessionsMap.set(group.telegramId, {
                                            groupId: group.id,
                                            telegramId: group.telegramId,
                                            name: group.title || 'Nomsiz',
                                            sessions: [session.id],
                                        });
                                    }
                                }
                            }
                            allGroups = Array.from(groupSessionsMap.values());
                            if (allGroups.length === 0) {
                                throw new Error('Guruhlar topilmadi.');
                            }
                            shuffled = this.shuffleArray(__spreadArray([], allGroups, true));
                            progress = { sent: 0, failed: 0, skipped: 0 };
                            sentGroupIds = new Set();
                            totalGroups = shuffled.length;
                            sessionCount = connectedSessions.length;
                            // Cancel flag tozalash
                            this.broadcastOnceCancelled.delete(userId);
                            isCancelled = function () { return _this.broadcastOnceCancelled.has(userId); };
                            this.logger.log("\uD83D\uDCE2 BroadcastOnce boshlandi: ".concat(totalGroups, " guruh, ").concat(sessionCount, " session"));
                            emitProgress = function (status) {
                                if (status === void 0) { status = 'in_progress'; }
                                var payload = {
                                    status: status,
                                    sent: progress.sent,
                                    failed: progress.failed,
                                    skipped: progress.skipped,
                                    total: totalGroups,
                                    sessionCount: sessionCount,
                                    uniqueGroupsSent: sentGroupIds.size,
                                };
                                _this.broadcastOnceStatus.set(userId, __assign(__assign({ orderId: '' }, payload), { startedAt: Date.now() }));
                                if (onProgress) {
                                    onProgress(payload);
                                }
                            };
                            emitProgress('in_progress');
                            sentGroupDbIds = [];
                            retryGroups = [];
                            sessionSendCount = new Map();
                            for (_c = 0, connectedSessions_4 = connectedSessions; _c < connectedSessions_4.length; _c++) {
                                s = connectedSessions_4[_c];
                                sessionSendCount.set(s.id, 0);
                            }
                            pickBestSession = function (sessionIds) {
                                var connected = sessionIds.filter(function (id) { return _this.telegramService.isClientConnected(id); });
                                // Eng kam ishlatilganini birinchi qo'yish
                                connected.sort(function (a, b) { return (sessionSendCount.get(a) || 0) - (sessionSendCount.get(b) || 0); });
                                return connected;
                            };
                            deactivateGroupIds = [];
                            _loop_3 = function (i) {
                                var group, sent, slowmodeInfo, bannedCount, orderedSessions, _j, orderedSessions_1, sessionId, variedMessage, error_3, errorMsg, secMatch, waitSec, secMatch, waitSec;
                                return __generator(this, function (_k) {
                                    switch (_k.label) {
                                        case 0:
                                            if (isCancelled())
                                                return [2 /*return*/, "break"];
                                            group = shuffled[i];
                                            if (sentGroupIds.has(group.telegramId))
                                                return [2 /*return*/, "continue"];
                                            sent = false;
                                            slowmodeInfo = null;
                                            bannedCount = 0;
                                            orderedSessions = pickBestSession(group.sessions);
                                            _j = 0, orderedSessions_1 = orderedSessions;
                                            _k.label = 1;
                                        case 1:
                                            if (!(_j < orderedSessions_1.length)) return [3 /*break*/, 6];
                                            sessionId = orderedSessions_1[_j];
                                            if (sent)
                                                return [3 /*break*/, 6];
                                            _k.label = 2;
                                        case 2:
                                            _k.trys.push([2, 4, , 5]);
                                            variedMessage = this_2.addMessageVariation(content, i + Date.now() % 1000);
                                            return [4 /*yield*/, this_2.telegramService.sendMessage(sessionId, group.telegramId, variedMessage)];
                                        case 3:
                                            _k.sent();
                                            progress.sent++;
                                            sentGroupIds.add(group.telegramId);
                                            sentGroupDbIds.push(group.groupId);
                                            sessionSendCount.set(sessionId, (sessionSendCount.get(sessionId) || 0) + 1);
                                            sent = true;
                                            return [3 /*break*/, 5];
                                        case 4:
                                            error_3 = _k.sent();
                                            errorMsg = error_3.message || '';
                                            if (errorMsg.includes('SLOWMODE_WAIT') || errorMsg.includes('slowmode')) {
                                                secMatch = errorMsg.match(/(\d+)/);
                                                waitSec = secMatch ? parseInt(secMatch[1]) : 60;
                                                if (!slowmodeInfo || waitSec < slowmodeInfo.slowSec) {
                                                    slowmodeInfo = { sessionId: sessionId, slowSec: waitSec };
                                                }
                                                // Keyingi session bilan sinash
                                            }
                                            else if (errorMsg.includes('FLOOD_WAIT')) {
                                                secMatch = errorMsg.match(/(\d+)/);
                                                waitSec = secMatch ? parseInt(secMatch[1]) : 60;
                                                this_2.logger.warn("\uD83D\uDCE2 FLOOD_WAIT ".concat(waitSec, "s \u2014 session yukini oshirmaydi"));
                                                if (!slowmodeInfo || waitSec < slowmodeInfo.slowSec) {
                                                    slowmodeInfo = { sessionId: sessionId, slowSec: waitSec };
                                                }
                                            }
                                            else if (errorMsg.includes('USER_BANNED') ||
                                                errorMsg.includes('WRITE_FORBIDDEN') ||
                                                errorMsg.includes('CHANNEL_PRIVATE') ||
                                                errorMsg.includes('CHAT_ADMIN_REQUIRED') ||
                                                errorMsg.includes('CHANNEL_INVALID') ||
                                                errorMsg.includes('CHAT_RESTRICTED') ||
                                                errorMsg.includes('CHAT_SEND_PLAIN_FORBIDDEN') ||
                                                errorMsg.includes('CHAT_GUEST_SEND_FORBIDDEN')) {
                                                bannedCount++;
                                                return [3 /*break*/, 5];
                                            }
                                            else {
                                                progress.failed++;
                                                sent = true;
                                            }
                                            return [3 /*break*/, 5];
                                        case 5:
                                            _j++;
                                            return [3 /*break*/, 1];
                                        case 6:
                                            // Hech bir session yubora olmadi
                                            if (!sent) {
                                                if (slowmodeInfo && slowmodeInfo.slowSec <= 300) {
                                                    // SLOWMODE/FLOOD — retry uchun saqlash
                                                    retryGroups.push({
                                                        telegramId: group.telegramId,
                                                        groupId: group.groupId,
                                                        name: group.name,
                                                        failedSessionId: slowmodeInfo.sessionId,
                                                        otherSessions: group.sessions.filter(function (s) { return s !== slowmodeInfo.sessionId; }),
                                                        slowSec: slowmodeInfo.slowSec,
                                                    });
                                                }
                                                else if (bannedCount > 0 && bannedCount >= orderedSessions.length) {
                                                    // Barcha sessionlarda BAN — faqat skip (deactivate qilmaymiz, sync o'zi boshqaradi)
                                                    progress.skipped++;
                                                }
                                                else {
                                                    progress.skipped++;
                                                }
                                            }
                                            emitProgress('in_progress');
                                            if (!(i < shuffled.length - 1 && sent)) return [3 /*break*/, 8];
                                            return [4 /*yield*/, this_2.delay(this_2.getRandomDelay(BROADCAST_MIN_DELAY, BROADCAST_MAX_DELAY))];
                                        case 7:
                                            _k.sent();
                                            _k.label = 8;
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            };
                            this_2 = this;
                            i = 0;
                            _h.label = 3;
                        case 3:
                            if (!(i < shuffled.length)) return [3 /*break*/, 6];
                            return [5 /*yield**/, _loop_3(i)];
                        case 4:
                            state_1 = _h.sent();
                            if (state_1 === "break")
                                return [3 /*break*/, 6];
                            _h.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 3];
                        case 6:
                            // Barcha sessionlarda BAN/FORBIDDEN guruhlarni DB da isActive=false
                            if (deactivateGroupIds.length > 0) {
                                this.logger.warn("\uD83D\uDCE2 BroadcastOnce: ".concat(deactivateGroupIds.length, " ta guruh barcha sessionlarda BAN \u2014 isActive=false"));
                                this.prisma.group.updateMany({
                                    where: { id: { in: deactivateGroupIds } },
                                    data: { isActive: false },
                                }).catch(function () { });
                            }
                            this.logger.log("\uD83D\uDCE2 BroadcastOnce 1-pass: \u2705".concat(progress.sent, " \u23ED").concat(progress.skipped, " \u274C").concat(progress.failed, " / ").concat(totalGroups, ", retry=").concat(retryGroups.length));
                            if (!(retryGroups.length > 0 && !isCancelled())) return [3 /*break*/, 18];
                            sortedRetry = __spreadArray([], retryGroups, true).sort(function (a, b) { return a.slowSec - b.slowSec; });
                            minSec = ((_f = sortedRetry[0]) === null || _f === void 0 ? void 0 : _f.slowSec) || 30;
                            maxSec = ((_g = sortedRetry[sortedRetry.length - 1]) === null || _g === void 0 ? void 0 : _g.slowSec) || 60;
                            this.logger.log("\uD83D\uDCE2 BroadcastOnce RETRY: ".concat(retryGroups.length, " ta guruh (").concat(minSec, "-").concat(maxSec, "s slowmode)"));
                            emitProgress('in_progress');
                            retrySent = 0;
                            retrySkipped = 0;
                            retryStartTime = Date.now();
                            i = 0;
                            _h.label = 7;
                        case 7:
                            if (!(i < sortedRetry.length)) return [3 /*break*/, 17];
                            if (isCancelled()) {
                                progress.skipped += sortedRetry.length - i;
                                retrySkipped += sortedRetry.length - i;
                                return [3 /*break*/, 17];
                            }
                            rg = sortedRetry[i];
                            if (sentGroupIds.has(rg.telegramId))
                                return [3 /*break*/, 16];
                            elapsedMs = Date.now() - retryStartTime;
                            waitMs = Math.max(0, rg.slowSec * 1000 - elapsedMs + 3000);
                            if (waitMs > 300000) {
                                progress.skipped++;
                                retrySkipped++;
                                return [3 /*break*/, 16];
                            }
                            if (!(waitMs > 0)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.delay(waitMs)];
                        case 8:
                            _h.sent();
                            _h.label = 9;
                        case 9:
                            sent = false;
                            sessionsToTry = __spreadArray([rg.failedSessionId], rg.otherSessions, true);
                            _d = 0, sessionsToTry_1 = sessionsToTry;
                            _h.label = 10;
                        case 10:
                            if (!(_d < sessionsToTry_1.length)) return [3 /*break*/, 15];
                            sessionId = sessionsToTry_1[_d];
                            if (sent)
                                return [3 /*break*/, 15];
                            if (!this.telegramService.isClientConnected(sessionId))
                                return [3 /*break*/, 14];
                            _h.label = 11;
                        case 11:
                            _h.trys.push([11, 13, , 14]);
                            variedMessage = this.addMessageVariation(content, i + Date.now() % 1000);
                            return [4 /*yield*/, this.telegramService.sendMessage(sessionId, rg.telegramId, variedMessage)];
                        case 12:
                            _h.sent();
                            progress.sent++;
                            retrySent++;
                            sentGroupIds.add(rg.telegramId);
                            sentGroupDbIds.push(rg.groupId);
                            sent = true;
                            return [3 /*break*/, 14];
                        case 13:
                            _e = _h.sent();
                            return [3 /*break*/, 14];
                        case 14:
                            _d++;
                            return [3 /*break*/, 10];
                        case 15:
                            if (!sent) {
                                progress.skipped++;
                                retrySkipped++;
                            }
                            emitProgress('in_progress');
                            _h.label = 16;
                        case 16:
                            i++;
                            return [3 /*break*/, 7];
                        case 17:
                            this.logger.log("\uD83D\uDCE2 BroadcastOnce RETRY tugadi: \u2705".concat(retrySent, " \u23ED").concat(retrySkipped, " / ").concat(retryGroups.length));
                            _h.label = 18;
                        case 18:
                            // Batch DB update — bir marta barcha guruhlar uchun
                            if (sentGroupDbIds.length > 0) {
                                this.prisma.group.updateMany({
                                    where: { id: { in: sentGroupDbIds } },
                                    data: { lastPostAt: new Date() },
                                }).catch(function () { });
                            }
                            this.logger.log("\uD83D\uDCE2 BroadcastOnce tugadi: \u2705".concat(progress.sent, " \u274C").concat(progress.failed, " \u23ED").concat(progress.skipped, " / ").concat(totalGroups));
                            // Emit completed
                            emitProgress('completed');
                            // 60s keyin in-memory state tozalash
                            setTimeout(function () { return _this.broadcastOnceStatus.delete(userId); }, 60000);
                            return [2 /*return*/, {
                                    sent: progress.sent,
                                    failed: progress.failed,
                                    skipped: progress.skipped,
                                    total: totalGroups,
                                    sessionCount: sessionCount,
                                    uniqueGroupsSent: sentGroupIds.size,
                                }];
                    }
                });
            });
        };
        // ==================== MASTER/TOBE BROADCAST ====================
        /**
         * Master broadcast — barcha tobe'lar orqali tarqatish
         * Broadcast bot masterBroadcast ning to'liq logikasi
         */
        PostingService_1.prototype.masterBroadcast = function (masterUserId_1, message_1) {
            return __awaiter(this, arguments, void 0, function (masterUserId, message, safeMode, reportCallback) {
                var tobes, readyTobes, totalGroups, _loop_4, this_3, _i, readyTobes_1, tobe;
                var _this = this;
                if (safeMode === void 0) { safeMode = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany({
                                where: { masterId: masterUserId },
                                include: {
                                    sessions: {
                                        where: { status: 'ACTIVE', sessionString: { not: null } },
                                        include: {
                                            groups: { where: { isActive: true } },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            tobes = _a.sent();
                            if (tobes.length === 0) {
                                throw new Error('Sizga ulangan tobe akkauntlar yo\'q!');
                            }
                            readyTobes = tobes.filter(function (t) { return t.sessions.length > 0 && t.sessions.some(function (s) { return s.groups.length > 0; }); });
                            if (readyTobes.length === 0) {
                                throw new Error("Tayyor tobe akkauntlar yo'q!\n" +
                                    "Jami tobe'lar: ".concat(tobes.length, " ta\n") +
                                    "Tobe'lar session ulashi va guruhlar tanlashi kerak.");
                            }
                            totalGroups = readyTobes.reduce(function (sum, t) { return sum + t.sessions.reduce(function (s, sess) { return s + sess.groups.length; }, 0); }, 0);
                            _loop_4 = function (tobe) {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: 
                                        // broadcastMessage yangilash
                                        return [4 /*yield*/, this_3.prisma.user.update({
                                                where: { id: tobe.id },
                                                data: { broadcastMessage: message },
                                            })];
                                        case 1:
                                            // broadcastMessage yangilash
                                            _b.sent();
                                            // slaveBroadcast async ishga tushirish
                                            this_3.slaveBroadcast(tobe.id, message, safeMode, reportCallback).catch(function (err) {
                                                _this.logger.error("Slave broadcast xatolik (".concat(tobe.id, "): ").concat(err.message));
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_3 = this;
                            _i = 0, readyTobes_1 = readyTobes;
                            _a.label = 2;
                        case 2:
                            if (!(_i < readyTobes_1.length)) return [3 /*break*/, 5];
                            tobe = readyTobes_1[_i];
                            return [5 /*yield**/, _loop_4(tobe)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, {
                                readyCount: readyTobes.length,
                                totalSlaves: tobes.length,
                                totalGroups: totalGroups,
                            }];
                    }
                });
            });
        };
        /**
         * Slave broadcast — bitta tobe uchun cheksiz tarqatish
         * Broadcast bot startSlaveBroadcast ning to'liq logikasi
         */
        PostingService_1.prototype.slaveBroadcast = function (slaveUserId_1, message_1) {
            return __awaiter(this, arguments, void 0, function (slaveUserId, message, safeMode, reportCallback) {
                var pauseMinutes, minDelay, maxDelay, broadcastId, roundCount, totalSent, totalFailed, isActive, sessions, _i, sessions_2, session, err_1, sent, failed, roundStart, _loop_5, this_4, _a, sessions_3, session, state_2, duration, m, error_4;
                var _this = this;
                if (safeMode === void 0) { safeMode = false; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            pauseMinutes = safeMode ? 10 : 5;
                            minDelay = safeMode ? SAFE_MIN_DELAY : NORMAL_MIN_DELAY;
                            maxDelay = safeMode ? SAFE_MAX_DELAY : NORMAL_MAX_DELAY;
                            broadcastId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                            this.activeBroadcasts.set(slaveUserId, broadcastId);
                            roundCount = 0;
                            totalSent = 0;
                            totalFailed = 0;
                            this.logger.log("[SLAVE ".concat(slaveUserId, "] Broadcast ").concat(broadcastId, " boshlandi (").concat(safeMode ? 'SAFE' : 'NORMAL', ")"));
                            isActive = function () { return _this.activeBroadcasts.get(slaveUserId) === broadcastId; };
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 18, , 19]);
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: { userId: slaveUserId, status: 'ACTIVE', sessionString: { not: null } },
                                    include: { groups: { where: { isActive: true } } },
                                })];
                        case 2:
                            sessions = _b.sent();
                            if (sessions.length === 0) {
                                this.logger.warn("[SLAVE ".concat(slaveUserId, "] Session topilmadi"));
                                return [2 /*return*/, { totalRounds: 0, totalSent: 0, totalFailed: 0 }];
                            }
                            _i = 0, sessions_2 = sessions;
                            _b.label = 3;
                        case 3:
                            if (!(_i < sessions_2.length)) return [3 /*break*/, 8];
                            session = sessions_2[_i];
                            if (!!this.telegramService.isClientConnected(session.id)) return [3 /*break*/, 7];
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, this.telegramService.connectSession(session.id)];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            err_1 = _b.sent();
                            this.logger.warn("[SLAVE ".concat(slaveUserId, "] Session ulanmadi: ").concat(session.id));
                            return [3 /*break*/, 7];
                        case 7:
                            _i++;
                            return [3 /*break*/, 3];
                        case 8:
                            if (!isActive()) return [3 /*break*/, 17];
                            roundCount++;
                            sent = 0;
                            failed = 0;
                            roundStart = Date.now();
                            this.logger.log("[SLAVE ".concat(slaveUserId, "] Round ").concat(roundCount, " boshlandi"));
                            _loop_5 = function (session) {
                                var sessionBlocked, groupsToSend, gi, group, slowKey, variedMessage, err_2, errMsg, waitSec, maxWait, slowMatch, slowSec;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!isActive())
                                                return [2 /*return*/, "break"];
                                            if (!this_4.telegramService.isClientConnected(session.id))
                                                return [2 /*return*/, "continue"];
                                            sessionBlocked = this_4.blockedGroups.get(session.id) || new Set();
                                            groupsToSend = session.groups.filter(function (g) { return !sessionBlocked.has(g.telegramId); });
                                            gi = 0;
                                            _c.label = 1;
                                        case 1:
                                            if (!(gi < this_4.shuffleArray(__spreadArray([], groupsToSend, true)).length)) return [3 /*break*/, 8];
                                            if (!isActive())
                                                return [3 /*break*/, 8];
                                            group = groupsToSend[gi];
                                            slowKey = "".concat(session.id, ":").concat(group.telegramId);
                                            if (!this_4.isSlowmodeExpired(slowKey))
                                                return [3 /*break*/, 7];
                                            _c.label = 2;
                                        case 2:
                                            _c.trys.push([2, 4, , 5]);
                                            variedMessage = this_4.addMessageVariation(message, gi + Date.now() % 1000);
                                            return [4 /*yield*/, this_4.telegramService.sendMessage(session.id, group.telegramId, variedMessage)];
                                        case 3:
                                            _c.sent();
                                            sent++;
                                            return [3 /*break*/, 5];
                                        case 4:
                                            err_2 = _c.sent();
                                            errMsg = err_2.message || '';
                                            // Bloklash logikasi (doimiy block)
                                            if (errMsg.includes('WRITE_FORBIDDEN') ||
                                                errMsg.includes('USER_BANNED') ||
                                                errMsg.includes('CHANNEL_PRIVATE') ||
                                                errMsg.includes('CHAT_ADMIN_REQUIRED') ||
                                                errMsg.includes('need to add') ||
                                                errMsg.includes('ADD_USER') ||
                                                errMsg.includes('INVITE')) {
                                                this_4.blockGroup(session.id, group.telegramId);
                                            }
                                            else if (errMsg.startsWith('FLOOD_WAIT:')) {
                                                waitSec = parseInt(errMsg.split(':')[1]) || 60;
                                                maxWait = safeMode ? SAFE_FLOOD_MAX_WAIT : NORMAL_FLOOD_MAX_WAIT;
                                                if (waitSec > maxWait) {
                                                    this_4.blockGroup(session.id, group.telegramId);
                                                }
                                                // FLOOD = SKIP
                                            }
                                            else if (errMsg.includes('SLOWMODE_WAIT') || errMsg.includes('slowmode')) {
                                                slowMatch = errMsg.match(/(\d+)/);
                                                slowSec = slowMatch ? parseInt(slowMatch[1]) : 300;
                                                this_4.markSlowmode(slowKey, slowSec);
                                            }
                                            else if (errMsg.includes('SESSION_DEAD')) {
                                                this_4.logger.error("[SLAVE ".concat(slaveUserId, "] Session o'lgan: ").concat(session.id));
                                                return [3 /*break*/, 8];
                                            }
                                            failed++;
                                            return [3 /*break*/, 5];
                                        case 5: 
                                        // Delay (avvalgidek)
                                        return [4 /*yield*/, this_4.delay(this_4.getRandomDelay(minDelay, maxDelay))];
                                        case 6:
                                            // Delay (avvalgidek)
                                            _c.sent();
                                            _c.label = 7;
                                        case 7:
                                            gi++;
                                            return [3 /*break*/, 1];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            };
                            this_4 = this;
                            _a = 0, sessions_3 = sessions;
                            _b.label = 9;
                        case 9:
                            if (!(_a < sessions_3.length)) return [3 /*break*/, 12];
                            session = sessions_3[_a];
                            return [5 /*yield**/, _loop_5(session)];
                        case 10:
                            state_2 = _b.sent();
                            if (state_2 === "break")
                                return [3 /*break*/, 12];
                            _b.label = 11;
                        case 11:
                            _a++;
                            return [3 /*break*/, 9];
                        case 12:
                            duration = Math.round((Date.now() - roundStart) / 1000);
                            totalSent += sent;
                            totalFailed += failed;
                            this.logger.log("[SLAVE ".concat(slaveUserId, "] Round ").concat(roundCount, " tugadi: sent=").concat(sent, ", failed=").concat(failed, ", ").concat(duration, "s"));
                            // Masterga round hisoboti
                            if (reportCallback) {
                                reportCallback("\uD83D\uDCCA Tobe ".concat(roundCount, "-raund\n\n") +
                                    "\uD83D\uDCE4 Yuborildi: ".concat(sent, "\n") +
                                    "\u274C Xato: ".concat(failed, "\n") +
                                    "\u23F1 ".concat(duration, " sek\n") +
                                    "\u23F3 Keyingi: ".concat(pauseMinutes, " daq"));
                            }
                            if (!isActive())
                                return [3 /*break*/, 17];
                            m = 0;
                            _b.label = 13;
                        case 13:
                            if (!(m < pauseMinutes)) return [3 /*break*/, 16];
                            if (!isActive())
                                return [3 /*break*/, 16];
                            return [4 /*yield*/, this.delay(60000)];
                        case 14:
                            _b.sent();
                            _b.label = 15;
                        case 15:
                            m++;
                            return [3 /*break*/, 13];
                        case 16: return [3 /*break*/, 8];
                        case 17: return [3 /*break*/, 19];
                        case 18:
                            error_4 = _b.sent();
                            this.logger.error("[SLAVE ".concat(slaveUserId, "] Broadcast xatolik: ").concat(error_4.message));
                            return [3 /*break*/, 19];
                        case 19:
                            // Tozalash
                            if (isActive()) {
                                this.activeBroadcasts.delete(slaveUserId);
                            }
                            this.logger.log("[SLAVE ".concat(slaveUserId, "] Broadcast ").concat(broadcastId, " to'xtatildi. Roundlar: ").concat(roundCount));
                            return [2 /*return*/, { totalRounds: roundCount, totalSent: totalSent, totalFailed: totalFailed }];
                    }
                });
            });
        };
        /**
         * Master barcha tobe'larni to'xtatish
         */
        PostingService_1.prototype.stopAllSlaves = function (masterUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var tobes, stoppedCount, _i, tobes_1, tobe, masterJobs, _a, masterJobs_1, job;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany({
                                where: { masterId: masterUserId },
                                select: { id: true },
                            })];
                        case 1:
                            tobes = _b.sent();
                            stoppedCount = 0;
                            for (_i = 0, tobes_1 = tobes; _i < tobes_1.length; _i++) {
                                tobe = tobes_1[_i];
                                if (this.activeBroadcasts.has(tobe.id)) {
                                    this.activeBroadcasts.delete(tobe.id);
                                    stoppedCount++;
                                }
                            }
                            masterJobs = this.getUserJobs(masterUserId);
                            for (_a = 0, masterJobs_1 = masterJobs; _a < masterJobs_1.length; _a++) {
                                job = masterJobs_1[_a];
                                if (job.status === 'running' || job.status === 'paused') {
                                    this.stopJob(job.id);
                                    stoppedCount++;
                                }
                            }
                            return [2 /*return*/, stoppedCount];
                    }
                });
            });
        };
        /**
         * Slave broadcast faolmi
         */
        PostingService_1.prototype.isSlaveBroadcasting = function (slaveUserId) {
            return this.activeBroadcasts.has(slaveUserId);
        };
        /**
         * BroadcastOnce ni to'xtatish (user dan cancel)
         */
        PostingService_1.prototype.cancelBroadcastOnce = function (userId) {
            this.broadcastOnceCancelled.add(userId);
            this.broadcastOnceStatus.delete(userId);
            this.logger.log("\uD83D\uDCE2 BroadcastOnce CANCEL: userId=".concat(userId));
            return true;
        };
        /**
         * BroadcastOnce faol holatini olish (mobile reconnect uchun)
         */
        PostingService_1.prototype.getBroadcastOnceStatus = function (userId) {
            return this.broadcastOnceStatus.get(userId) || null;
        };
        /**
         * BroadcastOnce orderId ni to'ldirish (orders.controller dan)
         */
        PostingService_1.prototype.setBroadcastOnceOrderId = function (userId, orderId) {
            var state = this.broadcastOnceStatus.get(userId);
            if (state) {
                state.orderId = orderId;
            }
        };
        // ==================== UTILITY ====================
        PostingService_1.prototype.getRandomDelay = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        PostingService_1.prototype.shuffleArray = function (array) {
            var _a;
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
            }
            return array;
        };
        PostingService_1.prototype.delay = function (ms) {
            return new Promise(function (resolve) { return setTimeout(resolve, ms); });
        };
        /**
         * Yuborilgan xabar ID ni PostHistory ga saqlash (o'chirish uchun)
         */
        PostingService_1.prototype.savePostHistory = function (job, group, messageId) {
            return __awaiter(this, void 0, void 0, function () {
                var postId, post;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            postId = (_a = job.postIds) === null || _a === void 0 ? void 0 : _a.get(group.sessionId);
                            if (!!postId) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.post.create({
                                    data: {
                                        adId: job.adId,
                                        userId: job.userId,
                                        sessionId: group.sessionId,
                                        status: 'IN_PROGRESS',
                                        totalGroups: job.totalGroups,
                                        startedAt: job.startTime,
                                    },
                                })];
                        case 1:
                            post = _b.sent();
                            postId = post.id;
                            if (!job.postIds)
                                job.postIds = new Map();
                            job.postIds.set(group.sessionId, postId);
                            _b.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.postHistory.create({
                                data: {
                                    postId: postId,
                                    groupId: group.id,
                                    userId: job.userId,
                                    messageId: messageId,
                                    status: 'SENT',
                                    sentAt: new Date(),
                                },
                            })];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Safe onProgress chaqirish
         */
        PostingService_1.prototype.emitProgress = function (job) {
            var _a;
            try {
                (_a = job.onProgress) === null || _a === void 0 ? void 0 : _a.call(job);
            }
            catch (err) {
                this.logger.warn("onProgress xatolik: ".concat(err));
            }
        };
        // ==================== JOB MANAGEMENT ====================
        PostingService_1.prototype.getJob = function (jobId) {
            return this.activeJobs.get(jobId);
        };
        PostingService_1.prototype.getUserJobs = function (userId) {
            return Array.from(this.activeJobs.values()).filter(function (j) { return j.userId === userId; });
        };
        PostingService_1.prototype.stopJob = function (jobId) {
            var job = this.activeJobs.get(jobId);
            if (job) {
                job.stopRequested = true;
                this.logger.log("\u23F9 To'xtatish so'raldi: ".concat(jobId));
            }
        };
        PostingService_1.prototype.pauseJob = function (jobId) {
            var job = this.activeJobs.get(jobId);
            if (job) {
                job.pauseRequested = true;
                job.status = 'paused';
                this.logger.log("\u23F8 Pauza so'raldi: ".concat(jobId));
            }
        };
        PostingService_1.prototype.resumeJob = function (jobId) {
            var job = this.activeJobs.get(jobId);
            if (job) {
                job.pauseRequested = false;
                job.status = 'running';
                this.logger.log("\u25B6 Davom ettirildi: ".concat(jobId));
            }
        };
        PostingService_1.prototype.getJobLogs = function (jobId) {
            var job = this.activeJobs.get(jobId);
            return (job === null || job === void 0 ? void 0 : job.logs) || [];
        };
        PostingService_1.prototype.getJobStats = function (jobId) {
            var job = this.activeJobs.get(jobId);
            if (!job)
                return undefined;
            var duration = job.endTime
                ? job.endTime.getTime() - job.startTime.getTime()
                : Date.now() - job.startTime.getTime();
            var totalAttempts = job.postedGroups + job.failedGroups;
            var perSessionStats = Array.from(job.perSessionStats.entries()).map(function (_a) {
                var id = _a[0], s = _a[1];
                return (__assign({ id: id }, s));
            });
            return {
                totalGroups: job.totalGroups,
                postedGroups: job.postedGroups,
                failedGroups: job.failedGroups,
                skippedGroups: job.skippedGroups,
                roundsCompleted: job.roundsCompleted,
                currentRound: job.currentRound,
                duration: duration,
                successRate: totalAttempts > 0 ? (job.postedGroups / totalAttempts) * 100 : 0,
                status: job.status,
                safeMode: job.safeMode,
                blockedGroups: this.getBlockedCount(),
                nextRoundAt: job.nextRoundAt,
                perSessionStats: perSessionStats,
            };
        };
        /**
         * Job ga onProgress callback o'rnatish
         */
        PostingService_1.prototype.setJobProgressCallback = function (jobId, callback) {
            var job = this.activeJobs.get(jobId);
            if (job) {
                job.onProgress = callback;
            }
        };
        PostingService_1.prototype.cleanupJob = function (jobId) {
            var timer = this.jobTimers.get(jobId);
            if (timer) {
                clearTimeout(timer);
                this.jobTimers.delete(jobId);
            }
            this.activeJobs.delete(jobId);
            this.logger.log("\uD83D\uDDD1 Job tozalandi: ".concat(jobId));
        };
        return PostingService_1;
    }());
    __setFunctionName(_classThis, "PostingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PostingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PostingService = _classThis;
}();
exports.PostingService = PostingService;
