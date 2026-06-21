"use strict";
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
exports.AnalyticsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var AnalyticsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AnalyticsService = _classThis = /** @class */ (function () {
        function AnalyticsService_1(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
            this.logger = new common_1.Logger(AnalyticsService.name);
        }
        AnalyticsService_1.prototype.getDashboardStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.redis.getOrSet('analytics:dashboard', function () { return _this._getDashboardStats(); }, 120)];
                });
            });
        };
        AnalyticsService_1.prototype._getDashboardStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalUsers, activeUsers, totalAds, activeAds, totalPosts, completedPosts, totalRevenue, pendingPayments, successRate;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.count(),
                                this.prisma.user.count({ where: { isActive: true } }),
                                this.prisma.ad.count(),
                                this.prisma.ad.count({ where: { status: client_1.AdStatus.ACTIVE } }),
                                this.prisma.post.count(),
                                this.prisma.post.count({ where: { status: client_1.PostStatus.COMPLETED } }),
                                this.prisma.payment.aggregate({
                                    _sum: { amount: true },
                                    where: { status: client_1.PaymentStatus.APPROVED },
                                }),
                                this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PENDING } }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalUsers = _a[0], activeUsers = _a[1], totalAds = _a[2], activeAds = _a[3], totalPosts = _a[4], completedPosts = _a[5], totalRevenue = _a[6], pendingPayments = _a[7];
                            successRate = totalPosts > 0
                                ? Math.round((completedPosts / totalPosts) * 100)
                                : 0;
                            return [2 /*return*/, {
                                    totalUsers: totalUsers,
                                    activeUsers: activeUsers,
                                    totalAds: totalAds,
                                    activeAds: activeAds,
                                    totalPosts: totalPosts,
                                    completedPosts: completedPosts,
                                    successRate: successRate,
                                    totalRevenue: totalRevenue._sum.amount || 0,
                                    pendingPayments: pendingPayments,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getUserStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var dateFilter, _a, totalUsers, newUsers, activeUsers, prevFilter, prevNewUsers, growth;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            dateFilter = this.buildDateFilter(startDate, endDate);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.count(),
                                    this.prisma.user.count({
                                        where: { createdAt: dateFilter },
                                    }),
                                    this.prisma.user.count({
                                        where: { isActive: true, createdAt: dateFilter },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalUsers = _a[0], newUsers = _a[1], activeUsers = _a[2];
                            prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
                            return [4 /*yield*/, this.prisma.user.count({
                                    where: { createdAt: prevFilter },
                                })];
                        case 2:
                            prevNewUsers = _b.sent();
                            growth = prevNewUsers > 0
                                ? Math.round(((newUsers - prevNewUsers) / prevNewUsers) * 1000) / 10
                                : 0;
                            return [2 /*return*/, {
                                    totalUsers: totalUsers,
                                    newUsers: newUsers,
                                    activeUsers: activeUsers,
                                    growth: growth,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getAdStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var dateFilter, _a, totalAds, activeAds, closedAds, newAds, prevFilter, prevNewAds, growth;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            dateFilter = this.buildDateFilter(startDate, endDate);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.ad.count(),
                                    this.prisma.ad.count({ where: { status: client_1.AdStatus.ACTIVE } }),
                                    this.prisma.ad.count({ where: { status: client_1.AdStatus.CLOSED } }),
                                    this.prisma.ad.count({ where: { createdAt: dateFilter } }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalAds = _a[0], activeAds = _a[1], closedAds = _a[2], newAds = _a[3];
                            prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
                            return [4 /*yield*/, this.prisma.ad.count({
                                    where: { createdAt: prevFilter },
                                })];
                        case 2:
                            prevNewAds = _b.sent();
                            growth = prevNewAds > 0
                                ? Math.round(((newAds - prevNewAds) / prevNewAds) * 1000) / 10
                                : 0;
                            return [2 /*return*/, {
                                    totalAds: totalAds,
                                    activeAds: activeAds,
                                    closedAds: closedAds,
                                    newAds: newAds,
                                    growth: growth,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getPostStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var dateFilter, _a, totalPosts, completedPosts, failedPosts, newPosts, successRate;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            dateFilter = this.buildDateFilter(startDate, endDate);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.post.count(),
                                    this.prisma.post.count({ where: { status: client_1.PostStatus.COMPLETED } }),
                                    this.prisma.post.count({ where: { status: client_1.PostStatus.FAILED } }),
                                    this.prisma.post.count({ where: { createdAt: dateFilter } }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalPosts = _a[0], completedPosts = _a[1], failedPosts = _a[2], newPosts = _a[3];
                            successRate = totalPosts > 0
                                ? Math.round((completedPosts / totalPosts) * 100)
                                : 0;
                            return [2 /*return*/, {
                                    totalPosts: totalPosts,
                                    completedPosts: completedPosts,
                                    failedPosts: failedPosts,
                                    newPosts: newPosts,
                                    successRate: successRate,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getRevenueStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var dateFilter, _a, totalRevenue, periodRevenue, pendingRevenue, prevFilter, prevRevenue, currentAmount, prevAmount, growth;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            dateFilter = this.buildDateFilter(startDate, endDate);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.payment.aggregate({
                                        _sum: { amount: true },
                                        where: { status: client_1.PaymentStatus.APPROVED },
                                    }),
                                    this.prisma.payment.aggregate({
                                        _sum: { amount: true },
                                        where: {
                                            status: client_1.PaymentStatus.APPROVED,
                                            createdAt: dateFilter,
                                        },
                                    }),
                                    this.prisma.payment.aggregate({
                                        _sum: { amount: true },
                                        where: { status: client_1.PaymentStatus.PENDING },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalRevenue = _a[0], periodRevenue = _a[1], pendingRevenue = _a[2];
                            prevFilter = this.buildPrevPeriodFilter(startDate, endDate);
                            return [4 /*yield*/, this.prisma.payment.aggregate({
                                    _sum: { amount: true },
                                    where: {
                                        status: client_1.PaymentStatus.APPROVED,
                                        createdAt: prevFilter,
                                    },
                                })];
                        case 2:
                            prevRevenue = _b.sent();
                            currentAmount = periodRevenue._sum.amount || 0;
                            prevAmount = prevRevenue._sum.amount || 0;
                            growth = prevAmount > 0
                                ? Math.round(((currentAmount - prevAmount) / prevAmount) * 1000) / 10
                                : 0;
                            return [2 /*return*/, {
                                    totalRevenue: totalRevenue._sum.amount || 0,
                                    periodRevenue: currentAmount,
                                    pendingRevenue: pendingRevenue._sum.amount || 0,
                                    growth: growth,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getGrowthTrends = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, userStats, adStats, revenueStats;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.getUserStats(startDate, endDate),
                                this.getAdStats(startDate, endDate),
                                this.getRevenueStats(startDate, endDate),
                            ])];
                        case 1:
                            _a = _b.sent(), userStats = _a[0], adStats = _a[1], revenueStats = _a[2];
                            return [2 /*return*/, {
                                    users: { growth: userStats.growth, newUsers: userStats.newUsers },
                                    ads: { growth: adStats.growth, newAds: adStats.newAds },
                                    revenue: { growth: revenueStats.growth, periodRevenue: revenueStats.periodRevenue },
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.generateDailyStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var today, _a, totalUsers, activeUsers, newUsers, totalAds, activeAds, closedAds, totalPosts, successfulPosts, failedPosts, revenue, pendingRevenue;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.count(),
                                    this.prisma.user.count({ where: { isActive: true } }),
                                    this.prisma.user.count({ where: { createdAt: { gte: today } } }),
                                    this.prisma.ad.count(),
                                    this.prisma.ad.count({ where: { status: client_1.AdStatus.ACTIVE } }),
                                    this.prisma.ad.count({ where: { status: client_1.AdStatus.CLOSED, soldAt: { gte: today } } }),
                                    this.prisma.post.count({ where: { createdAt: { gte: today } } }),
                                    this.prisma.post.count({ where: { status: client_1.PostStatus.COMPLETED, createdAt: { gte: today } } }),
                                    this.prisma.post.count({ where: { status: client_1.PostStatus.FAILED, createdAt: { gte: today } } }),
                                    this.prisma.payment.aggregate({
                                        _sum: { amount: true },
                                        where: { status: client_1.PaymentStatus.APPROVED, createdAt: { gte: today } },
                                    }),
                                    this.prisma.payment.aggregate({
                                        _sum: { amount: true },
                                        where: { status: client_1.PaymentStatus.PENDING },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalUsers = _a[0], activeUsers = _a[1], newUsers = _a[2], totalAds = _a[3], activeAds = _a[4], closedAds = _a[5], totalPosts = _a[6], successfulPosts = _a[7], failedPosts = _a[8], revenue = _a[9], pendingRevenue = _a[10];
                            return [4 /*yield*/, this.prisma.systemStatistics.upsert({
                                    where: { id: "stats-".concat(today.toISOString().split('T')[0]) },
                                    update: {
                                        totalUsers: totalUsers,
                                        activeUsers: activeUsers,
                                        newUsers: newUsers,
                                        totalAds: totalAds,
                                        activeAds: activeAds,
                                        closedAds: closedAds,
                                        totalPosts: totalPosts,
                                        successfulPosts: successfulPosts,
                                        failedPosts: failedPosts,
                                        totalRevenue: revenue._sum.amount || 0,
                                        pendingRevenue: pendingRevenue._sum.amount || 0,
                                    },
                                    create: {
                                        id: "stats-".concat(today.toISOString().split('T')[0]),
                                        date: today,
                                        totalUsers: totalUsers,
                                        activeUsers: activeUsers,
                                        newUsers: newUsers,
                                        totalAds: totalAds,
                                        activeAds: activeAds,
                                        closedAds: closedAds,
                                        totalPosts: totalPosts,
                                        successfulPosts: successfulPosts,
                                        failedPosts: failedPosts,
                                        totalRevenue: revenue._sum.amount || 0,
                                        pendingRevenue: pendingRevenue._sum.amount || 0,
                                    },
                                })];
                        case 2:
                            _b.sent();
                            this.logger.log('Daily statistics generated');
                            return [2 /*return*/];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.buildDateFilter = function (startDate, endDate) {
            if (!startDate && !endDate) {
                var thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return { gte: thirtyDaysAgo };
            }
            var filter = {};
            if (startDate)
                filter.gte = new Date(startDate);
            if (endDate) {
                var end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.lte = end;
            }
            return filter;
        };
        AnalyticsService_1.prototype.buildPrevPeriodFilter = function (startDate, endDate) {
            var start = startDate ? new Date(startDate) : new Date();
            var end = endDate ? new Date(endDate) : new Date();
            if (!startDate) {
                start.setDate(start.getDate() - 30);
            }
            var duration = end.getTime() - start.getTime();
            var prevEnd = new Date(start.getTime());
            var prevStart = new Date(start.getTime() - duration);
            return { gte: prevStart, lte: prevEnd };
        };
        return AnalyticsService_1;
    }());
    __setFunctionName(_classThis, "AnalyticsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsService = _classThis;
}();
exports.AnalyticsService = AnalyticsService;
