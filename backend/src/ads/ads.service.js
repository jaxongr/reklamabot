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
exports.AdsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var AdsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AdsService = _classThis = /** @class */ (function () {
        function AdsService_1(prisma, telegramService) {
            this.prisma = prisma;
            this.telegramService = telegramService;
            this.logger = new common_1.Logger(AdsService.name);
        }
        /**
         * Create new ad
         */
        AdsService_1.prototype.create = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.ad.create({
                                    data: __assign(__assign({}, data), { userId: userId, createdBy: userId, status: client_1.AdStatus.DRAFT }),
                                })];
                        case 1:
                            ad = _a.sent();
                            this.logger.log("Ad created: ".concat(ad.id));
                            return [2 /*return*/, ad];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Failed to create ad', error_1);
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Find all ads for user with pagination
         */
        AdsService_1.prototype.findAll = function (userId, params) {
            return __awaiter(this, void 0, void 0, function () {
                var where, _a, _b, skip, _c, take, _d, ads, total;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            where = { userId: userId };
                            if (params === null || params === void 0 ? void 0 : params.status) {
                                where.status = params.status;
                            }
                            if ((params === null || params === void 0 ? void 0 : params.isPriority) !== undefined) {
                                where.isPriority = params.isPriority;
                            }
                            if (params === null || params === void 0 ? void 0 : params.search) {
                                where.OR = [
                                    { title: { contains: params.search, mode: 'insensitive' } },
                                    { description: { contains: params.search, mode: 'insensitive' } },
                                    { content: { contains: params.search, mode: 'insensitive' } },
                                ];
                            }
                            _a = params || {}, _b = _a.skip, skip = _b === void 0 ? 0 : _b, _c = _a.take, take = _c === void 0 ? 50 : _c;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.ad.findMany({
                                        where: where,
                                        skip: skip,
                                        take: take,
                                        orderBy: [{ isPriority: 'desc' }, { createdAt: 'desc' }],
                                    }),
                                    this.prisma.ad.count({ where: where }),
                                ])];
                        case 1:
                            _d = _e.sent(), ads = _d[0], total = _d[1];
                            return [2 /*return*/, {
                                    data: ads,
                                    meta: {
                                        total: total,
                                        skip: skip,
                                        take: take,
                                        hasMore: skip + take < total,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Find ad by ID
         */
        AdsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var ad;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.ad.findUnique({
                                where: { id: id },
                                include: {
                                    creator: true,
                                    user: true,
                                    posts: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 10,
                                    },
                                    _count: {
                                        select: { posts: true },
                                    },
                                },
                            })];
                        case 1:
                            ad = _a.sent();
                            if (!ad) {
                                throw new common_1.NotFoundException('Ad not found');
                            }
                            return [2 /*return*/, ad];
                    }
                });
            });
        };
        /**
         * Update ad
         */
        AdsService_1.prototype.update = function (id, userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, updatedAd, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only update your own ads');
                            }
                            // Don't allow updating closed/sold ads
                            if (ad.status === client_1.AdStatus.CLOSED || ad.status === client_1.AdStatus.SOLD_OUT || ad.status === client_1.AdStatus.ARCHIVED) {
                                throw new Error('Cannot update closed or sold ads');
                            }
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: id },
                                    data: data,
                                })];
                        case 3:
                            updatedAd = _a.sent();
                            this.logger.log("Ad updated: ".concat(id));
                            return [2 /*return*/, updatedAd];
                        case 4:
                            error_2 = _a.sent();
                            this.logger.error('Failed to update ad:', error_2);
                            throw error_2;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete ad (soft delete - archive)
         */
        AdsService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, archivedAd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only delete your own ads');
                            }
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.AdStatus.ARCHIVED,
                                    },
                                })];
                        case 2:
                            archivedAd = _a.sent();
                            this.logger.log("Ad archived: ".concat(id));
                            return [2 /*return*/, archivedAd];
                    }
                });
            });
        };
        /**
         * Publish ad (make it active)
         */
        AdsService_1.prototype.publish = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, updatedAd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only publish your own ads');
                            }
                            if (ad.status !== client_1.AdStatus.DRAFT && ad.status !== client_1.AdStatus.PAUSED) {
                                throw new Error('Ad is not in draft or paused state');
                            }
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.AdStatus.ACTIVE,
                                    },
                                })];
                        case 2:
                            updatedAd = _a.sent();
                            this.logger.log("Ad published: ".concat(id));
                            return [2 /*return*/, updatedAd];
                    }
                });
            });
        };
        /**
         * Pause ad
         */
        AdsService_1.prototype.pause = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, updatedAd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only pause your own ads');
                            }
                            if (ad.status !== client_1.AdStatus.ACTIVE) {
                                throw new Error('Ad is not active');
                            }
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.AdStatus.PAUSED,
                                    },
                                })];
                        case 2:
                            updatedAd = _a.sent();
                            this.logger.log("Ad paused: ".concat(id));
                            return [2 /*return*/, updatedAd];
                    }
                });
            });
        };
        /**
         * Close ad (mark as sold) + guruhlardan xabarlarni o'chirish
         */
        AdsService_1.prototype.close = function (id, userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, updatedAd;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only close your own ads');
                            }
                            // ACTIVE, DRAFT, PAUSED holatdagi e'lonlarni yopish mumkin
                            if (![client_1.AdStatus.ACTIVE, client_1.AdStatus.DRAFT, client_1.AdStatus.PAUSED].includes(ad.status)) {
                                throw new Error('Bu e\'lonni yopib bo\'lmaydi');
                            }
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.AdStatus.CLOSED,
                                        soldQuantity: data.soldQuantity,
                                        isSold: true,
                                        soldAt: new Date(),
                                        closedBy: userId,
                                        closedReason: data.reason,
                                        closedAmount: data.closedAmount,
                                        cargoFrom: data.cargoFrom,
                                        cargoTo: data.cargoTo,
                                        cargoType: data.cargoType,
                                        cargoWeight: data.cargoWeight,
                                        vehicleType: data.vehicleType,
                                        distance: data.distance,
                                    },
                                })];
                        case 2:
                            updatedAd = _a.sent();
                            this.logger.log("Ad closed: ".concat(id, ", sold: ").concat(data.soldQuantity));
                            // Background da xabarlarni guruhlardan o'chirish (foydalanuvchi kutmasin)
                            this.deleteAdMessagesInBackground(id).catch(function (err) {
                                return _this.logger.error("E'lon xabarlarini o'chirishda xatolik (ad: ".concat(id, "): ").concat(err.message));
                            });
                            return [2 /*return*/, updatedAd];
                    }
                });
            });
        };
        /**
         * E'lon xabarlarini background da o'chirish
         */
        AdsService_1.prototype.deleteAdMessagesInBackground = function (adId) {
            return __awaiter(this, void 0, void 0, function () {
                var histories, messagesToDelete, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.postHistory.findMany({
                                where: {
                                    post: { adId: adId },
                                    status: 'SENT',
                                    messageId: { not: null },
                                },
                                include: {
                                    group: {
                                        select: { telegramId: true, sessionId: true },
                                    },
                                },
                            })];
                        case 1:
                            histories = _a.sent();
                            if (histories.length === 0) {
                                this.logger.log("E'lon ".concat(adId, " uchun o'chiriladigan xabar topilmadi"));
                                return [2 /*return*/];
                            }
                            messagesToDelete = histories
                                .filter(function (h) { return h.messageId && h.group; })
                                .map(function (h) { return ({
                                messageId: h.messageId,
                                groupTelegramId: h.group.telegramId,
                                sessionId: h.group.sessionId,
                            }); });
                            this.logger.log("E'lon ".concat(adId, ": ").concat(messagesToDelete.length, " ta xabar o'chirilmoqda..."));
                            return [4 /*yield*/, this.telegramService.deleteAdMessages(messagesToDelete)];
                        case 2:
                            result = _a.sent();
                            this.logger.log("E'lon ".concat(adId, " xabarlari o'chirildi: ").concat(result.deleted, " muvaffaqiyat, ").concat(result.failed, " xato"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Duplicate ad
         */
        AdsService_1.prototype.duplicate = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, newAd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            ad = _a.sent();
                            if (ad.userId !== userId && ad.createdBy !== userId) {
                                throw new Error('You can only duplicate your own ads');
                            }
                            return [4 /*yield*/, this.prisma.ad.create({
                                    data: {
                                        title: "".concat(ad.title, " (Nusxa)"),
                                        content: ad.content,
                                        mediaUrls: ad.mediaUrls,
                                        mediaType: ad.mediaType,
                                        price: ad.price,
                                        currency: ad.currency,
                                        totalQuantity: ad.totalQuantity,
                                        brandAdEnabled: ad.brandAdEnabled,
                                        brandAdText: ad.brandAdText,
                                        selectedGroups: ad.selectedGroups,
                                        intervalMin: ad.intervalMin,
                                        intervalMax: ad.intervalMax,
                                        groupInterval: ad.groupInterval,
                                        isPriority: ad.isPriority,
                                        userId: userId,
                                        createdBy: userId,
                                        status: client_1.AdStatus.DRAFT,
                                    },
                                })];
                        case 2:
                            newAd = _a.sent();
                            this.logger.log("Ad duplicated: ".concat(newAd.id));
                            return [2 /*return*/, newAd];
                    }
                });
            });
        };
        /**
         * Get ad statistics
         */
        AdsService_1.prototype.getStatistics = function (adId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, _a, totalPosts, successfulPosts, failedPosts, totalViews, totalGroups;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.findOne(adId)];
                        case 1:
                            ad = _c.sent();
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.post.count({ where: { adId: adId } }),
                                    this.prisma.post.count({ where: { adId: adId, status: 'COMPLETED' } }),
                                    this.prisma.post.count({ where: { adId: adId, status: 'FAILED' } }),
                                    this.prisma.adStatistics.aggregate({
                                        _sum: { views: true },
                                        where: { adId: adId },
                                    }),
                                    this.prisma.postHistory.aggregate({
                                        where: { post: { adId: adId } },
                                        _count: { groupId: true },
                                    }),
                                ])];
                        case 2:
                            _a = _c.sent(), totalPosts = _a[0], successfulPosts = _a[1], failedPosts = _a[2], totalViews = _a[3], totalGroups = _a[4];
                            return [2 /*return*/, {
                                    ad: {
                                        id: ad.id,
                                        title: ad.title,
                                        status: ad.status,
                                        price: ad.price,
                                        currency: ad.currency,
                                        totalQuantity: ad.totalQuantity,
                                        soldQuantity: ad.soldQuantity,
                                        isSold: ad.isSold,
                                        soldAt: ad.soldAt,
                                        viewCount: ((_b = totalViews === null || totalViews === void 0 ? void 0 : totalViews._sum) === null || _b === void 0 ? void 0 : _b.views) || 0,
                                    },
                                    posts: {
                                        total: totalPosts,
                                        successful: successfulPosts,
                                        failed: failedPosts,
                                        successRate: totalPosts > 0 ? Math.round((successfulPosts / totalPosts) * 100) : 0,
                                    },
                                    engagement: {
                                        totalGroups: (totalGroups === null || totalGroups === void 0 ? void 0 : totalGroups._count) || 0,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Get price analytics for user's ads
         */
        AdsService_1.prototype.getPriceAnalytics = function (userId, params) {
            return __awaiter(this, void 0, void 0, function () {
                var where, ads, byCurrency, priceDistribution, _i, ads_1, ad, currency, revenue, itemsSold, priceRange, currency;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {
                                userId: userId,
                                status: client_1.AdStatus.CLOSED,
                                price: { not: null },
                            };
                            if ((params === null || params === void 0 ? void 0 : params.startDate) || (params === null || params === void 0 ? void 0 : params.endDate)) {
                                where.soldAt = __assign(__assign({}, (params.startDate && { gte: params.startDate })), (params.endDate && { lte: params.endDate }));
                            }
                            return [4 /*yield*/, this.prisma.ad.findMany({
                                    where: where,
                                    select: {
                                        id: true,
                                        price: true,
                                        currency: true,
                                        totalQuantity: true,
                                        soldQuantity: true,
                                        soldAt: true,
                                    },
                                })];
                        case 1:
                            ads = _a.sent();
                            if (ads.length === 0) {
                                return [2 /*return*/, {
                                        averagePrice: 0,
                                        totalRevenue: 0,
                                        totalItemsSold: 0,
                                        byCurrency: {},
                                        priceDistribution: [],
                                    }];
                            }
                            byCurrency = {};
                            priceDistribution = [];
                            for (_i = 0, ads_1 = ads; _i < ads_1.length; _i++) {
                                ad = ads_1[_i];
                                currency = ad.currency || 'UZS';
                                revenue = (ad.price || 0) * (ad.soldQuantity || 0);
                                itemsSold = ad.soldQuantity || 0;
                                if (!byCurrency[currency]) {
                                    byCurrency[currency] = {
                                        totalRevenue: 0,
                                        totalItemsSold: 0,
                                        averagePrice: 0,
                                    };
                                }
                                byCurrency[currency].totalRevenue += revenue;
                                byCurrency[currency].totalItemsSold += itemsSold;
                                byCurrency[currency].averagePrice = byCurrency[currency].totalRevenue / (byCurrency[currency].totalItemsSold || 1);
                                if (ad.price) {
                                    priceRange = this.getPriceRange(ad.price || 0);
                                    priceDistribution.push({
                                        price: String(ad.price || 0),
                                        count: itemsSold,
                                        range: priceRange,
                                    });
                                }
                            }
                            // Calculate average prices
                            for (currency in byCurrency) {
                                byCurrency[currency].averagePrice = byCurrency[currency].totalItemsSold > 0
                                    ? byCurrency[currency].totalRevenue / byCurrency[currency].totalItemsSold
                                    : 0;
                            }
                            return [2 /*return*/, {
                                    averagePrice: Object.values(byCurrency).reduce(function (sum, c) { return sum + c.averagePrice; }, 0) / Object.keys(byCurrency).length,
                                    totalRevenue: Object.values(byCurrency).reduce(function (sum, c) { return sum + c.totalRevenue; }, 0),
                                    totalItemsSold: Object.values(byCurrency).reduce(function (sum, c) { return sum + c.totalItemsSold; }, 0),
                                    byCurrency: byCurrency,
                                    priceDistribution: priceDistribution,
                                }];
                    }
                });
            });
        };
        /**
         * Helper method to get price range
         */
        AdsService_1.prototype.getPriceRange = function (price) {
            if (price < 100000)
                return '0-100K';
            if (price < 500000)
                return '100K-500K';
            if (price < 1000000)
                return '500K-1M';
            if (price < 5000000)
                return '1M-5M';
            return '5M+';
        };
        /**
         * Dashboard dan qo'lda yopilgan yuk kiritish
         */
        AdsService_1.prototype.createManualClosed = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var title, ad;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            title = data.cargoFrom && data.cargoTo
                                ? "".concat(data.cargoFrom, " \u2192 ").concat(data.cargoTo)
                                : 'Qo\'lda kiritilgan yuk';
                            return [4 /*yield*/, this.prisma.ad.create({
                                    data: {
                                        userId: userId,
                                        createdBy: userId,
                                        title: title,
                                        content: data.content || title,
                                        mediaType: 'TEXT',
                                        status: client_1.AdStatus.CLOSED,
                                        isSold: true,
                                        soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
                                        soldQuantity: 1,
                                        closedBy: userId,
                                        closedAmount: data.closedAmount,
                                        cargoFrom: data.cargoFrom,
                                        cargoTo: data.cargoTo,
                                        cargoType: data.cargoType,
                                        cargoWeight: data.cargoWeight,
                                        vehicleType: data.vehicleType,
                                        distance: data.distance,
                                        isManualEntry: true,
                                    },
                                })];
                        case 1:
                            ad = _a.sent();
                            this.logger.log("Manual closed deal created: ".concat(ad.id));
                            return [2 /*return*/, ad];
                    }
                });
            });
        };
        /**
         * Yopilgan yuklar ro'yxati (barcha yoki userId bo'yicha)
         */
        AdsService_1.prototype.findClosed = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var where, _a, _b, skip, _c, take, _d, ads, total, aggregate;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            where = {
                                status: client_1.AdStatus.CLOSED,
                                closedAmount: { not: null },
                            };
                            if (params === null || params === void 0 ? void 0 : params.userId) {
                                where.userId = params.userId;
                            }
                            if (params === null || params === void 0 ? void 0 : params.search) {
                                where.OR = [
                                    { title: { contains: params.search, mode: 'insensitive' } },
                                    { content: { contains: params.search, mode: 'insensitive' } },
                                    { cargoFrom: { contains: params.search, mode: 'insensitive' } },
                                    { cargoTo: { contains: params.search, mode: 'insensitive' } },
                                ];
                            }
                            if (params === null || params === void 0 ? void 0 : params.cargoType) {
                                where.cargoType = { contains: params.cargoType, mode: 'insensitive' };
                            }
                            if ((params === null || params === void 0 ? void 0 : params.startDate) || (params === null || params === void 0 ? void 0 : params.endDate)) {
                                where.soldAt = {};
                                if (params.startDate)
                                    where.soldAt.gte = new Date(params.startDate);
                                if (params.endDate)
                                    where.soldAt.lte = new Date(params.endDate);
                            }
                            _a = params || {}, _b = _a.skip, skip = _b === void 0 ? 0 : _b, _c = _a.take, take = _c === void 0 ? 50 : _c;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.ad.findMany({
                                        where: where,
                                        skip: skip,
                                        take: take,
                                        orderBy: { soldAt: 'desc' },
                                        include: { user: { select: { firstName: true, username: true, telegramId: true } } },
                                    }),
                                    this.prisma.ad.count({ where: where }),
                                    this.prisma.ad.aggregate({
                                        where: where,
                                        _sum: { closedAmount: true, cargoWeight: true },
                                        _avg: { closedAmount: true, cargoWeight: true },
                                        _count: true,
                                    }),
                                ])];
                        case 1:
                            _d = _e.sent(), ads = _d[0], total = _d[1], aggregate = _d[2];
                            return [2 /*return*/, {
                                    data: ads,
                                    meta: { total: total, skip: skip, take: take, hasMore: skip + take < total },
                                    stats: {
                                        totalDeals: aggregate._count,
                                        totalAmount: aggregate._sum.closedAmount || 0,
                                        totalWeight: aggregate._sum.cargoWeight || 0,
                                        avgAmount: aggregate._avg.closedAmount || 0,
                                        avgWeight: aggregate._avg.cargoWeight || 0,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Get dashboard stats for user
         */
        AdsService_1.prototype.getDashboardStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var totalUsers, activeUsers, totalAds, activeAds, draftAds, closedAds, priceAnalytics;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.count()];
                        case 1:
                            totalUsers = _a.sent();
                            return [4 /*yield*/, this.prisma.user.count({ where: { isActive: true } })];
                        case 2:
                            activeUsers = _a.sent();
                            return [4 /*yield*/, this.prisma.ad.count({ where: { userId: userId } })];
                        case 3:
                            totalAds = _a.sent();
                            return [4 /*yield*/, this.prisma.ad.count({ where: { userId: userId, status: 'ACTIVE' } })];
                        case 4:
                            activeAds = _a.sent();
                            return [4 /*yield*/, this.prisma.ad.count({ where: { userId: userId, status: 'DRAFT' } })];
                        case 5:
                            draftAds = _a.sent();
                            return [4 /*yield*/, this.prisma.ad.count({ where: { userId: userId, status: 'CLOSED' } })];
                        case 6:
                            closedAds = _a.sent();
                            return [4 /*yield*/, this.getPriceAnalytics(userId)];
                        case 7:
                            priceAnalytics = _a.sent();
                            return [2 /*return*/, {
                                    user: {
                                        totalUsers: totalUsers,
                                        activeUsers: activeUsers,
                                        totalAds: totalAds,
                                        activeAds: activeAds,
                                        draftAds: draftAds,
                                        closedAds: closedAds,
                                    },
                                    revenue: priceAnalytics,
                                }];
                    }
                });
            });
        };
        return AdsService_1;
    }());
    __setFunctionName(_classThis, "AdsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdsService = _classThis;
}();
exports.AdsService = AdsService;
