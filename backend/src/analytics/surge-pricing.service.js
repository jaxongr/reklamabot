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
exports.SurgePricingService = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var SurgePricingService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _updateRouteDemand_decorators;
    var SurgePricingService = _classThis = /** @class */ (function () {
        function SurgePricingService_1(prisma, redis) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.redis = redis;
            this.logger = new common_1.Logger(SurgePricingService.name);
        }
        /**
         * Task 12: Surge tekshirish
         */
        SurgePricingService_1.prototype.checkSurge = function (fromCity, toCity) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, today, hour, demand, result, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "surge:".concat(fromCity, ":").concat(toCity);
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
                            today = new Date();
                            today.setHours(0, 0, 0, 0);
                            hour = new Date().getHours();
                            return [4 /*yield*/, this.prisma.routeDemand.findUnique({
                                    where: {
                                        fromCity_toCity_date_hour: {
                                            fromCity: fromCity,
                                            toCity: toCity,
                                            date: today,
                                            hour: hour,
                                        },
                                    },
                                })];
                        case 5:
                            demand = _c.sent();
                            result = {
                                surgeMultiplier: (demand === null || demand === void 0 ? void 0 : demand.surgeMultiplier) || 1.0,
                                orderCount: (demand === null || demand === void 0 ? void 0 : demand.orderCount) || 0,
                                offerCount: (demand === null || demand === void 0 ? void 0 : demand.offerCount) || 0,
                                isSurge: ((demand === null || demand === void 0 ? void 0 : demand.surgeMultiplier) || 1.0) > 1.2,
                            };
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
         * Soatlik talab/taklif yangilanishi
         */
        SurgePricingService_1.prototype.updateRouteDemand = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, today, hour, oneHourAgo, orderRoutes, offerRoutes, offerMap, _i, offerRoutes_1, offer, _a, orderRoutes_1, route, orderCount, offerCount, surgeMultiplier, ratio;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.logger.log('Yo\'nalish talabi yangilanmoqda...');
                            now = new Date();
                            today = new Date(now);
                            today.setHours(0, 0, 0, 0);
                            hour = now.getHours();
                            oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['cargoFrom', 'cargoTo'],
                                    where: {
                                        cargoFrom: { not: null },
                                        cargoTo: { not: null },
                                        createdAt: { gte: oneHourAgo },
                                    },
                                    _count: { id: true },
                                })];
                        case 1:
                            orderRoutes = _b.sent();
                            return [4 /*yield*/, this.prisma.driverOffer.groupBy({
                                    by: ['fromCity', 'toCity'],
                                    where: {
                                        status: 'ACTIVE',
                                        createdAt: { gte: oneHourAgo },
                                    },
                                    _count: { id: true },
                                })];
                        case 2:
                            offerRoutes = _b.sent();
                            offerMap = new Map();
                            for (_i = 0, offerRoutes_1 = offerRoutes; _i < offerRoutes_1.length; _i++) {
                                offer = offerRoutes_1[_i];
                                offerMap.set("".concat(offer.fromCity, ":").concat(offer.toCity), offer._count.id);
                            }
                            _a = 0, orderRoutes_1 = orderRoutes;
                            _b.label = 3;
                        case 3:
                            if (!(_a < orderRoutes_1.length)) return [3 /*break*/, 7];
                            route = orderRoutes_1[_a];
                            if (!route.cargoFrom || !route.cargoTo)
                                return [3 /*break*/, 6];
                            orderCount = route._count.id;
                            offerCount = offerMap.get("".concat(route.cargoFrom, ":").concat(route.cargoTo)) || 0;
                            surgeMultiplier = 1.0;
                            if (offerCount > 0) {
                                ratio = orderCount / offerCount;
                                if (ratio > 3)
                                    surgeMultiplier = 2.0;
                                else if (ratio > 2)
                                    surgeMultiplier = 1.5;
                                else if (ratio > 1.5)
                                    surgeMultiplier = 1.3;
                            }
                            else if (orderCount > 5) {
                                surgeMultiplier = 1.5;
                            }
                            return [4 /*yield*/, this.prisma.routeDemand.upsert({
                                    where: {
                                        fromCity_toCity_date_hour: {
                                            fromCity: route.cargoFrom,
                                            toCity: route.cargoTo,
                                            date: today,
                                            hour: hour,
                                        },
                                    },
                                    update: {
                                        orderCount: orderCount,
                                        offerCount: offerCount,
                                        surgeMultiplier: surgeMultiplier,
                                    },
                                    create: {
                                        fromCity: route.cargoFrom,
                                        toCity: route.cargoTo,
                                        date: today,
                                        hour: hour,
                                        orderCount: orderCount,
                                        offerCount: offerCount,
                                        surgeMultiplier: surgeMultiplier,
                                    },
                                })];
                        case 4:
                            _b.sent();
                            if (!(surgeMultiplier > 1.0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.order.updateMany({
                                    where: {
                                        cargoFrom: route.cargoFrom,
                                        cargoTo: route.cargoTo,
                                        createdAt: { gte: oneHourAgo },
                                        surgeMultiplier: { equals: 1.0 },
                                    },
                                    data: {
                                        surgeMultiplier: surgeMultiplier,
                                        surgeExpiresAt: new Date(now.getTime() + 10 * 60 * 1000), // 10 daqiqa
                                    },
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            _a++;
                            return [3 /*break*/, 3];
                        case 7:
                            this.logger.log("Yo'nalish talabi yangilandi: ".concat(orderRoutes.length, " yo'nalish"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Surge ma'lumotlarini olish
         */
        SurgePricingService_1.prototype.getSurgeRoutes = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now;
                return __generator(this, function (_a) {
                    now = new Date();
                    return [2 /*return*/, this.prisma.order.findMany({
                            where: {
                                surgeMultiplier: { gt: 1.0 },
                                surgeExpiresAt: { gt: now },
                            },
                            select: {
                                id: true,
                                cargoFrom: true,
                                cargoTo: true,
                                surgeMultiplier: true,
                                surgeExpiresAt: true,
                            },
                            orderBy: { surgeMultiplier: 'desc' },
                            take: 50,
                        })];
                });
            });
        };
        return SurgePricingService_1;
    }());
    __setFunctionName(_classThis, "SurgePricingService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _updateRouteDemand_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR)];
        __esDecorate(_classThis, null, _updateRouteDemand_decorators, { kind: "method", name: "updateRouteDemand", static: false, private: false, access: { has: function (obj) { return "updateRouteDemand" in obj; }, get: function (obj) { return obj.updateRouteDemand; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SurgePricingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SurgePricingService = _classThis;
}();
exports.SurgePricingService = SurgePricingService;
