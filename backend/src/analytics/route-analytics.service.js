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
exports.RouteAnalyticsService = void 0;
var common_1 = require("@nestjs/common");
var RouteAnalyticsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RouteAnalyticsService = _classThis = /** @class */ (function () {
        function RouteAnalyticsService_1(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
            this.logger = new common_1.Logger(RouteAnalyticsService.name);
        }
        /**
         * Task 3: Top yo'nalishlar
         */
        RouteAnalyticsService_1.prototype.getTopRoutes = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, limit) {
                var cacheKey, cached, _a, where, end, routes, result, _b;
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:top_routes:".concat(dateFrom || 'all', ":").concat(dateTo || 'all', ":").concat(limit);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {
                                cargoFrom: { not: null },
                                cargoTo: { not: null },
                            };
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['cargoFrom', 'cargoTo'],
                                    where: where,
                                    _count: { id: true },
                                    _avg: { distance: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: limit,
                                })];
                        case 5:
                            routes = _c.sent();
                            result = routes.map(function (r, i) { return ({
                                rank: i + 1,
                                from: r.cargoFrom,
                                to: r.cargoTo,
                                count: r._count.id,
                                avgDistance: Math.round(r._avg.distance || 0),
                            }); });
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Task 6: Mashina turi statistikasi
         */
        RouteAnalyticsService_1.prototype.getVehicleTypeStats = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, where, end, stats, total, result, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:vehicle_stats:".concat(dateFrom || 'all', ":").concat(dateTo || 'all');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {
                                vehicleType: { not: null },
                            };
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['vehicleType'],
                                    where: where,
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                })];
                        case 5:
                            stats = _c.sent();
                            total = stats.reduce(function (sum, s) { return sum + s._count.id; }, 0);
                            result = stats.map(function (s) { return ({
                                vehicleType: s.vehicleType,
                                count: s._count.id,
                                percentage: total > 0 ? Math.round((s._count.id / total) * 1000) / 10 : 0,
                            }); });
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Task 7: Kun-yo'nalish analitikasi (heatmap)
         */
        RouteAnalyticsService_1.prototype.getDayRouteAnalytics = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, limit) {
                var cacheKey, cached, _a, where, end, topRoutes, routeKeys, heatmapData, _i, topRoutes_1, route, key, orders, _b, orders_1, order, day, idx, dayNames, result, _c;
                if (limit === void 0) { limit = 15; }
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            cacheKey = "analytics:day_route:".concat(dateFrom || 'all', ":").concat(dateTo || 'all');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _d.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _d.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {
                                cargoFrom: { not: null },
                                cargoTo: { not: null },
                            };
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['cargoFrom', 'cargoTo'],
                                    where: where,
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: limit,
                                })];
                        case 5:
                            topRoutes = _d.sent();
                            routeKeys = topRoutes.map(function (r) { return "".concat(r.cargoFrom, "\u2192").concat(r.cargoTo); });
                            heatmapData = {};
                            _i = 0, topRoutes_1 = topRoutes;
                            _d.label = 6;
                        case 6:
                            if (!(_i < topRoutes_1.length)) return [3 /*break*/, 9];
                            route = topRoutes_1[_i];
                            key = "".concat(route.cargoFrom, "\u2192").concat(route.cargoTo);
                            heatmapData[key] = [0, 0, 0, 0, 0, 0, 0]; // Dush-Yak
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: __assign(__assign({}, where), { cargoFrom: route.cargoFrom, cargoTo: route.cargoTo }),
                                    select: { createdAt: true },
                                })];
                        case 7:
                            orders = _d.sent();
                            for (_b = 0, orders_1 = orders; _b < orders_1.length; _b++) {
                                order = orders_1[_b];
                                day = order.createdAt.getDay();
                                idx = day === 0 ? 6 : day - 1;
                                heatmapData[key][idx]++;
                            }
                            _d.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 6];
                        case 9:
                            dayNames = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
                            result = {
                                routes: routeKeys,
                                days: dayNames,
                                data: heatmapData,
                            };
                            _d.label = 10;
                        case 10:
                            _d.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 600)];
                        case 11:
                            _d.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            _c = _d.sent();
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Top guruhlar — qaysi guruh eng ko'p order yaratadi
         */
        RouteAnalyticsService_1.prototype.getTopGroups = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, limit) {
                var cacheKey, cached, _a, where, end, groups, total, result, _b;
                if (limit === void 0) { limit = 30; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:top_groups:".concat(dateFrom || 'all', ":").concat(dateTo || 'all', ":").concat(limit);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['groupTelegramId', 'groupTitle'],
                                    where: where,
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: limit,
                                })];
                        case 5:
                            groups = _c.sent();
                            total = groups.reduce(function (sum, g) { return sum + g._count.id; }, 0);
                            result = groups.map(function (g, i) { return ({
                                rank: i + 1,
                                groupTelegramId: g.groupTelegramId,
                                groupTitle: g.groupTitle || 'Noma\'lum',
                                count: g._count.id,
                                percentage: total > 0 ? Math.round((g._count.id / total) * 1000) / 10 : 0,
                            }); });
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Guruh orderlari kalendar bo'yicha — tanlangan guruh uchun kunlik orderlar
         */
        RouteAnalyticsService_1.prototype.getGroupCalendar = function (groupTelegramId, dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, where, end, orders, daily, _i, orders_2, o, key, result, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:group_calendar:".concat(groupTelegramId, ":").concat(dateFrom || 'all', ":").concat(dateTo || 'all');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = { groupTelegramId: groupTelegramId };
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: where,
                                    select: { createdAt: true },
                                })];
                        case 5:
                            orders = _c.sent();
                            daily = {};
                            for (_i = 0, orders_2 = orders; _i < orders_2.length; _i++) {
                                o = orders_2[_i];
                                key = o.createdAt.toISOString().slice(0, 10);
                                daily[key] = (daily[key] || 0) + 1;
                            }
                            result = Object.entries(daily)
                                .map(function (_a) {
                                var date = _a[0], count = _a[1];
                                return ({ date: date, count: count });
                            })
                                .sort(function (a, b) { return a.date.localeCompare(b.date); });
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Top telefon raqamlar — eng ko'p e'lon joylagan raqamlar
         */
        RouteAnalyticsService_1.prototype.getTopPhones = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, limit) {
                var cacheKey, cached, _a, where, end, phones, result, _b;
                var _this = this;
                if (limit === void 0) { limit = 30; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:top_phones:".concat(dateFrom || 'all', ":").concat(dateTo || 'all', ":").concat(limit);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = { phone: { not: null } };
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['phone'],
                                    where: where,
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: limit,
                                })];
                        case 5:
                            phones = _c.sent();
                            return [4 /*yield*/, Promise.all(phones.map(function (p, i) { return __awaiter(_this, void 0, void 0, function () {
                                    var phoneOrders, routes, groups, senderName, senderUsername, cargoCount, driverCount, _i, phoneOrders_1, o;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.prisma.order.findMany({
                                                    where: __assign(__assign({}, where), { phone: p.phone }),
                                                    select: {
                                                        cargoFrom: true,
                                                        cargoTo: true,
                                                        groupTitle: true,
                                                        groupTelegramId: true,
                                                        senderName: true,
                                                        senderUsername: true,
                                                        type: true,
                                                    },
                                                })];
                                            case 1:
                                                phoneOrders = _a.sent();
                                                routes = new Set();
                                                groups = new Set();
                                                senderName = '';
                                                senderUsername = '';
                                                cargoCount = 0;
                                                driverCount = 0;
                                                for (_i = 0, phoneOrders_1 = phoneOrders; _i < phoneOrders_1.length; _i++) {
                                                    o = phoneOrders_1[_i];
                                                    if (o.cargoFrom && o.cargoTo)
                                                        routes.add("".concat(o.cargoFrom, "-").concat(o.cargoTo));
                                                    if (o.groupTelegramId)
                                                        groups.add(o.groupTelegramId);
                                                    if (o.senderName && !senderName)
                                                        senderName = o.senderName;
                                                    if (o.senderUsername && !senderUsername)
                                                        senderUsername = o.senderUsername;
                                                    if (o.type === 'CARGO')
                                                        cargoCount++;
                                                    else
                                                        driverCount++;
                                                }
                                                return [2 /*return*/, {
                                                        rank: i + 1,
                                                        phone: p.phone,
                                                        senderName: senderName || undefined,
                                                        senderUsername: senderUsername || undefined,
                                                        totalOrders: p._count.id,
                                                        uniqueRoutes: routes.size,
                                                        uniqueGroups: groups.size,
                                                        cargoCount: cargoCount,
                                                        driverCount: driverCount,
                                                        topRoutes: __spreadArray([], routes, true).slice(0, 5),
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 6:
                            result = _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _b = _c.sent();
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * #6 Session dashboard — har bir kuzatuv session samaradorligi
         */
        RouteAnalyticsService_1.prototype.getSessionStats = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, sessions, where, end, result, last24h, hourlyData, _i, sessions_1, s, orders, hours, _b, orders_3, o, h, _c;
                var _this = this;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            cacheKey = "analytics:session_stats:".concat(dateFrom || 'all', ":").concat(dateTo || 'all');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _d.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _d.sent();
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this.prisma.monitorSession.findMany({
                                where: { status: { in: ['ACTIVE', 'DELETED'] } },
                                select: {
                                    id: true,
                                    phone: true,
                                    status: true,
                                    messagesRead: true,
                                    ordersFound: true,
                                    totalGroups: true,
                                    createdAt: true,
                                    lastMessageAt: true,
                                },
                            })];
                        case 5:
                            sessions = _d.sent();
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, Promise.all(sessions.map(function (s) { return __awaiter(_this, void 0, void 0, function () {
                                    var periodOrders, today, todayOrders, lastHour, hourlyOrders, uniqueGroups, conversionRate;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.prisma.order.count({
                                                    where: __assign(__assign({}, where), { monitorSessionId: s.id }),
                                                })];
                                            case 1:
                                                periodOrders = _a.sent();
                                                today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                return [4 /*yield*/, this.prisma.order.count({
                                                        where: { monitorSessionId: s.id, createdAt: { gte: today } },
                                                    })];
                                            case 2:
                                                todayOrders = _a.sent();
                                                lastHour = new Date(Date.now() - 60 * 60 * 1000);
                                                return [4 /*yield*/, this.prisma.order.count({
                                                        where: { monitorSessionId: s.id, createdAt: { gte: lastHour } },
                                                    })];
                                            case 3:
                                                hourlyOrders = _a.sent();
                                                return [4 /*yield*/, this.prisma.order.groupBy({
                                                        by: ['groupTelegramId'],
                                                        where: __assign(__assign({}, where), { monitorSessionId: s.id }),
                                                    })];
                                            case 4:
                                                uniqueGroups = _a.sent();
                                                conversionRate = s.messagesRead > 0
                                                    ? Math.round((s.ordersFound / s.messagesRead) * 10000) / 100
                                                    : 0;
                                                return [2 /*return*/, {
                                                        id: s.id,
                                                        phone: s.phone,
                                                        status: s.status,
                                                        totalGroups: s.totalGroups,
                                                        messagesRead: s.messagesRead,
                                                        ordersFound: s.ordersFound,
                                                        periodOrders: periodOrders,
                                                        todayOrders: todayOrders,
                                                        hourlyOrders: hourlyOrders,
                                                        activeGroups: uniqueGroups.length,
                                                        conversionRate: conversionRate,
                                                        lastMessageAt: s.lastMessageAt,
                                                        createdAt: s.createdAt,
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 6:
                            result = _d.sent();
                            last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
                            hourlyData = {};
                            _i = 0, sessions_1 = sessions;
                            _d.label = 7;
                        case 7:
                            if (!(_i < sessions_1.length)) return [3 /*break*/, 10];
                            s = sessions_1[_i];
                            if (s.status !== 'ACTIVE')
                                return [3 /*break*/, 9];
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: { monitorSessionId: s.id, createdAt: { gte: last24h } },
                                    select: { createdAt: true },
                                })];
                        case 8:
                            orders = _d.sent();
                            hours = new Array(24).fill(0);
                            for (_b = 0, orders_3 = orders; _b < orders_3.length; _b++) {
                                o = orders_3[_b];
                                h = o.createdAt.getHours();
                                hours[h]++;
                            }
                            hourlyData[s.id.slice(-8)] = hours;
                            _d.label = 9;
                        case 9:
                            _i++;
                            return [3 /*break*/, 7];
                        case 10:
                            _d.trys.push([10, 12, , 13]);
                            return [4 /*yield*/, this.redis.set(cacheKey, { sessions: result, hourlyData: hourlyData }, 120)];
                        case 11:
                            _d.sent();
                            return [3 /*break*/, 13];
                        case 12:
                            _c = _d.sent();
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/, { sessions: result, hourlyData: hourlyData }];
                    }
                });
            });
        };
        /**
         * #7 Yangi vs qaytgan yuboruvchilar
         */
        RouteAnalyticsService_1.prototype.getSenderRetention = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, startDate, endDate, orders, previousPhones, knownPhones, daily, seenInPeriod, _i, orders_4, o, day, dailyData, totalNew, totalReturning, _b, dailyData_1, d, result, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            cacheKey = "analytics:sender_retention:".concat(dateFrom || 'all', ":").concat(dateTo || 'all');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _d.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _d.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            endDate = dateTo ? new Date(dateTo) : new Date();
                            endDate.setHours(23, 59, 59, 999);
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: {
                                        createdAt: { gte: startDate, lte: endDate },
                                        phone: { not: null },
                                    },
                                    select: { phone: true, createdAt: true },
                                    orderBy: { createdAt: 'asc' },
                                })];
                        case 5:
                            orders = _d.sent();
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: {
                                        createdAt: { lt: startDate },
                                        phone: { not: null },
                                    },
                                    select: { phone: true },
                                    distinct: ['phone'],
                                })];
                        case 6:
                            previousPhones = _d.sent();
                            knownPhones = new Set(previousPhones.map(function (p) { return p.phone; }));
                            daily = {};
                            seenInPeriod = new Set();
                            for (_i = 0, orders_4 = orders; _i < orders_4.length; _i++) {
                                o = orders_4[_i];
                                day = o.createdAt.toISOString().slice(0, 10);
                                if (!daily[day])
                                    daily[day] = { newCount: 0, returningCount: 0, total: 0 };
                                daily[day].total++;
                                if (!seenInPeriod.has(o.phone)) {
                                    seenInPeriod.add(o.phone);
                                    if (knownPhones.has(o.phone)) {
                                        daily[day].returningCount++;
                                    }
                                    else {
                                        daily[day].newCount++;
                                        knownPhones.add(o.phone); // endi tanilgan
                                    }
                                }
                            }
                            dailyData = Object.entries(daily)
                                .map(function (_a) {
                                var date = _a[0], data = _a[1];
                                return (__assign({ date: date }, data));
                            })
                                .sort(function (a, b) { return a.date.localeCompare(b.date); });
                            totalNew = 0, totalReturning = 0;
                            for (_b = 0, dailyData_1 = dailyData; _b < dailyData_1.length; _b++) {
                                d = dailyData_1[_b];
                                totalNew += d.newCount;
                                totalReturning += d.returningCount;
                            }
                            result = {
                                daily: dailyData,
                                summary: {
                                    totalNew: totalNew,
                                    totalReturning: totalReturning,
                                    totalUnique: totalNew + totalReturning,
                                    newPercentage: totalNew + totalReturning > 0
                                        ? Math.round((totalNew / (totalNew + totalReturning)) * 100)
                                        : 0,
                                },
                            };
                            _d.label = 7;
                        case 7:
                            _d.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 8:
                            _d.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _c = _d.sent();
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * #8 Spam deteksiya — 1 kunda ko'p e'lon bergan raqamlar
         */
        RouteAnalyticsService_1.prototype.getSpamPhones = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, minOrders) {
                var cacheKey, cached, _a, startDate, endDate, phones, result, _b;
                var _this = this;
                if (minOrders === void 0) { minOrders = 5; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:spam_phones:".concat(dateFrom || 'all', ":").concat(dateTo || 'all', ":").concat(minOrders);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 24 * 60 * 60 * 1000);
                            endDate = dateTo ? new Date(dateTo) : new Date();
                            endDate.setHours(23, 59, 59, 999);
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['phone'],
                                    where: {
                                        createdAt: { gte: startDate, lte: endDate },
                                        phone: { not: null },
                                    },
                                    _count: { id: true },
                                    having: { id: { _count: { gte: minOrders } } },
                                    orderBy: { _count: { id: 'desc' } },
                                })];
                        case 5:
                            phones = _c.sent();
                            return [4 /*yield*/, Promise.all(phones.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                                    var orders, groups, routes, first, last, spanHours;
                                    var _a, _b, _c, _d;
                                    return __generator(this, function (_e) {
                                        switch (_e.label) {
                                            case 0: return [4 /*yield*/, this.prisma.order.findMany({
                                                    where: {
                                                        phone: p.phone,
                                                        createdAt: { gte: startDate, lte: endDate },
                                                    },
                                                    select: {
                                                        groupTitle: true,
                                                        groupTelegramId: true,
                                                        senderName: true,
                                                        senderUsername: true,
                                                        cargoFrom: true,
                                                        cargoTo: true,
                                                        createdAt: true,
                                                    },
                                                    orderBy: { createdAt: 'desc' },
                                                })];
                                            case 1:
                                                orders = _e.sent();
                                                groups = new Set(orders.map(function (o) { return o.groupTelegramId; }));
                                                routes = new Set(orders
                                                    .filter(function (o) { return o.cargoFrom && o.cargoTo; })
                                                    .map(function (o) { return "".concat(o.cargoFrom, " \u2192 ").concat(o.cargoTo); }));
                                                first = (_a = orders[orders.length - 1]) === null || _a === void 0 ? void 0 : _a.createdAt;
                                                last = (_b = orders[0]) === null || _b === void 0 ? void 0 : _b.createdAt;
                                                spanHours = first && last
                                                    ? Math.round((last.getTime() - first.getTime()) / (60 * 60 * 1000) * 10) / 10
                                                    : 0;
                                                return [2 /*return*/, {
                                                        phone: p.phone,
                                                        count: p._count.id,
                                                        senderName: ((_c = orders[0]) === null || _c === void 0 ? void 0 : _c.senderName) || '',
                                                        senderUsername: ((_d = orders[0]) === null || _d === void 0 ? void 0 : _d.senderUsername) || '',
                                                        uniqueGroups: groups.size,
                                                        uniqueRoutes: routes.size,
                                                        routes: __spreadArray([], routes, true).slice(0, 5),
                                                        spanHours: spanHours,
                                                        ordersPerHour: spanHours > 0 ? Math.round((p._count.id / spanHours) * 10) / 10 : p._count.id,
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 6:
                            result = _c.sent();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _b = _c.sent();
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * #11 Guruh qiymati — har bir guruhning soatlik samaradorligi
         */
        RouteAnalyticsService_1.prototype.getGroupEfficiency = function (dateFrom_1, dateTo_1) {
            return __awaiter(this, arguments, void 0, function (dateFrom, dateTo, limit) {
                var cacheKey, cached, _a, startDate, endDate, totalHours, groups, result, _b;
                var _this = this;
                if (limit === void 0) { limit = 50; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "analytics:group_efficiency:".concat(dateFrom || 'all', ":").concat(dateTo || 'all', ":").concat(limit);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            endDate = dateTo ? new Date(dateTo) : new Date();
                            endDate.setHours(23, 59, 59, 999);
                            totalHours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (60 * 60 * 1000));
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['groupTelegramId', 'groupTitle'],
                                    where: {
                                        createdAt: { gte: startDate, lte: endDate },
                                    },
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: limit,
                                })];
                        case 5:
                            groups = _c.sent();
                            return [4 /*yield*/, Promise.all(groups.map(function (g) { return __awaiter(_this, void 0, void 0, function () {
                                    var uniquePhones, uniqueRoutes, ordersPerHour, uniqueRatio;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.prisma.order.groupBy({
                                                    by: ['phone'],
                                                    where: {
                                                        groupTelegramId: g.groupTelegramId,
                                                        createdAt: { gte: startDate, lte: endDate },
                                                        phone: { not: null },
                                                    },
                                                })];
                                            case 1:
                                                uniquePhones = _a.sent();
                                                return [4 /*yield*/, this.prisma.order.groupBy({
                                                        by: ['cargoFrom', 'cargoTo'],
                                                        where: {
                                                            groupTelegramId: g.groupTelegramId,
                                                            createdAt: { gte: startDate, lte: endDate },
                                                            cargoFrom: { not: null },
                                                            cargoTo: { not: null },
                                                        },
                                                    })];
                                            case 2:
                                                uniqueRoutes = _a.sent();
                                                ordersPerHour = Math.round((g._count.id / totalHours) * 100) / 100;
                                                uniqueRatio = g._count.id > 0
                                                    ? Math.round((uniquePhones.length / g._count.id) * 100)
                                                    : 0;
                                                return [2 /*return*/, {
                                                        groupTelegramId: g.groupTelegramId,
                                                        groupTitle: g.groupTitle || 'Noma\'lum',
                                                        totalOrders: g._count.id,
                                                        uniquePhones: uniquePhones.length,
                                                        uniqueRoutes: uniqueRoutes.length,
                                                        ordersPerHour: ordersPerHour,
                                                        uniqueRatio: uniqueRatio,
                                                        efficiency: Math.round(ordersPerHour * uniqueRatio) / 100, // soatlik unikal order
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 6:
                            result = _c.sent();
                            // Efficiency bo'yicha tartiblash
                            result.sort(function (a, b) { return b.efficiency - a.efficiency; });
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _b = _c.sent();
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/, result];
                    }
                });
            });
        };
        return RouteAnalyticsService_1;
    }());
    __setFunctionName(_classThis, "RouteAnalyticsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RouteAnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RouteAnalyticsService = _classThis;
}();
exports.RouteAnalyticsService = RouteAnalyticsService;
