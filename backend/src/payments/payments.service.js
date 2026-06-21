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
exports.PaymentsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var PaymentsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PaymentsService = _classThis = /** @class */ (function () {
        function PaymentsService_1(prisma, subscriptionsService, config) {
            this.prisma = prisma;
            this.subscriptionsService = subscriptionsService;
            this.config = config;
            this.logger = new common_1.Logger(PaymentsService.name);
            this.adminChatId = this.config.get('ADMIN_PAYMENT_CHAT_ID') || '5475915736';
            this.botToken = this.config.get('TELEGRAM_BOT_TOKEN') || '';
        }
        PaymentsService_1.prototype.create = function (userId, amount, planType, extra) {
            return __awaiter(this, void 0, void 0, function () {
                var payment;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payment.create({
                                data: {
                                    userId: userId,
                                    amount: amount,
                                    currency: (extra === null || extra === void 0 ? void 0 : extra.currency) || 'UZS',
                                    status: client_1.PaymentStatus.PENDING,
                                    planType: planType,
                                    cardNumber: extra === null || extra === void 0 ? void 0 : extra.cardNumber,
                                    receiptImage: extra === null || extra === void 0 ? void 0 : extra.receiptImage,
                                    transactionId: extra === null || extra === void 0 ? void 0 : extra.transactionId,
                                },
                            })];
                        case 1:
                            payment = _a.sent();
                            this.logger.log("Payment created: ".concat(payment.id, " for user ").concat(userId));
                            // Telegram ga chek yuborish (admin chatga)
                            this.sendPaymentNotification(payment, userId).catch(function (e) {
                                return _this.logger.warn("Telegram notification failed: ".concat(e.message));
                            });
                            return [2 /*return*/, payment];
                    }
                });
            });
        };
        PaymentsService_1.prototype.sendPaymentNotification = function (payment, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, name, username, planLabels, text, url, imgUrl, https_1, http, photoUrl_1, params_1, _a, https_2, msgUrl_1, params_2, _b;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!this.botToken || !this.adminChatId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _d.sent();
                            name = [user === null || user === void 0 ? void 0 : user.firstName, user === null || user === void 0 ? void 0 : user.lastName].filter(Boolean).join(' ') || 'Noma\'lum';
                            username = (user === null || user === void 0 ? void 0 : user.username) ? "@".concat(user.username) : '';
                            planLabels = {
                                STARTER: 'Starter (50,000)',
                                BUSINESS: 'Business (150,000)',
                                PREMIUM: 'Premium (300,000)',
                                ENTERPRISE: 'Enterprise (500,000)',
                            };
                            text = [
                                "\uD83D\uDCB0 *Yangi to'lov so'rovi*",
                                "",
                                "\uD83D\uDC64 *Foydalanuvchi:* ".concat(name, " ").concat(username),
                                "\uD83D\uDCCB *Tarif:* ".concat(planLabels[payment.planType] || payment.planType),
                                "\uD83D\uDCB5 *Summa:* ".concat((_c = payment.amount) === null || _c === void 0 ? void 0 : _c.toLocaleString(), " UZS"),
                                "\uD83C\uDD94 *Payment ID:* `".concat(payment.id, "`"),
                                "",
                                "\uD83D\uDCC5 ".concat(new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })),
                            ].join('\n');
                            url = "https://api.telegram.org/bot".concat(this.botToken);
                            if (!payment.receiptImage) return [3 /*break*/, 7];
                            imgUrl = payment.receiptImage.startsWith('http')
                                ? payment.receiptImage
                                : "http://185.207.251.184:8082".concat(payment.receiptImage);
                            _d.label = 2;
                        case 2:
                            _d.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('https'); })];
                        case 3:
                            https_1 = _d.sent();
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('http'); })];
                        case 4:
                            http = _d.sent();
                            photoUrl_1 = "".concat(url, "/sendPhoto");
                            params_1 = new URLSearchParams({
                                chat_id: this.adminChatId,
                                photo: imgUrl,
                                caption: text,
                                parse_mode: 'Markdown',
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [
                                            { text: '✅ Tasdiqlash', callback_data: "pay_approve_".concat(payment.id) },
                                            { text: '❌ Rad etish', callback_data: "pay_reject_".concat(payment.id) },
                                        ],
                                    ],
                                }),
                            });
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    https_1.get("".concat(photoUrl_1, "?").concat(params_1.toString()), function (res) {
                                        res.on('data', function () { });
                                        res.on('end', resolve);
                                    }).on('error', function () { return resolve(); });
                                })];
                        case 5:
                            _d.sent();
                            return [2 /*return*/];
                        case 6:
                            _a = _d.sent();
                            return [3 /*break*/, 7];
                        case 7:
                            _d.trys.push([7, 10, , 11]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('https'); })];
                        case 8:
                            https_2 = _d.sent();
                            msgUrl_1 = "".concat(url, "/sendMessage");
                            params_2 = new URLSearchParams({
                                chat_id: this.adminChatId,
                                text: text,
                                parse_mode: 'Markdown',
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [
                                            { text: '✅ Tasdiqlash', callback_data: "pay_approve_".concat(payment.id) },
                                            { text: '❌ Rad etish', callback_data: "pay_reject_".concat(payment.id) },
                                        ],
                                    ],
                                }),
                            });
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    https_2.get("".concat(msgUrl_1, "?").concat(params_2.toString()), function (res) {
                                        res.on('data', function () { });
                                        res.on('end', resolve);
                                    }).on('error', function () { return resolve(); });
                                })];
                        case 9:
                            _d.sent();
                            return [3 /*break*/, 11];
                        case 10:
                            _b = _d.sent();
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        PaymentsService_1.prototype.findAll = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var where, _a, _b, skip, _c, take, _d, data, total;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            where = {};
                            if (params === null || params === void 0 ? void 0 : params.status) {
                                where.status = params.status;
                            }
                            if (params === null || params === void 0 ? void 0 : params.userId) {
                                where.userId = params.userId;
                            }
                            _a = params || {}, _b = _a.skip, skip = _b === void 0 ? 0 : _b, _c = _a.take, take = _c === void 0 ? 50 : _c;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.payment.findMany({
                                        where: where,
                                        skip: skip,
                                        take: take,
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    telegramId: true,
                                                    username: true,
                                                    firstName: true,
                                                    lastName: true,
                                                },
                                            },
                                        },
                                        orderBy: { createdAt: 'desc' },
                                    }),
                                    this.prisma.payment.count({ where: where }),
                                ])];
                        case 1:
                            _d = _e.sent(), data = _d[0], total = _d[1];
                            return [2 /*return*/, {
                                    data: data,
                                    meta: { total: total, skip: skip, take: take, hasMore: skip + take < total },
                                }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.findByUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var payments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payment.findMany({
                                where: { userId: userId },
                                orderBy: { createdAt: 'desc' },
                            })];
                        case 1:
                            payments = _a.sent();
                            return [2 /*return*/, { data: payments, total: payments.length }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.approve = function (id, adminId) {
            return __awaiter(this, void 0, void 0, function () {
                var payment, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payment.findUnique({
                                where: { id: id },
                            })];
                        case 1:
                            payment = _a.sent();
                            if (!payment) {
                                throw new common_1.NotFoundException('Payment not found');
                            }
                            if (payment.status !== client_1.PaymentStatus.PENDING) {
                                throw new common_1.BadRequestException('Payment is not pending');
                            }
                            return [4 /*yield*/, this.prisma.payment.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.PaymentStatus.APPROVED,
                                        verifiedBy: adminId,
                                        verifiedAt: new Date(),
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            if (!payment.planType) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.subscriptionsService.create(payment.userId, payment.planType)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            this.logger.log("Payment ".concat(id, " approved by admin ").concat(adminId));
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        PaymentsService_1.prototype.reject = function (id, adminId, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var payment, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payment.findUnique({
                                where: { id: id },
                            })];
                        case 1:
                            payment = _a.sent();
                            if (!payment) {
                                throw new common_1.NotFoundException('Payment not found');
                            }
                            if (payment.status !== client_1.PaymentStatus.PENDING) {
                                throw new common_1.BadRequestException('Payment is not pending');
                            }
                            return [4 /*yield*/, this.prisma.payment.update({
                                    where: { id: id },
                                    data: {
                                        status: client_1.PaymentStatus.REJECTED,
                                        verifiedBy: adminId,
                                        verifiedAt: new Date(),
                                        rejectReason: reason,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            this.logger.log("Payment ".concat(id, " rejected by admin ").concat(adminId, ": ").concat(reason));
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        PaymentsService_1.prototype.getStatistics = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalPayments, pendingPayments, approvedPayments, rejectedPayments, totalRevenue, pendingRevenue, todayPayments;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.payment.count(),
                                this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PENDING } }),
                                this.prisma.payment.count({ where: { status: client_1.PaymentStatus.APPROVED } }),
                                this.prisma.payment.count({ where: { status: client_1.PaymentStatus.REJECTED } }),
                                this.prisma.payment.aggregate({
                                    _sum: { amount: true },
                                    where: { status: client_1.PaymentStatus.APPROVED },
                                }),
                                this.prisma.payment.aggregate({
                                    _sum: { amount: true },
                                    where: { status: client_1.PaymentStatus.PENDING },
                                }),
                                this.prisma.payment.count({
                                    where: {
                                        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                                    },
                                }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalPayments = _a[0], pendingPayments = _a[1], approvedPayments = _a[2], rejectedPayments = _a[3], totalRevenue = _a[4], pendingRevenue = _a[5], todayPayments = _a[6];
                            return [2 /*return*/, {
                                    total: totalPayments,
                                    pending: pendingPayments,
                                    approved: approvedPayments,
                                    rejected: rejectedPayments,
                                    totalRevenue: totalRevenue._sum.amount || 0,
                                    pendingRevenue: pendingRevenue._sum.amount || 0,
                                    today: todayPayments,
                                }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.expirePending = function () {
            return __awaiter(this, arguments, void 0, function (olderThanHours) {
                var cutoff, result;
                if (olderThanHours === void 0) { olderThanHours = 48; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cutoff = new Date();
                            cutoff.setHours(cutoff.getHours() - olderThanHours);
                            return [4 /*yield*/, this.prisma.payment.updateMany({
                                    where: {
                                        status: client_1.PaymentStatus.PENDING,
                                        createdAt: { lte: cutoff },
                                    },
                                    data: { status: client_1.PaymentStatus.EXPIRED },
                                })];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Expired ".concat(result.count, " pending payments"));
                            return [2 /*return*/, result.count];
                    }
                });
            });
        };
        return PaymentsService_1;
    }());
    __setFunctionName(_classThis, "PaymentsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsService = _classThis;
}();
exports.PaymentsService = PaymentsService;
