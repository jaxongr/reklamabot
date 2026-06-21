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
exports.SmsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var SEMYSMS_API = 'https://semysms.net/api/3';
var SEMYSMS_TOKEN = '8350b6625cce837c2b5c5a22e7a8f2a0';
var SmsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SmsService = _classThis = /** @class */ (function () {
        function SmsService_1(prisma, configService) {
            this.prisma = prisma;
            this.configService = configService;
            this.logger = new common_1.Logger(SmsService.name);
        }
        // ============================================================
        // CORE SMS SENDING
        // ============================================================
        /**
         * SMS yuborish (SemySMS API orqali)
         */
        SmsService_1.prototype.sendSms = function (phone_1, message_1) {
            return __awaiter(this, arguments, void 0, function (phone, message, options) {
                var sentById, _a, category, targetName, log, deviceId, response, result, errMsg, error_1;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            sentById = options.sentById, _a = options.category, category = _a === void 0 ? client_1.SmsCategory.GENERAL : _a, targetName = options.targetName;
                            return [4 /*yield*/, this.prisma.smsLog.create({
                                    data: {
                                        phone: phone,
                                        message: message,
                                        sentById: sentById,
                                        category: category,
                                        targetName: targetName,
                                        status: client_1.SmsStatus.PENDING,
                                    },
                                })];
                        case 1:
                            log = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 9, , 11]);
                            return [4 /*yield*/, this.getDeviceId()];
                        case 3:
                            deviceId = _b.sent();
                            return [4 /*yield*/, fetch("".concat(SEMYSMS_API, "/sms.php"), {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: new URLSearchParams({
                                        token: SEMYSMS_TOKEN,
                                        device: deviceId,
                                        phone: phone,
                                        msg: message,
                                    }),
                                })];
                        case 4:
                            response = _b.sent();
                            return [4 /*yield*/, response.json()];
                        case 5:
                            result = _b.sent();
                            if (!(result.code === '0' || result.code === 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.smsLog.update({
                                    where: { id: log.id },
                                    data: {
                                        status: client_1.SmsStatus.SENT,
                                        externalId: result.id ? String(result.id) : undefined,
                                    },
                                })];
                        case 6:
                            _b.sent();
                            this.logger.log("SMS yuborildi: ".concat(phone, " [").concat(category, "] ").concat(targetName || ''));
                            return [2 /*return*/, { success: true, id: log.id }];
                        case 7:
                            errMsg = result.error || JSON.stringify(result);
                            return [4 /*yield*/, this.prisma.smsLog.update({
                                    where: { id: log.id },
                                    data: { status: client_1.SmsStatus.FAILED, errorMessage: errMsg },
                                })];
                        case 8:
                            _b.sent();
                            this.logger.warn("SMS xato: ".concat(phone, " \u2014 ").concat(errMsg));
                            return [2 /*return*/, { success: false, error: errMsg }];
                        case 9:
                            error_1 = _b.sent();
                            return [4 /*yield*/, this.prisma.smsLog.update({
                                    where: { id: log.id },
                                    data: { status: client_1.SmsStatus.FAILED, errorMessage: error_1.message },
                                })];
                        case 10:
                            _b.sent();
                            this.logger.error("SMS exception: ".concat(phone, " \u2014 ").concat(error_1.message));
                            return [2 /*return*/, { success: false, error: error_1.message }];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Bulk SMS yuborish (ketma-ket, 500ms oraliq)
         */
        SmsService_1.prototype.sendBulk = function (recipients_1, message_1) {
            return __awaiter(this, arguments, void 0, function (recipients, message, options) {
                var results, _i, recipients_2, _a, phone, targetName, result;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            results = [];
                            _i = 0, recipients_2 = recipients;
                            _b.label = 1;
                        case 1:
                            if (!(_i < recipients_2.length)) return [3 /*break*/, 5];
                            _a = recipients_2[_i], phone = _a.phone, targetName = _a.targetName;
                            return [4 /*yield*/, this.sendSms(phone, message, {
                                    sentById: options.sentById,
                                    category: options.category,
                                    targetName: targetName,
                                })];
                        case 2:
                            result = _b.sent();
                            results.push(__assign({ phone: phone, targetName: targetName }, result));
                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/, results];
                    }
                });
            });
        };
        // ============================================================
        // DRIVERS: Haydovchilarga SMS
        // ============================================================
        /**
         * Haydovchilarga SMS — barcha aktiv haydovchilarga yoki tanlanganlarga
         */
        SmsService_1.prototype.sendToDrivers = function (message, sentById, driverIds) {
            return __awaiter(this, void 0, void 0, function () {
                var where, drivers, recipients;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {
                                phone: { not: null },
                            };
                            if (driverIds === null || driverIds === void 0 ? void 0 : driverIds.length) {
                                where.id = { in: driverIds };
                            }
                            return [4 /*yield*/, this.prisma.driverProfile.findMany({
                                    where: where,
                                    select: { id: true, phone: true, fullName: true },
                                })];
                        case 1:
                            drivers = _a.sent();
                            recipients = drivers
                                .filter(function (d) { return d.phone; })
                                .map(function (d) { return ({ phone: d.phone, targetName: d.fullName || d.phone }); });
                            return [2 /*return*/, this.sendBulk(recipients, message, {
                                    sentById: sentById,
                                    category: client_1.SmsCategory.DRIVER,
                                })];
                    }
                });
            });
        };
        /**
         * Haydovchi ro'yxati (SMS yuborish uchun)
         */
        SmsService_1.prototype.getDriversForSms = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.driverProfile.findMany({
                            where: {
                                phone: { not: null },
                            },
                            select: {
                                id: true,
                                fullName: true,
                                phone: true,
                                vehicleType: true,
                                lastCity: true,
                            },
                            orderBy: { fullName: 'asc' },
                        })];
                });
            });
        };
        // ============================================================
        // ORDERS: Order telefon raqamlariga SMS
        // ============================================================
        /**
         * Orderlar asosida SMS — tanlangan orderlarga SMS yuborish
         */
        SmsService_1.prototype.sendToOrders = function (message, sentById, orderIds) {
            return __awaiter(this, void 0, void 0, function () {
                var orders, seen, recipients, _i, orders_1, order, route;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.order.findMany({
                                where: {
                                    id: { in: orderIds },
                                    phone: { not: null },
                                },
                                select: {
                                    id: true,
                                    phone: true,
                                    cargoFrom: true,
                                    cargoTo: true,
                                    groupTitle: true,
                                    type: true,
                                },
                            })];
                        case 1:
                            orders = _a.sent();
                            seen = new Set();
                            recipients = [];
                            for (_i = 0, orders_1 = orders; _i < orders_1.length; _i++) {
                                order = orders_1[_i];
                                if (!order.phone || seen.has(order.phone))
                                    continue;
                                seen.add(order.phone);
                                route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ');
                                recipients.push({
                                    phone: order.phone,
                                    targetName: route || order.groupTitle || order.phone,
                                });
                            }
                            return [2 /*return*/, this.sendBulk(recipients, message, {
                                    sentById: sentById,
                                    category: client_1.SmsCategory.ORDER,
                                })];
                    }
                });
            });
        };
        /**
         * So'nggi orderlar ro'yxati (SMS yuborish uchun filtrlash)
         */
        SmsService_1.prototype.getOrdersForSms = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {
                        phone: { not: null },
                    };
                    if (params.type)
                        where.type = params.type;
                    if (params.search) {
                        where.OR = [
                            { phone: { contains: params.search } },
                            { cargoFrom: { contains: params.search, mode: 'insensitive' } },
                            { cargoTo: { contains: params.search, mode: 'insensitive' } },
                            { groupTitle: { contains: params.search, mode: 'insensitive' } },
                        ];
                    }
                    return [2 /*return*/, this.prisma.order.findMany({
                            where: where,
                            select: {
                                id: true,
                                phone: true,
                                cargoFrom: true,
                                cargoTo: true,
                                type: true,
                                groupTitle: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: params.limit || 100,
                        })];
                });
            });
        };
        // ============================================================
        // BLOCKED ADS: Bloklangan dispcherlar e'lonlariga SMS
        // ============================================================
        /**
         * Bloklangan foydalanuvchilar e'lonlariga SMS
         */
        SmsService_1.prototype.sendToBlockedAds = function (message, sentById, blockedUserIds) {
            return __awaiter(this, void 0, void 0, function () {
                var where, blocked, seen, recipients, _i, blocked_1, b, name_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {
                                isActive: true,
                                phone: { not: null },
                            };
                            if (blockedUserIds === null || blockedUserIds === void 0 ? void 0 : blockedUserIds.length) {
                                where.id = { in: blockedUserIds };
                            }
                            return [4 /*yield*/, this.prisma.blockedUser.findMany({
                                    where: where,
                                    select: {
                                        id: true,
                                        phone: true,
                                        senderName: true,
                                        senderUsername: true,
                                        reason: true,
                                    },
                                })];
                        case 1:
                            blocked = _a.sent();
                            seen = new Set();
                            recipients = [];
                            for (_i = 0, blocked_1 = blocked; _i < blocked_1.length; _i++) {
                                b = blocked_1[_i];
                                if (!b.phone || seen.has(b.phone))
                                    continue;
                                seen.add(b.phone);
                                name_1 = b.senderName || b.senderUsername || b.phone;
                                recipients.push({ phone: b.phone, targetName: name_1 });
                            }
                            return [2 /*return*/, this.sendBulk(recipients, message, {
                                    sentById: sentById,
                                    category: client_1.SmsCategory.BLOCKED_AD,
                                })];
                    }
                });
            });
        };
        /**
         * Bloklangan foydalanuvchilar ro'yxati
         */
        SmsService_1.prototype.getBlockedUsersForSms = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.blockedUser.findMany({
                            where: {
                                isActive: true,
                                phone: { not: null },
                            },
                            select: {
                                id: true,
                                phone: true,
                                senderName: true,
                                senderUsername: true,
                                senderTelegramId: true,
                                reason: true,
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        // ============================================================
        // SMS HISTORY & STATS
        // ============================================================
        /**
         * SMS tarixi — filtrlash bilan
         */
        SmsService_1.prototype.getHistory = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, where, _a, data, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = params.page || 1;
                            limit = params.limit || 50;
                            skip = (page - 1) * limit;
                            where = {};
                            if (params.category)
                                where.category = params.category;
                            if (params.status)
                                where.status = params.status;
                            if (params.search) {
                                where.OR = [
                                    { phone: { contains: params.search } },
                                    { targetName: { contains: params.search, mode: 'insensitive' } },
                                    { message: { contains: params.search, mode: 'insensitive' } },
                                ];
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.smsLog.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.smsLog.count({ where: where }),
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
        /**
         * SMS statistikasi
         */
        SmsService_1.prototype.getStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var today, _a, total, sent, failed, todayCount, byCategory;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.smsLog.count(),
                                    this.prisma.smsLog.count({ where: { status: client_1.SmsStatus.SENT } }),
                                    this.prisma.smsLog.count({ where: { status: client_1.SmsStatus.FAILED } }),
                                    this.prisma.smsLog.count({ where: { createdAt: { gte: today } } }),
                                    this.prisma.smsLog.groupBy({
                                        by: ['category'],
                                        _count: { id: true },
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), total = _a[0], sent = _a[1], failed = _a[2], todayCount = _a[3], byCategory = _a[4];
                            return [2 /*return*/, {
                                    total: total,
                                    sent: sent,
                                    failed: failed,
                                    todayCount: todayCount,
                                    byCategory: byCategory.reduce(function (acc, item) {
                                        var _a;
                                        return (__assign(__assign({}, acc), (_a = {}, _a[item.category] = item._count.id, _a)));
                                    }, {}),
                                }];
                    }
                });
            });
        };
        // ============================================================
        // SEMYSMS SETTINGS
        // ============================================================
        /**
         * SemySMS qurilmalar ro'yxati
         */
        SmsService_1.prototype.getDevices = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch("".concat(SEMYSMS_API, "/devices.php?token=").concat(SEMYSMS_TOKEN))];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            result = _a.sent();
                            return [2 /*return*/, result];
                        case 3:
                            error_2 = _a.sent();
                            this.logger.error("SemySMS devices error: ".concat(error_2.message));
                            return [2 /*return*/, { error: error_2.message }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * SemySMS hisobma'lumotlari
         */
        SmsService_1.prototype.getAccountInfo = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fetch("".concat(SEMYSMS_API, "/user.php?token=").concat(SEMYSMS_TOKEN))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.json()];
                        case 2:
                            error_3 = _a.sent();
                            return [2 /*return*/, { error: error_3.message }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // ============================================================
        // AUTO-SMS: Real vaqtda yangi order/blocked/driver uchun
        // ============================================================
        /**
         * Yangi order topilganda avtomatik SMS yuborish (CARGO yoki DRIVER)
         */
        SmsService_1.prototype.onNewOrder = function (order) {
            return __awaiter(this, void 0, void 0, function () {
                var config, isDriver, msg, route, category;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!order.phone)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getAutoSmsConfig()];
                        case 1:
                            config = _a.sent();
                            isDriver = order.type === 'DRIVER';
                            // Tur bo'yicha tekshirish
                            if (isDriver && !config.driverOrderEnabled)
                                return [2 /*return*/];
                            if (!isDriver && !config.cargoOrderEnabled)
                                return [2 /*return*/];
                            msg = isDriver ? (config.driverOrderTemplate || '') : (config.cargoOrderTemplate || '');
                            if (!msg.trim())
                                return [2 /*return*/];
                            route = [order.cargoFrom, order.cargoTo].filter(Boolean).join(' → ');
                            msg = msg
                                .replace(/{marshrut}/g, route || 'belgilanmagan')
                                .replace(/{tur}/g, isDriver ? 'Haydovchi' : 'Yuk')
                                .replace(/{guruh}/g, order.groupTitle || '');
                            category = isDriver ? client_1.SmsCategory.DRIVER : client_1.SmsCategory.ORDER;
                            return [4 /*yield*/, this.sendSms(order.phone, msg, {
                                    category: category,
                                    targetName: route || order.groupTitle || order.phone,
                                }).catch(function (e) { return _this.logger.error("Auto-SMS order error: ".concat(e.message)); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Yangi bloklangan foydalanuvchi topilganda avtomatik SMS
         */
        SmsService_1.prototype.onNewBlockedUser = function (blocked) {
            return __awaiter(this, void 0, void 0, function () {
                var config, msg;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!blocked.phone)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getAutoSmsConfig()];
                        case 1:
                            config = _a.sent();
                            if (!config.blockedEnabled)
                                return [2 /*return*/];
                            msg = config.blockedTemplate || '';
                            if (!msg.trim())
                                return [2 /*return*/];
                            msg = msg
                                .replace(/{ism}/g, blocked.senderName || 'Foydalanuvchi')
                                .replace(/{sabab}/g, blocked.reason || '');
                            return [4 /*yield*/, this.sendSms(blocked.phone, msg, {
                                    category: client_1.SmsCategory.BLOCKED_AD,
                                    targetName: blocked.senderName || blocked.phone,
                                }).catch(function (e) { return _this.logger.error("Auto-SMS blocked error: ".concat(e.message)); })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Auto-SMS konfiguratsiya olish
         */
        SmsService_1.prototype.getAutoSmsConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                var raw, parsed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.get('auto_sms_config')];
                        case 1:
                            raw = _a.sent();
                            if (raw) {
                                try {
                                    parsed = JSON.parse(raw);
                                    // Backward compat: eski format bo'lsa yangilash
                                    if ('orderEnabled' in parsed && !('cargoOrderEnabled' in parsed)) {
                                        return [2 /*return*/, {
                                                cargoOrderEnabled: parsed.orderEnabled || false,
                                                cargoOrderTemplate: parsed.orderTemplate || '',
                                                driverOrderEnabled: false,
                                                driverOrderTemplate: '',
                                                blockedEnabled: parsed.blockedEnabled || false,
                                                blockedTemplate: parsed.blockedTemplate || '',
                                            }];
                                    }
                                    return [2 /*return*/, parsed];
                                }
                                catch (_b) { }
                            }
                            return [2 /*return*/, {
                                    cargoOrderEnabled: false,
                                    cargoOrderTemplate: 'Sizning yuk e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
                                    driverOrderEnabled: false,
                                    driverOrderTemplate: 'Sizning haydovchi e\'loningiz topildi! {marshrut}. Biz bilan bog\'laning.',
                                    blockedEnabled: false,
                                    blockedTemplate: 'Hurmatli {ism}, sizning e\'loningiz bloklandi. Sabab: {sabab}.',
                                }];
                    }
                });
            });
        };
        /**
         * Auto-SMS konfiguratsiya saqlash
         */
        SmsService_1.prototype.setAutoSmsConfig = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.set('auto_sms_config', JSON.stringify(config))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, config];
                    }
                });
            });
        };
        // ============================================================
        // HAMMAGA SMS — barcha noyob raqamlarga
        // ============================================================
        /**
         * Barcha noyob telefon raqamlarini olish
         */
        SmsService_1.prototype.getAllPhones = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, orders, blocked, drivers, seen, phones, _i, orders_2, o, route, _b, blocked_2, b, _c, drivers_1, d;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.order.findMany({
                                    where: { phone: { not: null } },
                                    select: { phone: true, cargoFrom: true, cargoTo: true, type: true },
                                    orderBy: { createdAt: 'desc' },
                                    take: 5000,
                                }),
                                this.prisma.blockedUser.findMany({
                                    where: { isActive: true, phone: { not: null } },
                                    select: { phone: true, senderName: true },
                                }),
                                this.prisma.driverProfile.findMany({
                                    where: { phone: { not: null } },
                                    select: { phone: true, fullName: true },
                                }),
                            ])];
                        case 1:
                            _a = _d.sent(), orders = _a[0], blocked = _a[1], drivers = _a[2];
                            seen = new Set();
                            phones = [];
                            for (_i = 0, orders_2 = orders; _i < orders_2.length; _i++) {
                                o = orders_2[_i];
                                if (!o.phone || seen.has(o.phone))
                                    continue;
                                seen.add(o.phone);
                                route = [o.cargoFrom, o.cargoTo].filter(Boolean).join(' → ');
                                phones.push({ phone: o.phone, source: o.type === 'DRIVER' ? 'Haydovchi order' : 'Yuk order', name: route || o.phone });
                            }
                            for (_b = 0, blocked_2 = blocked; _b < blocked_2.length; _b++) {
                                b = blocked_2[_b];
                                if (!b.phone || seen.has(b.phone))
                                    continue;
                                seen.add(b.phone);
                                phones.push({ phone: b.phone, source: 'Bloklangan', name: b.senderName || b.phone });
                            }
                            for (_c = 0, drivers_1 = drivers; _c < drivers_1.length; _c++) {
                                d = drivers_1[_c];
                                if (!d.phone || seen.has(d.phone))
                                    continue;
                                seen.add(d.phone);
                                phones.push({ phone: d.phone, source: 'Haydovchi', name: d.fullName || d.phone });
                            }
                            return [2 /*return*/, phones];
                    }
                });
            });
        };
        /**
         * Barcha noyob raqamlarga SMS yuborish
         */
        SmsService_1.prototype.sendToAll = function (message, sentById) {
            return __awaiter(this, void 0, void 0, function () {
                var phones, recipients;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getAllPhones()];
                        case 1:
                            phones = _a.sent();
                            recipients = phones.map(function (p) { return ({ phone: p.phone, targetName: p.name }); });
                            return [2 /*return*/, this.sendBulk(recipients, message, {
                                    sentById: sentById,
                                    category: client_1.SmsCategory.GENERAL,
                                })];
                    }
                });
            });
        };
        // ============================================================
        // PRIVATE HELPERS
        // ============================================================
        /**
         * Device ID olish — config yoki birinchi aktiv qurilma
         */
        SmsService_1.prototype.getDeviceId = function () {
            return __awaiter(this, void 0, void 0, function () {
                var configured, response, result, devices, active, device, deviceId, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.get('sms_device_id')];
                        case 1:
                            configured = _a.sent();
                            if (configured)
                                return [2 /*return*/, configured];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 7, , 8]);
                            return [4 /*yield*/, fetch("".concat(SEMYSMS_API, "/devices.php?token=").concat(SEMYSMS_TOKEN))];
                        case 3:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 4:
                            result = _a.sent();
                            devices = Array.isArray(result) ? result : ((result === null || result === void 0 ? void 0 : result.data) || []);
                            if (!(devices.length > 0)) return [3 /*break*/, 6];
                            active = devices
                                .filter(function (d) { return !d.is_arhive && !d.is_archive; })
                                .sort(function (a, b) { return new Date(b.date_last_active || 0).getTime() - new Date(a.date_last_active || 0).getTime(); });
                            device = active[0] || devices[0];
                            deviceId = String(device.id);
                            // Cache it
                            return [4 /*yield*/, this.configService.set('sms_device_id', deviceId)];
                        case 5:
                            // Cache it
                            _a.sent();
                            this.logger.log("SemySMS device auto-detected: ".concat(deviceId, " (").concat(device.device_name || device.manufacturer, ", last active: ").concat(device.date_last_active, ")"));
                            return [2 /*return*/, deviceId];
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            e_1 = _a.sent();
                            this.logger.error("SemySMS device auto-detect error: ".concat(e_1.message));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/, 'active']; // Fallback
                    }
                });
            });
        };
        return SmsService_1;
    }());
    __setFunctionName(_classThis, "SmsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SmsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SmsService = _classThis;
}();
exports.SmsService = SmsService;
