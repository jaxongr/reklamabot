"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.OrdersService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var city_distances_1 = require("../monitor/data/city-distances");
var OrdersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var OrdersService = _classThis = /** @class */ (function () {
        function OrdersService_1(prisma, redis, gateway) {
            this.prisma = prisma;
            this.redis = redis;
            this.gateway = gateway;
            this.logger = new common_1.Logger(OrdersService.name);
            /**
             * Bloklangan senderlarning telegramId lari (cached 60s)
             */
            this.blockedIdsCache = null;
            this.blockedIdsCacheTime = 0;
        }
        OrdersService_1.prototype.getBlockedTelegramIds = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, blocked;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            if (this.blockedIdsCache && (now - this.blockedIdsCacheTime) < 60000) {
                                return [2 /*return*/, this.blockedIdsCache];
                            }
                            return [4 /*yield*/, this.prisma.blockedUser.findMany({
                                    where: { isActive: true, senderTelegramId: { not: '' } },
                                    select: { senderTelegramId: true },
                                    distinct: ['senderTelegramId'],
                                })];
                        case 1:
                            blocked = _a.sent();
                            this.blockedIdsCache = blocked.map(function (b) { return b.senderTelegramId; }).filter(Boolean);
                            this.blockedIdsCacheTime = now;
                            return [2 /*return*/, this.blockedIdsCache];
                    }
                });
            });
        };
        /**
         * Kirill → Lotin transliteratsiya (O'zbek shahar nomlari uchun)
         */
        OrdersService_1.prototype.cyrillicToLatin = function (text) {
            var map = {
                'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
                'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
                'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
                'ў': 'o\'', 'қ': 'q', 'ғ': 'g\'', 'ҳ': 'h',
                'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
                'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
                'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
                'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
                'Ъ': '', 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
                'Ў': 'O\'', 'Қ': 'Q', 'Ғ': 'G\'', 'Ҳ': 'H',
            };
            return text.split('').map(function (c) { var _a; return (_a = map[c]) !== null && _a !== void 0 ? _a : c; }).join('');
        };
        /**
         * Shahar filtri — findCity() orqali kanonik nom + barcha aliaslar bilan qidirish
         * Lotincha/kirilcha/alias — barchasi ishlaydi
         */
        OrdersService_1.prototype.buildCityFilter = function (field, value) {
            var _a, _b, _c;
            var trimmed = value.trim();
            // findCity() — kirilcha/lotincha/alias → kanonik nom topadi
            var city = (0, city_distances_1.findCity)(trimmed);
            if (city) {
                // Kanonik nom + barcha aliaslar bilan qidirish (max 5 ta variant)
                var variants = __spreadArray([city.name], city.aliases.slice(0, 4), true);
                return {
                    OR: variants.map(function (v) {
                        var _a;
                        return (_a = {}, _a[field] = { contains: v, mode: 'insensitive' }, _a);
                    }),
                };
            }
            // Shahar topilmasa — oddiy qidirish + transliteratsiya
            var latin = this.cyrillicToLatin(trimmed);
            var hasCyrillic = /[а-яёўқғҳА-ЯЁЎҚҒҲ]/.test(trimmed);
            if (hasCyrillic && latin !== trimmed) {
                return {
                    OR: [
                        (_a = {}, _a[field] = { contains: trimmed, mode: 'insensitive' }, _a),
                        (_b = {}, _b[field] = { contains: latin, mode: 'insensitive' }, _b),
                    ],
                };
            }
            return _c = {}, _c[field] = { contains: trimmed, mode: 'insensitive' }, _c;
        };
        /**
         * Shahar takliflarini olish — autocomplete uchun
         */
        OrdersService_1.prototype.getCitySuggestions = function (query) {
            var q = query.toLowerCase().trim();
            if (q.length < 2)
                return [];
            return city_distances_1.CITIES
                .filter(function (c) {
                if (c.name.toLowerCase().includes(q))
                    return true;
                return c.aliases.some(function (a) { return a.toLowerCase().includes(q); });
            })
                .slice(0, 15)
                .map(function (c) { return ({
                name: c.name,
                nameRu: c.aliases.find(function (a) { return /[а-яёА-ЯЁ]/.test(a); }) || c.name,
            }); });
        };
        /**
         * Enrich orders with blockedByCount (how many users blocked this sender)
         */
        OrdersService_1.prototype.enrichWithBlockedCount = function (orders) {
            return __awaiter(this, void 0, void 0, function () {
                var senderIds, blockCounts, countMap, _i, blockCounts_1, item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (orders.length === 0)
                                return [2 /*return*/, orders];
                            senderIds = __spreadArray([], new Set(orders
                                .map(function (o) { return o.senderTelegramId; })
                                .filter(function (id) { return id && id.length > 0; })), true);
                            if (senderIds.length === 0) {
                                return [2 /*return*/, orders.map(function (o) { return (__assign(__assign({}, o), { blockedByCount: 0 })); })];
                            }
                            return [4 /*yield*/, this.prisma.blockedUser.groupBy({
                                    by: ['senderTelegramId'],
                                    where: {
                                        senderTelegramId: { in: senderIds },
                                        isActive: true,
                                    },
                                    _count: { userId: true },
                                })];
                        case 1:
                            blockCounts = _a.sent();
                            countMap = new Map();
                            for (_i = 0, blockCounts_1 = blockCounts; _i < blockCounts_1.length; _i++) {
                                item = blockCounts_1[_i];
                                countMap.set(item.senderTelegramId, item._count.userId);
                            }
                            return [2 /*return*/, orders.map(function (o) { return (__assign(__assign({}, o), { blockedByCount: countMap.get(o.senderTelegramId) || 0 })); })];
                    }
                });
            });
        };
        /**
         * Get orders with filters and pagination
         */
        OrdersService_1.prototype.findAll = function (userId, filters) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, where, searchLatin, hasCyrillic, searchTerms, orConditions, _i, searchTerms_1, term, _a, rawData, total, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = filters.page || 1;
                            limit = filters.limit || 20;
                            skip = (page - 1) * limit;
                            where = {};
                            if (userId) {
                                where.userId = userId;
                            }
                            // Bloklangan senderlar orderlari — ko'rinadi lekin yangi order yaratilmaydi
                            // NOT IN 7900+ items Prisma da juda og'ir — performance muammo
                            if (filters.status) {
                                where.status = filters.status;
                            }
                            if (filters.type) {
                                where.type = filters.type;
                            }
                            // Task 1-2: Scope filtr
                            if (filters.scope) {
                                where.scope = filters.scope;
                            }
                            // Task 4: Mashina turi filtr
                            if (filters.vehicleType) {
                                where.vehicleType = { contains: filters.vehicleType, mode: 'insensitive' };
                            }
                            // Task 10: Qo'lda yaratilgan filtr
                            if (filters.isManual !== undefined) {
                                where.isManual = filters.isManual;
                            }
                            // Task 10: Sotuvdagilar filtr
                            if (filters.isForSale !== undefined) {
                                where.isForSale = filters.isForSale;
                            }
                            // Task 13: Qabul qilinganlar filtr
                            if (filters.acceptedById) {
                                where.acceptedById = filters.acceptedById;
                            }
                            if (filters.search) {
                                searchLatin = this.cyrillicToLatin(filters.search);
                                hasCyrillic = /[а-яёўқғҳА-ЯЁЎҚҒҲ]/.test(filters.search);
                                searchTerms = [filters.search];
                                if (hasCyrillic && searchLatin !== filters.search) {
                                    searchTerms.push(searchLatin);
                                }
                                orConditions = [];
                                for (_i = 0, searchTerms_1 = searchTerms; _i < searchTerms_1.length; _i++) {
                                    term = searchTerms_1[_i];
                                    orConditions.push({ messageText: { contains: term, mode: 'insensitive' } }, { groupTitle: { contains: term, mode: 'insensitive' } }, { senderName: { contains: term, mode: 'insensitive' } }, { senderTelegramId: { equals: term } }, { cargoFrom: { contains: term, mode: 'insensitive' } }, { cargoTo: { contains: term, mode: 'insensitive' } }, { phone: { contains: term, mode: 'insensitive' } });
                                }
                                where.OR = orConditions;
                            }
                            if (filters.cargoFrom) {
                                where.AND = __spreadArray(__spreadArray([], (where.AND || []), true), [this.buildCityFilter('cargoFrom', filters.cargoFrom)], false);
                            }
                            if (filters.cargoTo) {
                                where.AND = __spreadArray(__spreadArray([], (where.AND || []), true), [this.buildCityFilter('cargoTo', filters.cargoTo)], false);
                            }
                            if (filters.dateFrom || filters.dateTo) {
                                where.createdAt = {};
                                if (filters.dateFrom) {
                                    where.createdAt.gte = filters.dateFrom;
                                }
                                if (filters.dateTo) {
                                    where.createdAt.lte = filters.dateTo;
                                }
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.order.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), rawData = _a[0], total = _a[1];
                            return [4 /*yield*/, this.enrichWithBlockedCount(rawData)];
                        case 2:
                            data = _b.sent();
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: {
                                        total: total,
                                        page: page,
                                        limit: limit,
                                        totalPages: Math.ceil(total / limit),
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Get single order by ID
         */
        OrdersService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.order.findUnique({ where: { id: id } })];
                });
            });
        };
        /**
         * Update order status
         */
        OrdersService_1.prototype.updateStatus = function (id, status, notes, acceptedStatus) {
            return __awaiter(this, void 0, void 0, function () {
                var updateData, order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            updateData = __assign({ status: status }, (notes !== undefined && { notes: notes }));
                            // Agar acceptedStatus CANCELLED bo'lsa, faqat statusni o'zgartirish (acceptedById saqlanadi — "Bekor" tabda ko'rinishi uchun)
                            if (acceptedStatus === 'CANCELLED') {
                                updateData.acceptedStatus = 'CANCELLED';
                            }
                            else if (acceptedStatus) {
                                updateData.acceptedStatus = acceptedStatus;
                            }
                            return [4 /*yield*/, this.prisma.order.update({
                                    where: { id: id },
                                    data: updateData,
                                })];
                        case 1:
                            order = _a.sent();
                            this.logger.log("Buyurtma statusi yangilandi: ".concat(id, " \u2192 ").concat(status).concat(acceptedStatus ? ", accepted: ".concat(acceptedStatus) : ''));
                            return [2 /*return*/, order];
                    }
                });
            });
        };
        /**
         * Update order details
         */
        OrdersService_1.prototype.update = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.order.update({
                            where: { id: id },
                            data: data,
                        })];
                });
            });
        };
        /**
         * Delete order
         */
        OrdersService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.order.delete({ where: { id: id } })];
                });
            });
        };
        /**
         * Get order statistics for user
         */
        OrdersService_1.prototype.getStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, where, _b, total, byStatus, byType, byScope, today, thisWeek, statusMap, _i, byStatus_1, item, typeMap, _c, byType_1, item, scopeMap, _d, byScope_1, item, result, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            cacheKey = "order_stats:".concat(userId || 'all');
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _f.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _f.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {};
                            if (userId)
                                where.userId = userId;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.count({ where: where }),
                                    this.prisma.order.groupBy({
                                        by: ['status'],
                                        where: where,
                                        _count: { id: true },
                                    }),
                                    this.prisma.order.groupBy({
                                        by: ['type'],
                                        where: where,
                                        _count: { id: true },
                                    }),
                                    // Task 1-2: Scope bo'yicha hisob
                                    this.prisma.order.groupBy({
                                        by: ['scope'],
                                        where: where,
                                        _count: { id: true },
                                    }),
                                    this.prisma.order.count({
                                        where: __assign(__assign({}, where), { createdAt: {
                                                // O'zbekiston vaqti (UTC+5) bo'yicha bugun
                                                gte: (function () {
                                                    var now = new Date();
                                                    var uzNow = new Date(now.getTime() + 5 * 3600000);
                                                    uzNow.setUTCHours(0, 0, 0, 0);
                                                    return new Date(uzNow.getTime() - 5 * 3600000);
                                                })(),
                                            } }),
                                    }),
                                    this.prisma.order.count({
                                        where: __assign(__assign({}, where), { createdAt: {
                                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                            } }),
                                    }),
                                ])];
                        case 5:
                            _b = _f.sent(), total = _b[0], byStatus = _b[1], byType = _b[2], byScope = _b[3], today = _b[4], thisWeek = _b[5];
                            statusMap = {};
                            for (_i = 0, byStatus_1 = byStatus; _i < byStatus_1.length; _i++) {
                                item = byStatus_1[_i];
                                statusMap[item.status] = item._count.id;
                            }
                            typeMap = {};
                            for (_c = 0, byType_1 = byType; _c < byType_1.length; _c++) {
                                item = byType_1[_c];
                                typeMap[item.type] = item._count.id;
                            }
                            scopeMap = {};
                            for (_d = 0, byScope_1 = byScope; _d < byScope_1.length; _d++) {
                                item = byScope_1[_d];
                                scopeMap[item.scope] = item._count.id;
                            }
                            result = {
                                total: total,
                                today: today,
                                thisWeek: thisWeek,
                                cargo: typeMap['CARGO'] || 0,
                                driver: typeMap['DRIVER'] || 0,
                                internal: scopeMap['INTERNAL'] || 0,
                                import: scopeMap['IMPORT'] || 0,
                                export: scopeMap['EXPORT'] || 0,
                                new: statusMap['NEW'] || 0,
                                viewed: statusMap['VIEWED'] || 0,
                                contacted: statusMap['CONTACTED'] || 0,
                                completed: statusMap['COMPLETED'] || 0,
                                rejected: statusMap['REJECTED'] || 0,
                            };
                            _f.label = 6;
                        case 6:
                            _f.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 10)];
                        case 7:
                            _f.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _e = _f.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Batch update status
         */
        OrdersService_1.prototype.batchUpdateStatus = function (ids, status) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.order.updateMany({
                            where: { id: { in: ids } },
                            data: { status: status },
                        })];
                });
            });
        };
        /**
         * Get recent orders (for dashboard widget)
         */
        OrdersService_1.prototype.getRecent = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, limit) {
                var where, rawData;
                if (limit === void 0) { limit = 10; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (userId)
                                where.userId = userId;
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: where,
                                    orderBy: { createdAt: 'desc' },
                                    take: limit,
                                })];
                        case 1:
                            rawData = _a.sent();
                            return [2 /*return*/, this.enrichWithBlockedCount(rawData)];
                    }
                });
            });
        };
        // ============================================================
        // Task 10: Qo'lda buyurtma yaratish
        // ============================================================
        OrdersService_1.prototype.createManual = function (createdBy, userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var scope, classifyOrderScope, order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            scope = client_1.OrderScope.INTERNAL;
                            try {
                                classifyOrderScope = require('../monitor/data/dispatcher-keywords').classifyOrderScope;
                                scope = classifyOrderScope(data.cargoFrom, data.cargoTo);
                            }
                            catch (_b) { }
                            return [4 /*yield*/, this.prisma.order.create({
                                    data: {
                                        userId: userId,
                                        messageText: data.messageText || "Qo'lda yaratilgan: ".concat(data.cargoFrom, " \u2192 ").concat(data.cargoTo),
                                        groupTitle: 'Qo\'lda yaratilgan',
                                        groupTelegramId: 'manual',
                                        messageDate: new Date(),
                                        cargoFrom: data.cargoFrom,
                                        cargoTo: data.cargoTo,
                                        cargoType: data.cargoType,
                                        cargoWeight: data.cargoWeight,
                                        price: data.price,
                                        phone: data.phone,
                                        vehicleType: data.vehicleType,
                                        vehicleCapacity: data.vehicleCapacity,
                                        type: data.type || client_1.OrderType.CARGO,
                                        status: client_1.OrderStatus.NEW,
                                        scope: scope,
                                        isManual: true,
                                        manualCreatedBy: createdBy,
                                        isForSale: data.isForSale || false,
                                        salePrice: data.salePrice,
                                    },
                                })];
                        case 1:
                            order = _a.sent();
                            // WebSocket — mobile/dashboardga yangi order haqida xabar
                            this.gateway.emitNewOrder(userId, order);
                            this.logger.log("Qo'lda buyurtma yaratildi va emit qilindi: ".concat(order.id));
                            return [2 /*return*/, order];
                    }
                });
            });
        };
        /**
         * Get for-sale orders
         */
        OrdersService_1.prototype.getForSaleOrders = function () {
            return __awaiter(this, arguments, void 0, function (page, limit) {
                var skip, where, _a, rawData, total, data;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            where = {
                                isForSale: true,
                                status: { not: client_1.OrderStatus.COMPLETED },
                            };
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.order.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), rawData = _a[0], total = _a[1];
                            return [4 /*yield*/, this.enrichWithBlockedCount(rawData)];
                        case 2:
                            data = _b.sent();
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        // ============================================================
        // Task 13: Buyurtma qabul qilish
        // ============================================================
        OrdersService_1.prototype.acceptOrder = function (orderId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var activeCount, order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.count({
                                where: {
                                    acceptedById: userId,
                                    acceptedStatus: { in: [client_1.AcceptedOrderStatus.ACCEPTED, client_1.AcceptedOrderStatus.IN_PROGRESS] },
                                },
                            })];
                        case 1:
                            activeCount = _a.sent();
                            if (activeCount >= 10) {
                                throw new common_1.BadRequestException('Maksimal 10 ta buyurtma qabul qilish mumkin. Avval bitta buyurtmani yoping yoki bekor qiling.');
                            }
                            return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: orderId } })];
                        case 2:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            return [2 /*return*/, this.prisma.order.update({
                                    where: { id: orderId },
                                    data: {
                                        acceptedById: userId,
                                        acceptedAt: new Date(),
                                        acceptedStatus: client_1.AcceptedOrderStatus.ACCEPTED,
                                        status: client_1.OrderStatus.CONTACTED,
                                    },
                                })];
                    }
                });
            });
        };
        OrdersService_1.prototype.getAcceptedOrders = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var skip, where, _a, rawData, total, data;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            where = { acceptedById: userId };
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({
                                        where: where,
                                        orderBy: { acceptedAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.order.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), rawData = _a[0], total = _a[1];
                            return [4 /*yield*/, this.enrichWithBlockedCount(rawData)];
                        case 2:
                            data = _b.sent();
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        // ============================================================
        // DASHBOARD: Barcha qabul qilingan zakazlar (haydovchi ma'lumotlari bilan)
        // ============================================================
        OrdersService_1.prototype.getAllAcceptedOrders = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var status, _a, page, _b, limit, search, skip, where, _c, data, total, driverIds, drivers, _d, driverMap, enriched, _e, totalAccepted, activeCount, completedCount, cancelledCount;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            status = params.status, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 20 : _b, search = params.search;
                            skip = (page - 1) * limit;
                            where = { acceptedById: { not: null } };
                            if (status === 'active') {
                                where.acceptedStatus = { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] };
                            }
                            else if (status === 'completed') {
                                where.acceptedStatus = 'COMPLETED';
                            }
                            else if (status === 'cancelled') {
                                where.acceptedStatus = 'CANCELLED';
                            }
                            else if (status) {
                                where.acceptedStatus = status;
                            }
                            if (search) {
                                where.OR = [
                                    { cargoFrom: { contains: search, mode: 'insensitive' } },
                                    { cargoTo: { contains: search, mode: 'insensitive' } },
                                    { phone: { contains: search } },
                                    { senderName: { contains: search, mode: 'insensitive' } },
                                ];
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({
                                        where: where,
                                        orderBy: { acceptedAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.order.count({ where: where }),
                                ])];
                        case 1:
                            _c = _f.sent(), data = _c[0], total = _c[1];
                            driverIds = __spreadArray([], new Set(data.map(function (o) { return o.acceptedById; }).filter(Boolean)), true);
                            if (!(driverIds.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.driverProfile.findMany({
                                    where: { userId: { in: driverIds } },
                                    select: { userId: true, fullName: true, phone: true, vehicleType: true, vehicleNumber: true, isVerified: true },
                                })];
                        case 2:
                            _d = _f.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _d = [];
                            _f.label = 4;
                        case 4:
                            drivers = _d;
                            driverMap = new Map(drivers.map(function (d) { return [d.userId, d]; }));
                            enriched = data.map(function (order) { return (__assign(__assign({}, order), { driver: driverMap.get(order.acceptedById) || null })); });
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.count({ where: { acceptedById: { not: null } } }),
                                    this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] } } }),
                                    this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: 'COMPLETED' } }),
                                    this.prisma.order.count({ where: { acceptedById: { not: null }, acceptedStatus: 'CANCELLED' } }),
                                ])];
                        case 5:
                            _e = _f.sent(), totalAccepted = _e[0], activeCount = _e[1], completedCount = _e[2], cancelledCount = _e[3];
                            return [2 /*return*/, {
                                    data: enriched,
                                    stats: { totalAccepted: totalAccepted, activeCount: activeCount, completedCount: completedCount, cancelledCount: cancelledCount },
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        // ============================================================
        // Task 15: Yuk yopish
        // ============================================================
        OrdersService_1.prototype.closeDeal = function (orderId, userId, amount) {
            return __awaiter(this, void 0, void 0, function () {
                var order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: orderId } })];
                        case 1:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            return [2 /*return*/, this.prisma.order.update({
                                    where: { id: orderId },
                                    data: {
                                        closedAmount: amount,
                                        closedAt: new Date(),
                                        closedById: userId,
                                        acceptedStatus: client_1.AcceptedOrderStatus.CLOSED,
                                        status: client_1.OrderStatus.COMPLETED,
                                    },
                                })];
                    }
                });
            });
        };
        OrdersService_1.prototype.getClosedDeals = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var skip, where, _a, data, total, sumResult;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            where = __assign({ closedAt: { not: null } }, (userId && { closedById: userId }));
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.order.findMany({
                                        where: where,
                                        orderBy: { closedAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.order.count({ where: where }),
                                    this.prisma.order.aggregate({
                                        where: where,
                                        _sum: { closedAmount: true },
                                        _avg: { closedAmount: true },
                                        _count: { id: true },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), data = _a[0], total = _a[1], sumResult = _a[2];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                    stats: {
                                        totalDeals: sumResult._count.id,
                                        totalAmount: sumResult._sum.closedAmount || 0,
                                        avgAmount: sumResult._avg.closedAmount || 0,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Unikal telefon raqamlar — order, haydovchi, dispetcher
         */
        OrdersService_1.prototype.getUniquePhones = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, where, phoneGroups, countResult, total, data;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = filters.page || 1;
                            limit = filters.limit || 50;
                            skip = (page - 1) * limit;
                            where = {
                                phone: { not: null, notIn: ['', ' '] },
                            };
                            if (filters.type && filters.type !== 'ALL') {
                                where.type = filters.type;
                            }
                            if (filters.dateFrom || filters.dateTo) {
                                where.messageDate = {};
                                if (filters.dateFrom)
                                    where.messageDate.gte = filters.dateFrom;
                                if (filters.dateTo)
                                    where.messageDate.lte = filters.dateTo;
                            }
                            if (filters.cargoFrom) {
                                where.cargoFrom = { contains: filters.cargoFrom, mode: 'insensitive' };
                            }
                            if (filters.cargoTo) {
                                where.cargoTo = { contains: filters.cargoTo, mode: 'insensitive' };
                            }
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      SELECT\n        o.phone,\n        COUNT(*)::bigint as ads_count,\n        (ARRAY_AGG(o.\"senderName\" ORDER BY o.\"messageDate\" DESC))[1] as last_name,\n        (ARRAY_AGG(o.\"senderUsername\" ORDER BY o.\"messageDate\" DESC))[1] as last_username,\n        (ARRAY_AGG(o.\"type\" ORDER BY o.\"messageDate\" DESC))[1] as last_type,\n        MAX(o.\"messageDate\") as last_date,\n        (ARRAY_AGG(o.\"cargoFrom\" ORDER BY o.\"messageDate\" DESC))[1] as last_from,\n        (ARRAY_AGG(o.\"cargoTo\" ORDER BY o.\"messageDate\" DESC))[1] as last_to,\n        COALESCE(b.block_count, 0) > 0 as is_blocked,\n        COALESCE(b.block_count, 0)::bigint as block_count\n      FROM \"Order\" o\n      LEFT JOIN (\n        SELECT phone, COUNT(*)::bigint as block_count\n        FROM \"BlockedUser\"\n        WHERE phone IS NOT NULL AND phone != '' AND \"isActive\" = true\n        GROUP BY phone\n      ) b ON b.phone = o.phone\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      GROUP BY o.phone, b.block_count\n      ORDER BY ads_count DESC\n      LIMIT ", " OFFSET ", "\n    "], ["\n      SELECT\n        o.phone,\n        COUNT(*)::bigint as ads_count,\n        (ARRAY_AGG(o.\"senderName\" ORDER BY o.\"messageDate\" DESC))[1] as last_name,\n        (ARRAY_AGG(o.\"senderUsername\" ORDER BY o.\"messageDate\" DESC))[1] as last_username,\n        (ARRAY_AGG(o.\"type\" ORDER BY o.\"messageDate\" DESC))[1] as last_type,\n        MAX(o.\"messageDate\") as last_date,\n        (ARRAY_AGG(o.\"cargoFrom\" ORDER BY o.\"messageDate\" DESC))[1] as last_from,\n        (ARRAY_AGG(o.\"cargoTo\" ORDER BY o.\"messageDate\" DESC))[1] as last_to,\n        COALESCE(b.block_count, 0) > 0 as is_blocked,\n        COALESCE(b.block_count, 0)::bigint as block_count\n      FROM \"Order\" o\n      LEFT JOIN (\n        SELECT phone, COUNT(*)::bigint as block_count\n        FROM \"BlockedUser\"\n        WHERE phone IS NOT NULL AND phone != '' AND \"isActive\" = true\n        GROUP BY phone\n      ) b ON b.phone = o.phone\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      GROUP BY o.phone, b.block_count\n      ORDER BY ads_count DESC\n      LIMIT ", " OFFSET ", "\n    "])), filters.type && filters.type !== 'ALL' ? client_1.Prisma.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["AND o.\"type\" = ", "::\"OrderType\""], ["AND o.\"type\" = ", "::\"OrderType\""])), filters.type) : client_1.Prisma.empty, filters.dateFrom ? client_1.Prisma.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["AND o.\"messageDate\" >= ", ""], ["AND o.\"messageDate\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["AND o.\"messageDate\" <= ", ""], ["AND o.\"messageDate\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty, filters.cargoFrom ? client_1.Prisma.sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["AND o.\"cargoFrom\" ILIKE ", ""], ["AND o.\"cargoFrom\" ILIKE ", ""])), '%' + filters.cargoFrom + '%') : client_1.Prisma.empty, filters.cargoTo ? client_1.Prisma.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["AND o.\"cargoTo\" ILIKE ", ""], ["AND o.\"cargoTo\" ILIKE ", ""])), '%' + filters.cargoTo + '%') : client_1.Prisma.empty, limit, skip)];
                        case 1:
                            phoneGroups = _b.sent();
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n      SELECT COUNT(DISTINCT o.phone)::bigint as total\n      FROM \"Order\" o\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n    "], ["\n      SELECT COUNT(DISTINCT o.phone)::bigint as total\n      FROM \"Order\" o\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n    "])), filters.type && filters.type !== 'ALL' ? client_1.Prisma.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["AND o.\"type\" = ", "::\"OrderType\""], ["AND o.\"type\" = ", "::\"OrderType\""])), filters.type) : client_1.Prisma.empty, filters.dateFrom ? client_1.Prisma.sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["AND o.\"messageDate\" >= ", ""], ["AND o.\"messageDate\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["AND o.\"messageDate\" <= ", ""], ["AND o.\"messageDate\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty, filters.cargoFrom ? client_1.Prisma.sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["AND o.\"cargoFrom\" ILIKE ", ""], ["AND o.\"cargoFrom\" ILIKE ", ""])), '%' + filters.cargoFrom + '%') : client_1.Prisma.empty, filters.cargoTo ? client_1.Prisma.sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["AND o.\"cargoTo\" ILIKE ", ""], ["AND o.\"cargoTo\" ILIKE ", ""])), '%' + filters.cargoTo + '%') : client_1.Prisma.empty)];
                        case 2:
                            countResult = _b.sent();
                            total = Number(((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0);
                            data = phoneGroups.map(function (row) { return ({
                                phone: row.phone,
                                adsCount: Number(row.ads_count),
                                lastSenderName: row.last_name,
                                lastUsername: row.last_username,
                                lastType: row.last_type,
                                lastDate: row.last_date,
                                lastFrom: row.last_from,
                                lastTo: row.last_to,
                                isBlocked: row.is_blocked || false,
                                blockCount: Number(row.block_count || 0),
                            }); });
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        /**
         * Barcha unikal raqamlar — TXT eksport uchun (faqat raqamlar)
         */
        OrdersService_1.prototype.getUniquePhonesExport = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var phones;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$queryRaw(templateObject_18 || (templateObject_18 = __makeTemplateObject(["\n      SELECT DISTINCT o.phone\n      FROM \"Order\" o\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      ORDER BY o.phone\n    "], ["\n      SELECT DISTINCT o.phone\n      FROM \"Order\" o\n      WHERE o.phone IS NOT NULL\n        AND o.phone != ''\n        AND o.phone != ' '\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      ORDER BY o.phone\n    "])), filters.type && filters.type !== 'ALL' ? client_1.Prisma.sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["AND o.\"type\" = ", "::\"OrderType\""], ["AND o.\"type\" = ", "::\"OrderType\""])), filters.type) : client_1.Prisma.empty, filters.dateFrom ? client_1.Prisma.sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["AND o.\"messageDate\" >= ", ""], ["AND o.\"messageDate\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["AND o.\"messageDate\" <= ", ""], ["AND o.\"messageDate\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty, filters.cargoFrom ? client_1.Prisma.sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["AND o.\"cargoFrom\" ILIKE ", ""], ["AND o.\"cargoFrom\" ILIKE ", ""])), '%' + filters.cargoFrom + '%') : client_1.Prisma.empty, filters.cargoTo ? client_1.Prisma.sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["AND o.\"cargoTo\" ILIKE ", ""], ["AND o.\"cargoTo\" ILIKE ", ""])), '%' + filters.cargoTo + '%') : client_1.Prisma.empty)];
                        case 1:
                            phones = _a.sent();
                            return [2 /*return*/, phones.map(function (r) { return r.phone; })];
                    }
                });
            });
        };
        /**
         * Bloklangan senderlarning unikal raqamlari (Dispetcher bo'limi)
         */
        OrdersService_1.prototype.getBlockedPhones = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, phoneGroups, countResult, total, data;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = filters.page || 1;
                            limit = filters.limit || 50;
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_21 || (templateObject_21 = __makeTemplateObject(["\n      SELECT\n        b.phone,\n        COUNT(DISTINCT b.id)::bigint as block_count,\n        COALESCE(oc.cnt, 0)::bigint as ads_count,\n        (ARRAY_AGG(b.\"senderName\" ORDER BY b.\"createdAt\" DESC))[1] as last_name,\n        (ARRAY_AGG(b.\"senderUsername\" ORDER BY b.\"createdAt\" DESC))[1] as last_username,\n        MAX(b.\"createdAt\") as last_date,\n        (ARRAY_AGG(b.\"reason\" ORDER BY b.\"createdAt\" DESC))[1] as last_reason\n      FROM \"BlockedUser\" b\n      LEFT JOIN (\n        SELECT phone, COUNT(*)::bigint as cnt\n        FROM \"Order\"\n        WHERE phone IS NOT NULL AND phone != ''\n        GROUP BY phone\n      ) oc ON oc.phone = b.phone\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n      GROUP BY b.phone, oc.cnt\n      ORDER BY block_count DESC\n      LIMIT ", " OFFSET ", "\n    "], ["\n      SELECT\n        b.phone,\n        COUNT(DISTINCT b.id)::bigint as block_count,\n        COALESCE(oc.cnt, 0)::bigint as ads_count,\n        (ARRAY_AGG(b.\"senderName\" ORDER BY b.\"createdAt\" DESC))[1] as last_name,\n        (ARRAY_AGG(b.\"senderUsername\" ORDER BY b.\"createdAt\" DESC))[1] as last_username,\n        MAX(b.\"createdAt\") as last_date,\n        (ARRAY_AGG(b.\"reason\" ORDER BY b.\"createdAt\" DESC))[1] as last_reason\n      FROM \"BlockedUser\" b\n      LEFT JOIN (\n        SELECT phone, COUNT(*)::bigint as cnt\n        FROM \"Order\"\n        WHERE phone IS NOT NULL AND phone != ''\n        GROUP BY phone\n      ) oc ON oc.phone = b.phone\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n      GROUP BY b.phone, oc.cnt\n      ORDER BY block_count DESC\n      LIMIT ", " OFFSET ", "\n    "])), filters.dateFrom ? client_1.Prisma.sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["AND b.\"createdAt\" >= ", ""], ["AND b.\"createdAt\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_20 || (templateObject_20 = __makeTemplateObject(["AND b.\"createdAt\" <= ", ""], ["AND b.\"createdAt\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty, limit, skip)];
                        case 1:
                            phoneGroups = _b.sent();
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_24 || (templateObject_24 = __makeTemplateObject(["\n      SELECT COUNT(DISTINCT b.phone)::bigint as total\n      FROM \"BlockedUser\" b\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n    "], ["\n      SELECT COUNT(DISTINCT b.phone)::bigint as total\n      FROM \"BlockedUser\" b\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n    "])), filters.dateFrom ? client_1.Prisma.sql(templateObject_22 || (templateObject_22 = __makeTemplateObject(["AND b.\"createdAt\" >= ", ""], ["AND b.\"createdAt\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_23 || (templateObject_23 = __makeTemplateObject(["AND b.\"createdAt\" <= ", ""], ["AND b.\"createdAt\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty)];
                        case 2:
                            countResult = _b.sent();
                            total = Number(((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0);
                            data = phoneGroups.map(function (row) { return ({
                                phone: row.phone,
                                adsCount: Number(row.ads_count),
                                blockCount: Number(row.block_count),
                                isBlocked: true,
                                lastSenderName: row.last_name,
                                lastUsername: row.last_username,
                                lastType: 'BLOCKED',
                                lastDate: row.last_date,
                                lastFrom: null,
                                lastTo: null,
                                lastReason: row.last_reason,
                            }); });
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        /**
         * Bloklangan raqamlar — TXT eksport
         */
        OrdersService_1.prototype.getBlockedPhonesExport = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                var phones;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$queryRaw(templateObject_27 || (templateObject_27 = __makeTemplateObject(["\n      SELECT DISTINCT b.phone\n      FROM \"BlockedUser\" b\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n      ORDER BY b.phone\n    "], ["\n      SELECT DISTINCT b.phone\n      FROM \"BlockedUser\" b\n      WHERE b.phone IS NOT NULL\n        AND b.phone != ''\n        AND b.\"isActive\" = true\n        ", "\n        ", "\n      ORDER BY b.phone\n    "])), filters.dateFrom ? client_1.Prisma.sql(templateObject_25 || (templateObject_25 = __makeTemplateObject(["AND b.\"createdAt\" >= ", ""], ["AND b.\"createdAt\" >= ", ""])), filters.dateFrom) : client_1.Prisma.empty, filters.dateTo ? client_1.Prisma.sql(templateObject_26 || (templateObject_26 = __makeTemplateObject(["AND b.\"createdAt\" <= ", ""], ["AND b.\"createdAt\" <= ", ""])), filters.dateTo) : client_1.Prisma.empty)];
                        case 1:
                            phones = _a.sent();
                            return [2 /*return*/, phones.map(function (r) { return r.phone; })];
                    }
                });
            });
        };
        return OrdersService_1;
    }());
    __setFunctionName(_classThis, "OrdersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrdersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrdersService = _classThis;
}();
exports.OrdersService = OrdersService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27;
