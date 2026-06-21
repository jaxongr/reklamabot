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
exports.NotificationsService = void 0;
var common_1 = require("@nestjs/common");
var NotificationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotificationsService = _classThis = /** @class */ (function () {
        function NotificationsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(NotificationsService.name);
        }
        /**
         * Task 16: Bildirishnoma yaratish
         */
        NotificationsService_1.prototype.create = function (title, message, target, sentById) {
            return __awaiter(this, void 0, void 0, function () {
                var notification, userWhere, users;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.create({
                                data: { title: title, message: message, target: target, sentById: sentById },
                            })];
                        case 1:
                            notification = _a.sent();
                            userWhere = { isActive: true };
                            if (target === 'DRIVERS') {
                                userWhere.role = 'DRIVER';
                            }
                            else if (target === 'DISPATCHERS') {
                                userWhere.role = { in: ['DISPATCHER', 'ADMIN', 'SUPER_ADMIN'] };
                            }
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: userWhere,
                                    select: { id: true },
                                })];
                        case 2:
                            users = _a.sent();
                            if (!(users.length > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.userNotification.createMany({
                                    data: users.map(function (u) { return ({
                                        userId: u.id,
                                        notificationId: notification.id,
                                    }); }),
                                    skipDuplicates: true,
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            this.logger.log("Bildirishnoma yuborildi: \"".concat(title, "\" \u2192 ").concat(users.length, " ta foydalanuvchi"));
                            return [2 /*return*/, { notification: notification, recipientCount: users.length }];
                    }
                });
            });
        };
        /**
         * Foydalanuvchi bildirishnomalari
         */
        NotificationsService_1.prototype.getUserNotifications = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var skip, _a, data, total, unreadCount;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.userNotification.findMany({
                                        where: { userId: userId },
                                        include: { notification: true },
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.userNotification.count({ where: { userId: userId } }),
                                    this.prisma.userNotification.count({ where: { userId: userId, isRead: false } }),
                                ])];
                        case 1:
                            _a = _b.sent(), data = _a[0], total = _a[1], unreadCount = _a[2];
                            return [2 /*return*/, {
                                    data: data,
                                    unreadCount: unreadCount,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        /**
         * O'qildi deb belgilash
         */
        NotificationsService_1.prototype.markAsRead = function (notificationId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.userNotification.updateMany({
                            where: { id: notificationId, userId: userId },
                            data: { isRead: true, readAt: new Date() },
                        })];
                });
            });
        };
        /**
         * FCM tokenni yangilash
         */
        NotificationsService_1.prototype.updateFcmToken = function (userId, token) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!token) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.prisma.user.updateMany({
                                    where: { fcmToken: token, id: { not: userId } },
                                    data: { fcmToken: null },
                                })];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.prisma.user.update({
                                where: { id: userId },
                                data: { fcmToken: token },
                            })];
                        case 3:
                            _a.sent();
                            this.logger.log("FCM token yangilandi: userId=".concat(userId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Barcha bildirishnomalar (admin)
         */
        NotificationsService_1.prototype.getAllNotifications = function () {
            return __awaiter(this, arguments, void 0, function (page, limit) {
                var skip, _a, data, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.notification.findMany({
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                        include: {
                                            _count: { select: { userNotifications: true } },
                                        },
                                    }),
                                    this.prisma.notification.count(),
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
        return NotificationsService_1;
    }());
    __setFunctionName(_classThis, "NotificationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsService = _classThis;
}();
exports.NotificationsService = NotificationsService;
