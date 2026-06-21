"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.SchedulerService = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var SchedulerService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleScheduledAds_decorators;
    var _handleExpiredSubscriptions_decorators;
    var _handleExpiredPayments_decorators;
    var _handleDailyStats_decorators;
    var _handleFrozenSessions_decorators;
    var SchedulerService = _classThis = /** @class */ (function () {
        function SchedulerService_1(prisma, postsService, subscriptionsService, paymentsService, analyticsService, sessionsService) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.postsService = postsService;
            this.subscriptionsService = subscriptionsService;
            this.paymentsService = paymentsService;
            this.analyticsService = analyticsService;
            this.sessionsService = sessionsService;
            this.logger = new common_1.Logger(SchedulerService.name);
        }
        SchedulerService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.logger.log('Scheduler initialized');
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Check scheduled ads - every minute
         */
        SchedulerService_1.prototype.handleScheduledAds = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, scheduledAds, _i, scheduledAds_1, ad, user, post, error_1, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 12, , 13]);
                            now = new Date();
                            return [4 /*yield*/, this.prisma.ad.findMany({
                                    where: {
                                        isScheduled: true,
                                        scheduledFor: { lte: now },
                                        status: { in: ['ACTIVE', 'PAUSED'] },
                                    },
                                })];
                        case 1:
                            scheduledAds = _a.sent();
                            _i = 0, scheduledAds_1 = scheduledAds;
                            _a.label = 2;
                        case 2:
                            if (!(_i < scheduledAds_1.length)) return [3 /*break*/, 11];
                            ad = scheduledAds_1[_i];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: ad.userId },
                                })];
                        case 3:
                            user = _a.sent();
                            if (!user)
                                return [3 /*break*/, 10];
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 8, , 10]);
                            return [4 /*yield*/, this.prisma.post.create({
                                    data: {
                                        adId: ad.id,
                                        userId: ad.userId,
                                        sessionId: ad.sessionId || '',
                                        totalGroups: 0,
                                        status: 'PENDING',
                                    },
                                })];
                        case 5:
                            post = _a.sent();
                            return [4 /*yield*/, this.postsService.startDistribution(post.id)];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: ad.id },
                                    data: {
                                        status: 'ACTIVE',
                                        lastScheduledAt: new Date(),
                                    },
                                })];
                        case 7:
                            _a.sent();
                            this.logger.log("Scheduled ad ".concat(ad.id, " posted"));
                            return [3 /*break*/, 10];
                        case 8:
                            error_1 = _a.sent();
                            this.logger.error("Failed to post scheduled ad ".concat(ad.id, ":"), error_1);
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: ad.id },
                                    data: { status: 'PAUSED', lastError: error_1.message },
                                })];
                        case 9:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 10:
                            _i++;
                            return [3 /*break*/, 2];
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            error_2 = _a.sent();
                            this.logger.error('Scheduled ads cron error:', error_2);
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Check expired subscriptions - every hour
         */
        SchedulerService_1.prototype.handleExpiredSubscriptions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var count, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.subscriptionsService.checkExpired()];
                        case 1:
                            count = _a.sent();
                            if (count > 0) {
                                this.logger.log("Expired ".concat(count, " subscriptions"));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error('Subscription expiry check failed:', error_3);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Expire old pending payments - every 6 hours
         */
        SchedulerService_1.prototype.handleExpiredPayments = function () {
            return __awaiter(this, void 0, void 0, function () {
                var count, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.paymentsService.expirePending(48)];
                        case 1:
                            count = _a.sent();
                            if (count > 0) {
                                this.logger.log("Expired ".concat(count, " pending payments"));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error('Payment expiry check failed:', error_4);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Generate daily statistics - every day at midnight
         */
        SchedulerService_1.prototype.handleDailyStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.analyticsService.generateDailyStats()];
                        case 1:
                            _a.sent();
                            this.logger.log('Daily statistics generated');
                            return [3 /*break*/, 3];
                        case 2:
                            error_5 = _a.sent();
                            this.logger.error('Daily stats generation failed:', error_5);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cleanup frozen sessions - every day at 3 AM
         */
        SchedulerService_1.prototype.handleFrozenSessions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var count, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.sessionsService.cleanupFrozenSessions(7)];
                        case 1:
                            count = _a.sent();
                            if (count > 0) {
                                this.logger.log("Unfroze ".concat(count, " old frozen sessions"));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            this.logger.error('Frozen session cleanup failed:', error_6);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return SchedulerService_1;
    }());
    __setFunctionName(_classThis, "SchedulerService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleScheduledAds_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE)];
        _handleExpiredSubscriptions_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR)];
        _handleExpiredPayments_decorators = [(0, schedule_1.Cron)('0 */6 * * *')];
        _handleDailyStats_decorators = [(0, schedule_1.Cron)('0 0 * * *')];
        _handleFrozenSessions_decorators = [(0, schedule_1.Cron)('0 3 * * *')];
        __esDecorate(_classThis, null, _handleScheduledAds_decorators, { kind: "method", name: "handleScheduledAds", static: false, private: false, access: { has: function (obj) { return "handleScheduledAds" in obj; }, get: function (obj) { return obj.handleScheduledAds; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleExpiredSubscriptions_decorators, { kind: "method", name: "handleExpiredSubscriptions", static: false, private: false, access: { has: function (obj) { return "handleExpiredSubscriptions" in obj; }, get: function (obj) { return obj.handleExpiredSubscriptions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleExpiredPayments_decorators, { kind: "method", name: "handleExpiredPayments", static: false, private: false, access: { has: function (obj) { return "handleExpiredPayments" in obj; }, get: function (obj) { return obj.handleExpiredPayments; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleDailyStats_decorators, { kind: "method", name: "handleDailyStats", static: false, private: false, access: { has: function (obj) { return "handleDailyStats" in obj; }, get: function (obj) { return obj.handleDailyStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleFrozenSessions_decorators, { kind: "method", name: "handleFrozenSessions", static: false, private: false, access: { has: function (obj) { return "handleFrozenSessions" in obj; }, get: function (obj) { return obj.handleFrozenSessions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SchedulerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SchedulerService = _classThis;
}();
exports.SchedulerService = SchedulerService;
