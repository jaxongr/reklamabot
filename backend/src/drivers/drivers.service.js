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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversService = void 0;
var common_1 = require("@nestjs/common");
var DriversService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DriversService = _classThis = /** @class */ (function () {
        function DriversService_1(prisma, systemConfig, gateway) {
            this.prisma = prisma;
            this.systemConfig = systemConfig;
            this.gateway = gateway;
            this.logger = new common_1.Logger(DriversService.name);
            this.cachedCities = null;
            this.cachedCitiesAt = 0;
        }
        DriversService_1.prototype.getCachedCities = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, locations;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            now = Date.now();
                            // Cache for 10 minutes
                            if (this.cachedCities && now - this.cachedCitiesAt < 10 * 60000) {
                                return [2 /*return*/, this.cachedCities];
                            }
                            return [4 /*yield*/, this.prisma.location.findMany({
                                    where: { type: 'CITY', lat: { not: null }, lng: { not: null } },
                                    select: { name: true, lat: true, lng: true },
                                })];
                        case 1:
                            locations = _a.sent();
                            this.cachedCities = locations.filter(function (l) { return l.lat != null && l.lng != null; });
                            this.cachedCitiesAt = now;
                            return [2 /*return*/, this.cachedCities];
                    }
                });
            });
        };
        // ============================================================
        // PROFIL
        // ============================================================
        DriversService_1.prototype.getProfile = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({
                                where: { userId: userId },
                                include: { user: { select: { telegramId: true, username: true, firstName: true, lastName: true } } },
                            })];
                        case 1:
                            profile = _a.sent();
                            if (!profile) {
                                throw new common_1.NotFoundException('Haydovchi profili topilmadi');
                            }
                            return [2 /*return*/, profile];
                    }
                });
            });
        };
        DriversService_1.prototype.updateProfile = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile) {
                                throw new common_1.NotFoundException('Haydovchi profili topilmadi');
                            }
                            return [2 /*return*/, this.prisma.driverProfile.update({
                                    where: { userId: userId },
                                    data: data,
                                })];
                    }
                });
            });
        };
        // ============================================================
        // ONLINE / OFFLINE
        // ============================================================
        DriversService_1.prototype.setOnlineStatus = function (userId, isOnline) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverProfile.update({
                            where: { userId: userId },
                            data: { isOnline: isOnline },
                        })];
                });
            });
        };
        // ============================================================
        // GPS JOYLASHUV
        // ============================================================
        DriversService_1.prototype.updateLocation = function (userId, lat, lng) {
            return __awaiter(this, void 0, void 0, function () {
                var lastCity, cities, minDist, _i, cities_1, loc, dist, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            lastCity = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.getCachedCities()];
                        case 2:
                            cities = _a.sent();
                            minDist = Infinity;
                            for (_i = 0, cities_1 = cities; _i < cities_1.length; _i++) {
                                loc = cities_1[_i];
                                dist = this.haversineDistance(lat, lng, loc.lat, loc.lng);
                                if (dist < minDist) {
                                    minDist = dist;
                                    lastCity = loc.name;
                                }
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.logger.warn('Shahar topishda xatolik:', e_1.message);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/, this.prisma.driverProfile.update({
                                where: { userId: userId },
                                data: {
                                    lastLat: lat,
                                    lastLng: lng,
                                    lastLocationAt: new Date(),
                                    lastCity: lastCity,
                                },
                            })];
                    }
                });
            });
        };
        DriversService_1.prototype.haversineDistance = function (lat1, lon1, lat2, lon2) {
            var R = 6371; // km
            var dLat = this.deg2rad(lat2 - lat1);
            var dLon = this.deg2rad(lon2 - lon1);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };
        DriversService_1.prototype.deg2rad = function (deg) {
            return deg * (Math.PI / 180);
        };
        // ============================================================
        // BUYURTMALAR (Telegram yuklar)
        // ============================================================
        DriversService_1.prototype.getOrders = function (userId, params) {
            return __awaiter(this, void 0, void 0, function () {
                var type, cargoFrom, cargoTo, _a, page, _b, limit, nearMe, where, profile, _c, data, total, phoneRegex, sanitized;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            type = params.type, cargoFrom = params.cargoFrom, cargoTo = params.cargoTo, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 20 : _b, nearMe = params.nearMe;
                            where = {};
                            if (type)
                                where.type = type;
                            if (cargoFrom)
                                where.cargoFrom = { contains: cargoFrom, mode: 'insensitive' };
                            if (cargoTo)
                                where.cargoTo = { contains: cargoTo, mode: 'insensitive' };
                            if (!nearMe) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _d.sent();
                            if (profile === null || profile === void 0 ? void 0 : profile.lastCity) {
                                where.cargoFrom = { contains: profile.lastCity, mode: 'insensitive' };
                            }
                            _d.label = 2;
                        case 2: return [4 /*yield*/, Promise.all([
                                this.prisma.order.findMany({
                                    where: where,
                                    orderBy: { createdAt: 'desc' },
                                    skip: (page - 1) * limit,
                                    take: limit,
                                }),
                                this.prisma.order.count({ where: where }),
                            ])];
                        case 3:
                            _c = _d.sent(), data = _c[0], total = _c[1];
                            phoneRegex = /(\+?\d[\d\s\-()]{7,15}\d)/g;
                            sanitized = data.map(function (order) {
                                if (order.acceptedById === userId)
                                    return order;
                                var _a = order, phone = _a.phone, senderPhone = _a.senderPhone, rest = __rest(_a, ["phone", "senderPhone"]);
                                // messageText'dagi telefon raqamlarni ham yashirish
                                var cleanMessageText = rest.messageText;
                                if (cleanMessageText) {
                                    cleanMessageText = cleanMessageText.replace(phoneRegex, '** *** ** **');
                                }
                                return __assign(__assign({}, rest), { phone: null, senderPhone: null, messageText: cleanMessageText });
                            });
                            return [2 /*return*/, {
                                    data: sanitized,
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
        DriversService_1.prototype.getOrderById = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: id } })];
                        case 1:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            return [2 /*return*/, order];
                    }
                });
            });
        };
        // ============================================================
        // TAKLIFLAR (Driver Offers)
        // ============================================================
        DriversService_1.prototype.createOffer = function (userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, phone, vehicleType, offer;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _c.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi profili topilmadi');
                            phone = ((_a = data.phone) === null || _a === void 0 ? void 0 : _a.trim()) || profile.phone || '';
                            vehicleType = ((_b = data.vehicleType) === null || _b === void 0 ? void 0 : _b.trim()) || profile.vehicleType || '';
                            return [4 /*yield*/, this.prisma.driverOffer.create({
                                    data: {
                                        driverId: userId,
                                        driverProfileId: profile.id,
                                        fromCity: data.fromCity,
                                        toCity: data.toCity,
                                        vehicleType: vehicleType,
                                        vehicleCapacity: data.vehicleCapacity || profile.vehicleCapacity || null,
                                        phone: phone,
                                        description: data.description || null,
                                        price: data.price || null,
                                    },
                                    include: {
                                        driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true } },
                                    },
                                })];
                        case 2:
                            offer = _c.sent();
                            // WebSocket — dashboardga yangi taklif haqida xabar berish
                            this.gateway.emitNewDriverOffer(offer);
                            return [2 /*return*/, offer];
                    }
                });
            });
        };
        DriversService_1.prototype.getOffers = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, status, fromCity, toCity, _b, page, _c, limit, where, _d, data, total;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _a = params.status, status = _a === void 0 ? 'ACTIVE' : _a, fromCity = params.fromCity, toCity = params.toCity, _b = params.page, page = _b === void 0 ? 1 : _b, _c = params.limit, limit = _c === void 0 ? 20 : _c;
                            where = {};
                            if (status)
                                where.status = status;
                            if (fromCity)
                                where.fromCity = { contains: fromCity, mode: 'insensitive' };
                            if (toCity)
                                where.toCity = { contains: toCity, mode: 'insensitive' };
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.driverOffer.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: (page - 1) * limit,
                                        take: limit,
                                        include: {
                                            driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true } },
                                        },
                                    }),
                                    this.prisma.driverOffer.count({ where: where }),
                                ])];
                        case 1:
                            _d = _e.sent(), data = _d[0], total = _d[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        DriversService_1.prototype.getMyOffers = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverOffer.findMany({
                            where: { driverId: userId },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        DriversService_1.prototype.cancelOffer = function (userId, offerId) {
            return __awaiter(this, void 0, void 0, function () {
                var offer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverOffer.findUnique({ where: { id: offerId } })];
                        case 1:
                            offer = _a.sent();
                            if (!offer)
                                throw new common_1.NotFoundException('Taklif topilmadi');
                            if (offer.driverId !== userId)
                                throw new common_1.ForbiddenException('Bu taklif sizga tegishli emas');
                            return [2 /*return*/, this.prisma.driverOffer.update({
                                    where: { id: offerId },
                                    data: { status: 'CANCELLED' },
                                })];
                    }
                });
            });
        };
        // ============================================================
        // MAXSUS BUYURTMALAR (Private Orders)
        // ============================================================
        DriversService_1.prototype.getAvailablePrivateOrders = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.privateOrder.findMany({
                            where: {
                                OR: [
                                    { driverId: null, status: 'PENDING' },
                                    { driverId: userId, status: 'PENDING' },
                                ],
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        DriversService_1.prototype.acceptPrivateOrder = function (userId, orderId) {
            return __awaiter(this, void 0, void 0, function () {
                var order, commission, profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.privateOrder.findUnique({ where: { id: orderId } })];
                        case 1:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            if (order.status !== 'PENDING')
                                throw new common_1.BadRequestException('Buyurtma allaqachon qabul qilingan');
                            commission = order.commissionAmount || 0;
                            if (!(commission > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 2:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            if (profile.balance < commission) {
                                throw new common_1.BadRequestException("Balans yetarli emas. Kerakli: ".concat(commission, " UZS, Balans: ").concat(profile.balance, " UZS"));
                            }
                            // Balans yechish + tranzaksiya
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.driverProfile.update({
                                        where: { userId: userId },
                                        data: { balance: { decrement: commission } },
                                    }),
                                    this.prisma.driverTransaction.create({
                                        data: {
                                            driverProfileId: profile.id,
                                            amount: -commission,
                                            type: 'COMMISSION',
                                            description: "Buyurtma #".concat(orderId, " komissiyasi"),
                                            referenceId: orderId,
                                        },
                                    }),
                                    this.prisma.privateOrder.update({
                                        where: { id: orderId },
                                        data: {
                                            driverId: userId,
                                            status: 'ACCEPTED',
                                            commissionPaid: true,
                                        },
                                    }),
                                ])];
                        case 3:
                            // Balans yechish + tranzaksiya
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this.prisma.privateOrder.update({
                                where: { id: orderId },
                                data: { driverId: userId, status: 'ACCEPTED' },
                            })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/, { success: true, message: 'Buyurtma qabul qilindi' }];
                    }
                });
            });
        };
        DriversService_1.prototype.rejectPrivateOrder = function (userId, orderId) {
            return __awaiter(this, void 0, void 0, function () {
                var order;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.privateOrder.findUnique({ where: { id: orderId } })];
                        case 1:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            return [2 /*return*/, this.prisma.privateOrder.update({
                                    where: { id: orderId },
                                    data: { status: 'REJECTED' },
                                })];
                    }
                });
            });
        };
        // ============================================================
        // TELEGRAM ZAKAZ QABUL QILISH + TREKING
        // ============================================================
        DriversService_1.prototype.acceptTelegramOrder = function (userId, orderId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, activeCount, order, updated, e_2, acceptedOrder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi profili topilmadi');
                            // 2. Obuna tekshirish (active + muddati o'tmagan)
                            if (!profile.subscriptionActive) {
                                throw new common_1.BadRequestException('Obuna faollashtirilmagan. Avval obunani faollashtiring.');
                            }
                            if (!(profile.subscriptionEndDate && new Date(profile.subscriptionEndDate) < new Date())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.driverProfile.update({
                                    where: { userId: userId },
                                    data: { subscriptionActive: false },
                                })];
                        case 2:
                            _a.sent();
                            throw new common_1.BadRequestException('Obuna muddati tugagan. Yangilang.');
                        case 3: return [4 /*yield*/, this.prisma.order.count({
                                where: {
                                    acceptedById: userId,
                                    acceptedStatus: { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] },
                                },
                            })];
                        case 4:
                            activeCount = _a.sent();
                            if (activeCount >= 10) {
                                throw new common_1.BadRequestException('Maksimal 10 ta faol zakaz. Avval mavjudlarni yakunlang.');
                            }
                            return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: orderId } })];
                        case 5:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            if (order.acceptedById) {
                                throw new common_1.BadRequestException('Bu zakaz allaqachon qabul qilingan');
                            }
                            _a.label = 6;
                        case 6:
                            _a.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.prisma.order.updateMany({
                                    where: { id: orderId, acceptedById: null },
                                    data: {
                                        acceptedById: userId,
                                        acceptedAt: new Date(),
                                        acceptedStatus: 'ACCEPTED',
                                        status: 'CONTACTED',
                                    },
                                })];
                        case 7:
                            updated = _a.sent();
                            if (updated.count === 0) {
                                throw new common_1.BadRequestException('Bu zakaz allaqachon qabul qilingan');
                            }
                            return [3 /*break*/, 9];
                        case 8:
                            e_2 = _a.sent();
                            if (e_2 instanceof common_1.BadRequestException)
                                throw e_2;
                            throw new common_1.BadRequestException('Qabul qilishda xatolik yuz berdi');
                        case 9: return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: orderId } })];
                        case 10:
                            acceptedOrder = _a.sent();
                            // WebSocket — dashboardga xabar berish
                            if (acceptedOrder) {
                                this.gateway.emitOrderAccepted(acceptedOrder);
                            }
                            return [2 /*return*/, acceptedOrder];
                    }
                });
            });
        };
        DriversService_1.prototype.updateTrackingStatus = function (userId, orderId, status) {
            return __awaiter(this, void 0, void 0, function () {
                var order, VALID_TRANSITIONS, currentStatus, allowed, updateData, updatedOrder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: orderId } })];
                        case 1:
                            order = _a.sent();
                            if (!order)
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            if (order.acceptedById !== userId) {
                                throw new common_1.ForbiddenException('Bu zakaz sizga tegishli emas');
                            }
                            VALID_TRANSITIONS = {
                                'ACCEPTED': ['ON_WAY', 'CANCELLED'],
                                'ON_WAY': ['ARRIVED', 'CANCELLED'],
                                'ARRIVED': ['COMPLETED', 'CANCELLED'],
                            };
                            currentStatus = order.acceptedStatus || 'ACCEPTED';
                            allowed = VALID_TRANSITIONS[currentStatus];
                            if (!(allowed === null || allowed === void 0 ? void 0 : allowed.includes(status))) {
                                throw new common_1.BadRequestException("".concat(currentStatus, " dan ").concat(status, " ga o'tish mumkin emas"));
                            }
                            updateData = { acceptedStatus: status };
                            if (status === 'COMPLETED') {
                                updateData.status = 'COMPLETED';
                            }
                            return [4 /*yield*/, this.prisma.order.update({
                                    where: { id: orderId },
                                    data: updateData,
                                })];
                        case 2:
                            updatedOrder = _a.sent();
                            // WebSocket — tracking yangilanishi haqida dashboard'ga xabar berish
                            this.gateway.broadcastToDashboards('driver:trackingUpdate', {
                                orderId: orderId,
                                status: status,
                                acceptedById: userId,
                                timestamp: new Date().toISOString(),
                            });
                            return [2 /*return*/, updatedOrder];
                    }
                });
            });
        };
        DriversService_1.prototype.getMyAcceptedOrders = function (userId, statusFilter) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = { acceptedById: userId };
                    if (statusFilter === 'active') {
                        where.acceptedStatus = { in: ['ACCEPTED', 'ON_WAY', 'ARRIVED'] };
                    }
                    else if (statusFilter === 'completed') {
                        where.acceptedStatus = 'COMPLETED';
                    }
                    else if (statusFilter === 'cancelled') {
                        where.acceptedStatus = 'CANCELLED';
                    }
                    else if (statusFilter) {
                        where.acceptedStatus = statusFilter;
                    }
                    return [2 /*return*/, this.prisma.order.findMany({
                            where: where,
                            orderBy: { acceptedAt: 'desc' },
                        })];
                });
            });
        };
        // ============================================================
        // ADMIN — Haydovchilar boshqaruvi
        // ============================================================
        DriversService_1.prototype.getAllDrivers = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var search, isOnline, isVerified, _a, page, _b, limit, where, _c, data, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            search = params.search, isOnline = params.isOnline, isVerified = params.isVerified, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 20 : _b;
                            where = {};
                            if (isOnline !== undefined)
                                where.isOnline = isOnline;
                            if (isVerified !== undefined)
                                where.isVerified = isVerified;
                            if (search) {
                                where.OR = [
                                    { fullName: { contains: search, mode: 'insensitive' } },
                                    { phone: { contains: search } },
                                    { vehicleNumber: { contains: search, mode: 'insensitive' } },
                                    { user: { telegramId: { contains: search } } },
                                ];
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.driverProfile.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: (page - 1) * limit,
                                        take: limit,
                                        include: {
                                            user: { select: { id: true, telegramId: true, username: true, firstName: true, lastName: true } },
                                        },
                                    }),
                                    this.prisma.driverProfile.count({ where: where }),
                                ])];
                        case 1:
                            _c = _d.sent(), data = _c[0], total = _c[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        DriversService_1.prototype.getDriverById = function (driverProfileId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({
                                where: { id: driverProfileId },
                                include: {
                                    user: { select: { id: true, telegramId: true, username: true, firstName: true, lastName: true } },
                                    transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
                                    offers: { orderBy: { createdAt: 'desc' }, take: 20 },
                                },
                            })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi topilmadi');
                            return [2 /*return*/, profile];
                    }
                });
            });
        };
        DriversService_1.prototype.adminUpdateProfile = function (driverProfileId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, updateData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi topilmadi');
                            updateData = {};
                            if (data.fullName !== undefined)
                                updateData.fullName = data.fullName;
                            if (data.phone !== undefined)
                                updateData.phone = data.phone;
                            if (data.vehicleType !== undefined)
                                updateData.vehicleType = data.vehicleType;
                            if (data.vehicleCapacity !== undefined)
                                updateData.vehicleCapacity = data.vehicleCapacity;
                            if (data.vehicleNumber !== undefined)
                                updateData.vehicleNumber = data.vehicleNumber;
                            return [2 /*return*/, this.prisma.driverProfile.update({
                                    where: { id: driverProfileId },
                                    data: updateData,
                                    include: { user: { select: { telegramId: true, username: true, firstName: true, lastName: true } } },
                                })];
                    }
                });
            });
        };
        DriversService_1.prototype.verifyDriver = function (driverProfileId, adminId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverProfile.update({
                            where: { id: driverProfileId },
                            data: { isVerified: true, verifiedAt: new Date(), verifiedBy: adminId },
                        })];
                });
            });
        };
        DriversService_1.prototype.updateDriverBalance = function (driverProfileId, amount, description) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, type;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi topilmadi');
                            type = amount >= 0 ? 'TOP_UP' : 'COMMISSION';
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.driverProfile.update({
                                        where: { id: driverProfileId },
                                        data: { balance: { increment: amount } },
                                    }),
                                    this.prisma.driverTransaction.create({
                                        data: {
                                            driverProfileId: driverProfileId,
                                            amount: amount,
                                            type: type,
                                            description: description,
                                        },
                                    }),
                                ])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        DriversService_1.prototype.toggleSubscription = function (driverProfileId, active, days) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    data = { subscriptionActive: active };
                    if (active && days) {
                        data.subscriptionEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                    }
                    if (!active) {
                        data.subscriptionEndDate = null;
                    }
                    return [2 /*return*/, this.prisma.driverProfile.update({
                            where: { id: driverProfileId },
                            data: data,
                        })];
                });
            });
        };
        // ============================================================
        // HAYDOVCHI OBUNA TIZIMI
        // ============================================================
        DriversService_1.prototype.getDriverSubscriptionPlans = function () {
            return __awaiter(this, void 0, void 0, function () {
                var configPlans;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.systemConfig.get('driver_subscription_plans')];
                        case 1:
                            configPlans = _a.sent();
                            if (configPlans) {
                                try {
                                    return [2 /*return*/, JSON.parse(configPlans)];
                                }
                                catch (_b) { }
                            }
                            // Default rejalar
                            return [2 /*return*/, [
                                    {
                                        type: 'MONTHLY',
                                        name: 'Oylik obuna',
                                        price: 50000,
                                        currency: 'UZS',
                                        days: 30,
                                        features: [
                                            'Telegram yuklarni qabul qilish',
                                            'Telefon raqamini ko\'rish',
                                            'Treking tizimi',
                                            'Cheksiz qabul',
                                        ],
                                    },
                                    {
                                        type: 'QUARTERLY',
                                        name: '3 oylik obuna',
                                        price: 120000,
                                        currency: 'UZS',
                                        days: 90,
                                        features: [
                                            'Telegram yuklarni qabul qilish',
                                            'Telefon raqamini ko\'rish',
                                            'Treking tizimi',
                                            'Cheksiz qabul',
                                            '20% tejash',
                                        ],
                                    },
                                    {
                                        type: 'YEARLY',
                                        name: 'Yillik obuna',
                                        price: 400000,
                                        currency: 'UZS',
                                        days: 365,
                                        features: [
                                            'Telegram yuklarni qabul qilish',
                                            'Telefon raqamini ko\'rish',
                                            'Treking tizimi',
                                            'Cheksiz qabul',
                                            '33% tejash',
                                        ],
                                    },
                                ]];
                    }
                });
            });
        };
        DriversService_1.prototype.getMySubscription = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            if (!(profile.subscriptionActive && profile.subscriptionEndDate && new Date(profile.subscriptionEndDate) < new Date())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.driverProfile.update({
                                    where: { userId: userId },
                                    data: { subscriptionActive: false },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, {
                                    active: false,
                                    endDate: profile.subscriptionEndDate,
                                    expired: true,
                                    balance: profile.balance,
                                }];
                        case 3: return [2 /*return*/, {
                                active: profile.subscriptionActive,
                                endDate: profile.subscriptionEndDate,
                                expired: false,
                                balance: profile.balance,
                            }];
                    }
                });
            });
        };
        DriversService_1.prototype.purchaseSubscription = function (userId, planType) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, plans, plan, endDate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            return [4 /*yield*/, this.getDriverSubscriptionPlans()];
                        case 2:
                            plans = _a.sent();
                            plan = plans.find(function (p) { return p.type === planType; });
                            if (!plan)
                                throw new common_1.BadRequestException('Noto\'g\'ri reja turi');
                            // Balans tekshirish
                            if (profile.balance < plan.price) {
                                throw new common_1.BadRequestException("Balans yetarli emas. Kerakli: ".concat(plan.price, " UZS, Balans: ").concat(profile.balance, " UZS"));
                            }
                            endDate = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.driverProfile.update({
                                        where: { userId: userId },
                                        data: {
                                            balance: { decrement: plan.price },
                                            subscriptionActive: true,
                                            subscriptionEndDate: endDate,
                                        },
                                    }),
                                    this.prisma.driverTransaction.create({
                                        data: {
                                            driverProfileId: profile.id,
                                            amount: -plan.price,
                                            type: 'SUBSCRIPTION',
                                            description: "".concat(plan.name, " sotib olindi"),
                                        },
                                    }),
                                ])];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: "".concat(plan.name, " muvaffaqiyatli sotib olindi!"),
                                    endDate: endDate,
                                }];
                    }
                });
            });
        };
        // ============================================================
        // ADMIN — Maxsus buyurtma yaratish
        // ============================================================
        DriversService_1.prototype.createPrivateOrder = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.privateOrder.create({ data: data })];
                });
            });
        };
        DriversService_1.prototype.getAllPrivateOrders = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var status, _a, page, _b, limit, where, _c, data, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            status = params.status, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 20 : _b;
                            where = {};
                            if (status)
                                where.status = status;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.privateOrder.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: (page - 1) * limit,
                                        take: limit,
                                    }),
                                    this.prisma.privateOrder.count({ where: where }),
                                ])];
                        case 1:
                            _c = _d.sent(), data = _c[0], total = _c[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        // ============================================================
        // STATS
        // ============================================================
        DriversService_1.prototype.getDriverStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalDrivers, onlineDrivers, verifiedDrivers, totalOffers, activeOffers;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.driverProfile.count(),
                                this.prisma.driverProfile.count({ where: { isOnline: true } }),
                                this.prisma.driverProfile.count({ where: { isVerified: true } }),
                                this.prisma.driverOffer.count(),
                                this.prisma.driverOffer.count({ where: { status: 'ACTIVE' } }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalDrivers = _a[0], onlineDrivers = _a[1], verifiedDrivers = _a[2], totalOffers = _a[3], activeOffers = _a[4];
                            return [2 /*return*/, { totalDrivers: totalDrivers, onlineDrivers: onlineDrivers, verifiedDrivers: verifiedDrivers, totalOffers: totalOffers, activeOffers: activeOffers }];
                    }
                });
            });
        };
        DriversService_1.prototype.getOnlineDriversForMap = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverProfile.findMany({
                            where: { isOnline: true, lastLat: { not: null }, lastLng: { not: null } },
                            select: {
                                id: true,
                                fullName: true,
                                vehicleType: true,
                                vehicleCapacity: true,
                                vehicleNumber: true,
                                lastLat: true,
                                lastLng: true,
                                lastCity: true,
                                lastLocationAt: true,
                                isVerified: true,
                                phone: true,
                                user: { select: { telegramId: true, username: true } },
                            },
                        })];
                });
            });
        };
        // ============================================================
        // Task 9: TAKLIF TIZIMI (Referral)
        // ============================================================
        DriversService_1.prototype.generateReferralCode = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, code;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            if (profile.referralCode)
                                return [2 /*return*/, { code: profile.referralCode }];
                            code = "DR".concat(Date.now().toString(36).toUpperCase()).concat(Math.random().toString(36).substring(2, 6).toUpperCase());
                            return [4 /*yield*/, this.prisma.driverProfile.update({
                                    where: { userId: userId },
                                    data: { referralCode: code },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { code: code }];
                    }
                });
            });
        };
        DriversService_1.prototype.processInvite = function (code, invitedUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var inviterProfile, invite;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findFirst({
                                where: { referralCode: code },
                            })];
                        case 1:
                            inviterProfile = _a.sent();
                            if (!inviterProfile)
                                throw new common_1.NotFoundException('Taklif kodi topilmadi');
                            if (inviterProfile.userId === invitedUserId)
                                throw new common_1.BadRequestException("O'zingizni taklif qila olmaysiz");
                            return [4 /*yield*/, this.prisma.driverInvite.create({
                                    data: {
                                        inviterProfileId: inviterProfile.id,
                                        invitedUserId: invitedUserId,
                                        code: code,
                                        isUsed: true,
                                        usedAt: new Date(),
                                    },
                                })];
                        case 2:
                            invite = _a.sent();
                            // Referrer profilini yangilash
                            return [4 /*yield*/, this.prisma.driverProfile.update({
                                    where: { userId: invitedUserId },
                                    data: { referredById: inviterProfile.userId },
                                })];
                        case 3:
                            // Referrer profilini yangilash
                            _a.sent();
                            return [2 /*return*/, invite];
                    }
                });
            });
        };
        DriversService_1.prototype.getInviteStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile, _a, totalInvites, usedInvites, totalReward;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _b.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.driverInvite.count({ where: { inviterProfileId: profile.id } }),
                                    this.prisma.driverInvite.count({ where: { inviterProfileId: profile.id, isUsed: true } }),
                                    this.prisma.driverInvite.aggregate({
                                        where: { inviterProfileId: profile.id, rewardGiven: true },
                                        _sum: { rewardAmount: true },
                                    }),
                                ])];
                        case 2:
                            _a = _b.sent(), totalInvites = _a[0], usedInvites = _a[1], totalReward = _a[2];
                            return [2 /*return*/, {
                                    referralCode: profile.referralCode,
                                    totalInvites: totalInvites,
                                    usedInvites: usedInvites,
                                    totalReward: totalReward._sum.rewardAmount || 0,
                                }];
                    }
                });
            });
        };
        // ============================================================
        // Task 21: FOTOKONTROL
        // ============================================================
        DriversService_1.prototype.uploadVehiclePhoto = function (userId, type, url) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            return [2 /*return*/, this.prisma.vehiclePhoto.upsert({
                                    where: {
                                        driverProfileId_type: { driverProfileId: profile.id, type: type },
                                    },
                                    update: { url: url, isApproved: false, approvedBy: null, approvedAt: null, rejectionReason: null },
                                    create: { driverProfileId: profile.id, type: type, url: url },
                                })];
                    }
                });
            });
        };
        DriversService_1.prototype.getVehiclePhotos = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: userId } })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Profil topilmadi');
                            return [2 /*return*/, this.prisma.vehiclePhoto.findMany({
                                    where: { driverProfileId: profile.id },
                                    orderBy: { type: 'asc' },
                                })];
                    }
                });
            });
        };
        DriversService_1.prototype.getPendingPhotos = function () {
            return __awaiter(this, arguments, void 0, function (page, limit) {
                var skip, _a, data, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.vehiclePhoto.findMany({
                                        where: { isApproved: false },
                                        include: {
                                            driverProfile: {
                                                select: { fullName: true, vehicleType: true, phone: true, user: { select: { telegramId: true } } },
                                            },
                                        },
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.vehiclePhoto.count({ where: { isApproved: false } }),
                                ])];
                        case 1:
                            _a = _b.sent(), data = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        DriversService_1.prototype.approvePhoto = function (photoId, adminId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.vehiclePhoto.update({
                            where: { id: photoId },
                            data: { isApproved: true, approvedBy: adminId, approvedAt: new Date() },
                        })];
                });
            });
        };
        DriversService_1.prototype.rejectPhoto = function (photoId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.vehiclePhoto.update({
                            where: { id: photoId },
                            data: { rejectionReason: reason },
                        })];
                });
            });
        };
        // ============================================================
        // Task 23: HAYDOVCHI ULASH
        // ============================================================
        DriversService_1.prototype.linkDriverToOrder = function (orderId, driverProfileId) {
            return __awaiter(this, void 0, void 0, function () {
                var profile;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.driverProfile.findUnique({
                                where: { id: driverProfileId },
                                select: { userId: true, phone: true },
                            })];
                        case 1:
                            profile = _a.sent();
                            if (!profile)
                                throw new common_1.NotFoundException('Haydovchi topilmadi');
                            return [2 /*return*/, this.prisma.order.update({
                                    where: { id: orderId },
                                    data: {
                                        acceptedById: profile.userId,
                                        acceptedAt: new Date(),
                                        acceptedStatus: 'ACCEPTED',
                                        status: 'CONTACTED',
                                    },
                                })];
                    }
                });
            });
        };
        DriversService_1.prototype.getAvailableDrivers = function (cargoFrom) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = { isOnline: true };
                    if (cargoFrom) {
                        where.lastCity = { contains: cargoFrom, mode: 'insensitive' };
                    }
                    return [2 /*return*/, this.prisma.driverProfile.findMany({
                            where: where,
                            select: {
                                id: true,
                                fullName: true,
                                vehicleType: true,
                                vehicleCapacity: true,
                                phone: true,
                                lastCity: true,
                                isVerified: true,
                            },
                            orderBy: { lastLocationAt: 'desc' },
                            take: 50,
                        })];
                });
            });
        };
        return DriversService_1;
    }());
    __setFunctionName(_classThis, "DriversService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DriversService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DriversService = _classThis;
}();
exports.DriversService = DriversService;
