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
exports.PriceEstimationService = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var PriceEstimationService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _refreshPriceCache_decorators;
    var PriceEstimationService = _classThis = /** @class */ (function () {
        function PriceEstimationService_1(prisma, redis) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.redis = redis;
            this.logger = new common_1.Logger(PriceEstimationService.name);
        }
        /**
         * Task 11: Narx taxmini
         */
        PriceEstimationService_1.prototype.estimatePrice = function (fromCity, toCity, vehicleType) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached_1, _a, cached, result, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "price_estimate:".concat(fromCity, ":").concat(toCity, ":").concat(vehicleType || 'all');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached_1 = _c.sent();
                            if (cached_1)
                                return [2 /*return*/, cached_1];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this.prisma.priceEstimate.findUnique({
                                where: {
                                    fromCity_toCity_vehicleType: {
                                        fromCity: fromCity,
                                        toCity: toCity,
                                        vehicleType: vehicleType || '',
                                    },
                                },
                            })];
                        case 5:
                            cached = _c.sent();
                            if (!(cached && cached.sampleCount > 0)) return [3 /*break*/, 10];
                            result = {
                                fromCity: fromCity,
                                toCity: toCity,
                                vehicleType: vehicleType,
                                avgPrice: cached.avgPrice,
                                minPrice: cached.minPrice,
                                maxPrice: cached.maxPrice,
                                sampleCount: cached.sampleCount,
                                lastCalculated: cached.lastCalculated,
                            };
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 3600)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                        case 10: 
                        // Real-time hisoblash
                        return [2 /*return*/, this.calculatePriceEstimate(fromCity, toCity, vehicleType)];
                    }
                });
            });
        };
        PriceEstimationService_1.prototype.calculatePriceEstimate = function (fromCity, toCity, vehicleType) {
            return __awaiter(this, void 0, void 0, function () {
                var where, orders, amounts, avg, min, max, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {
                                cargoFrom: { contains: fromCity, mode: 'insensitive' },
                                cargoTo: { contains: toCity, mode: 'insensitive' },
                                closedAmount: { not: null, gt: 0 },
                            };
                            if (vehicleType) {
                                where.vehicleType = { contains: vehicleType, mode: 'insensitive' };
                            }
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: where,
                                    select: { closedAmount: true },
                                    orderBy: { closedAt: 'desc' },
                                    take: 100,
                                })];
                        case 1:
                            orders = _a.sent();
                            if (orders.length === 0) {
                                return [2 /*return*/, {
                                        fromCity: fromCity,
                                        toCity: toCity,
                                        vehicleType: vehicleType,
                                        avgPrice: 0,
                                        minPrice: 0,
                                        maxPrice: 0,
                                        sampleCount: 0,
                                        lastCalculated: new Date(),
                                    }];
                            }
                            amounts = orders.map(function (o) { return o.closedAmount; }).filter(function (a) { return a > 0; });
                            avg = amounts.reduce(function (s, a) { return s + a; }, 0) / amounts.length;
                            min = Math.min.apply(Math, amounts);
                            max = Math.max.apply(Math, amounts);
                            result = {
                                fromCity: fromCity,
                                toCity: toCity,
                                vehicleType: vehicleType || null,
                                avgPrice: Math.round(avg),
                                minPrice: min,
                                maxPrice: max,
                                sampleCount: amounts.length,
                                lastCalculated: new Date(),
                            };
                            // Keshga saqlash
                            return [4 /*yield*/, this.prisma.priceEstimate.upsert({
                                    where: {
                                        fromCity_toCity_vehicleType: {
                                            fromCity: fromCity,
                                            toCity: toCity,
                                            vehicleType: vehicleType || '',
                                        },
                                    },
                                    update: {
                                        avgPrice: result.avgPrice,
                                        minPrice: result.minPrice,
                                        maxPrice: result.maxPrice,
                                        sampleCount: result.sampleCount,
                                        lastCalculated: new Date(),
                                    },
                                    create: {
                                        fromCity: fromCity,
                                        toCity: toCity,
                                        vehicleType: vehicleType || '',
                                        avgPrice: result.avgPrice,
                                        minPrice: result.minPrice,
                                        maxPrice: result.maxPrice,
                                        sampleCount: result.sampleCount,
                                    },
                                })];
                        case 2:
                            // Keshga saqlash
                            _a.sent();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Kunlik narx keshini yangilash
         */
        PriceEstimationService_1.prototype.refreshPriceCache = function () {
            return __awaiter(this, void 0, void 0, function () {
                var topRoutes, _i, topRoutes_1, route;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Narx keshini yangilash boshlandi...');
                            return [4 /*yield*/, this.prisma.order.groupBy({
                                    by: ['cargoFrom', 'cargoTo'],
                                    where: {
                                        cargoFrom: { not: null },
                                        cargoTo: { not: null },
                                        closedAmount: { not: null, gt: 0 },
                                    },
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: 50,
                                })];
                        case 1:
                            topRoutes = _a.sent();
                            _i = 0, topRoutes_1 = topRoutes;
                            _a.label = 2;
                        case 2:
                            if (!(_i < topRoutes_1.length)) return [3 /*break*/, 5];
                            route = topRoutes_1[_i];
                            if (!(route.cargoFrom && route.cargoTo)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.calculatePriceEstimate(route.cargoFrom, route.cargoTo)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            this.logger.log("Narx keshi yangilandi: ".concat(topRoutes.length, " yo'nalish"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        return PriceEstimationService_1;
    }());
    __setFunctionName(_classThis, "PriceEstimationService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _refreshPriceCache_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM)];
        __esDecorate(_classThis, null, _refreshPriceCache_decorators, { kind: "method", name: "refreshPriceCache", static: false, private: false, access: { has: function (obj) { return "refreshPriceCache" in obj; }, get: function (obj) { return obj.refreshPriceCache; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PriceEstimationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PriceEstimationService = _classThis;
}();
exports.PriceEstimationService = PriceEstimationService;
