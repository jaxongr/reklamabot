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
exports.UsersService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var crypto = require("crypto");
var UsersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsersService = _classThis = /** @class */ (function () {
        function UsersService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(UsersService.name);
        }
        /**
         * Create a new user
         */
        UsersService_1.prototype.create = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var user, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: data,
                                    include: {
                                        subscription: true,
                                    },
                                })];
                        case 1:
                            user = _a.sent();
                            this.logger.log("User created: ".concat(user.id));
                            return [2 /*return*/, user];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Failed to create user', error_1);
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Find all users with pagination and filtering
         */
        UsersService_1.prototype.findAll = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, skip, _b, take, where, orderBy, _c, users, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = params.skip, skip = _a === void 0 ? 0 : _a, _b = params.take, take = _b === void 0 ? 50 : _b, where = params.where, orderBy = params.orderBy;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.findMany({
                                        skip: skip,
                                        take: take,
                                        where: where,
                                        orderBy: orderBy || { createdAt: 'desc' },
                                        include: {
                                            subscription: true,
                                            sessions: {
                                                where: { status: { not: 'DELETED' } },
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    phone: true,
                                                    status: true,
                                                    isFrozen: true,
                                                    totalGroups: true,
                                                    activeGroups: true,
                                                    lastSyncAt: true,
                                                    createdAt: true,
                                                },
                                                orderBy: { createdAt: 'desc' },
                                            },
                                            _count: {
                                                select: {
                                                    ads: true,
                                                    sessions: true,
                                                    payments: true,
                                                },
                                            },
                                        },
                                    }),
                                    this.prisma.user.count({ where: where }),
                                ])];
                        case 1:
                            _c = _d.sent(), users = _c[0], total = _c[1];
                            return [2 /*return*/, {
                                    data: users,
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
         * Find user by ID
         */
        UsersService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: id },
                                include: {
                                    subscription: true,
                                    payments: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 10,
                                    },
                                },
                            })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User with ID ".concat(id, " not found"));
                            }
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        /**
         * Find user by Telegram ID
         */
        UsersService_1.prototype.findByTelegramId = function (telegramId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.user.findUnique({
                            where: { telegramId: telegramId },
                            include: {
                                subscription: true,
                            },
                        })];
                });
            });
        };
        /**
         * Find user by username
         */
        UsersService_1.prototype.findByUsername = function (username) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.user.findFirst({
                            where: { username: { equals: username, mode: 'insensitive' } },
                            include: {
                                subscription: true,
                            },
                        })];
                });
            });
        };
        /**
         * Update user
         */
        UsersService_1.prototype.update = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var user, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: id },
                                    data: data,
                                    include: {
                                        subscription: true,
                                    },
                                })];
                        case 1:
                            user = _a.sent();
                            this.logger.log("User updated: ".concat(id));
                            return [2 /*return*/, user];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error("Failed to update user: ".concat(id), error_2);
                            throw new common_1.NotFoundException("User with ID ".concat(id, " not found"));
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Update last login time
         */
        UsersService_1.prototype.updateLastLogin = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.update({
                                where: { id: id },
                                data: { updatedAt: new Date() },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Delete user (soft delete by setting status to INACTIVE)
         */
        UsersService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.update(id, {
                            status: client_1.UserStatus.SUSPENDED,
                            isActive: false,
                        })];
                });
            });
        };
        /**
         * Change user role
         */
        UsersService_1.prototype.changeRole = function (id, role) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.update(id, { role: role })];
                });
            });
        };
        /**
         * Update user subscription status
         */
        UsersService_1.prototype.updateSubscriptionStatus = function (id, status) {
            return __awaiter(this, void 0, void 0, function () {
                var userStatus;
                return __generator(this, function (_a) {
                    userStatus = status === 'active'
                        ? client_1.UserStatus.ACTIVE
                        : status === 'suspended'
                            ? client_1.UserStatus.SUSPENDED
                            : client_1.UserStatus.BANNED;
                    return [2 /*return*/, this.update(id, {
                            status: userStatus,
                            isActive: status === 'active',
                        })];
                });
            });
        };
        /**
         * Get user statistics
         */
        UsersService_1.prototype.getStatistics = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, totalAds, activeAds, closedAds, totalPosts, totalRevenue, activeSessions;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(userId)];
                        case 1:
                            user = _b.sent();
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.ad.count({ where: { userId: userId } }),
                                    this.prisma.ad.count({ where: { userId: userId, status: 'ACTIVE' } }),
                                    this.prisma.ad.count({ where: { userId: userId, status: 'CLOSED' } }),
                                    this.prisma.post.count({ where: { userId: userId } }),
                                    this.prisma.payment.aggregate({
                                        where: {
                                            userId: userId,
                                            status: 'APPROVED',
                                        },
                                        _sum: { amount: true },
                                    }),
                                    this.prisma.session.count({
                                        where: { userId: userId, status: 'ACTIVE' },
                                    }),
                                ])];
                        case 2:
                            _a = _b.sent(), totalAds = _a[0], activeAds = _a[1], closedAds = _a[2], totalPosts = _a[3], totalRevenue = _a[4], activeSessions = _a[5];
                            return [2 /*return*/, {
                                    user: {
                                        id: user.id,
                                        telegramId: user.telegramId,
                                        username: user.username,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        phoneNumber: user.phoneNumber,
                                        language: user.language,
                                        role: user.role,
                                        status: user.status,
                                        isActive: user.isActive,
                                        isLineActive: user.isLineActive,
                                        brandAdText: user.brandAdText,
                                        brandAdEnabled: user.brandAdEnabled,
                                        createdAt: user.createdAt,
                                        updatedAt: user.updatedAt,
                                    },
                                    ads: {
                                        total: totalAds,
                                        active: activeAds,
                                        closed: closedAds,
                                    },
                                    posts: {
                                        total: totalPosts,
                                    },
                                    revenue: {
                                        total: totalRevenue._sum.amount || 0,
                                    },
                                    sessions: {
                                        active: activeSessions,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Search users by username or phone
         */
        UsersService_1.prototype.search = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findAll({
                            where: {
                                OR: [
                                    { username: { contains: query, mode: 'insensitive' } },
                                    { phoneNumber: { contains: query } },
                                    { firstName: { contains: query, mode: 'insensitive' } },
                                    { lastName: { contains: query, mode: 'insensitive' } },
                                ],
                            },
                        })];
                });
            });
        };
        /**
         * Get users by role
         */
        UsersService_1.prototype.findByRole = function (role) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findAll({
                            where: { role: role },
                        })];
                });
            });
        };
        /**
         * Get active users
         */
        UsersService_1.prototype.findActive = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findAll({
                            where: {
                                isActive: true,
                                status: client_1.UserStatus.ACTIVE,
                            },
                        })];
                });
            });
        };
        /**
         * Update brand advertisement
         */
        UsersService_1.prototype.updateBrandAd = function (userId, brandAdText, brandAdEnabled) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.update(userId, {
                            brandAdText: brandAdText,
                            brandAdEnabled: brandAdEnabled,
                        })];
                });
            });
        };
        /**
         * Toggle user active status
         */
        UsersService_1.prototype.toggleActive = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            user = _a.sent();
                            return [2 /*return*/, this.update(id, {
                                    isActive: !user.isActive,
                                    status: !user.isActive ? client_1.UserStatus.ACTIVE : client_1.UserStatus.SUSPENDED,
                                })];
                    }
                });
            });
        };
        /**
         * Batch update users
         */
        UsersService_1.prototype.batchUpdate = function (ids, data) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.updateMany({
                                where: { id: { in: ids } },
                                data: data,
                            })];
                        case 1:
                            result = _a.sent();
                            this.logger.log("Batch updated ".concat(result.count, " users"));
                            return [2 /*return*/, { count: result.count }];
                    }
                });
            });
        };
        /**
         * Get users with expiring subscriptions
         */
        UsersService_1.prototype.findExpiringSubscriptions = function () {
            return __awaiter(this, arguments, void 0, function (daysBeforeExpiry) {
                var expiryDate;
                if (daysBeforeExpiry === void 0) { daysBeforeExpiry = 7; }
                return __generator(this, function (_a) {
                    expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);
                    return [2 /*return*/, this.prisma.user.findMany({
                            where: {
                                subscription: {
                                    status: 'ACTIVE',
                                    endDate: {
                                        lte: expiryDate,
                                    },
                                },
                                isActive: true,
                            },
                            include: {
                                subscription: true,
                            },
                        })];
                });
            });
        };
        /**
         * Get dashboard summary for admin
         */
        UsersService_1.prototype.getDashboardSummary = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalUsers, activeUsers, newUsersThisMonth, usersByRole, usersWithSubscription;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.count(),
                                this.prisma.user.count({
                                    where: { isActive: true, status: client_1.UserStatus.ACTIVE },
                                }),
                                this.prisma.user.count({
                                    where: {
                                        createdAt: {
                                            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                                        },
                                    },
                                }),
                                this.prisma.user.groupBy({
                                    by: ['role'],
                                    _count: true,
                                }),
                                this.prisma.user.count({
                                    where: {
                                        subscription: {
                                            status: 'ACTIVE',
                                        },
                                    },
                                }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalUsers = _a[0], activeUsers = _a[1], newUsersThisMonth = _a[2], usersByRole = _a[3], usersWithSubscription = _a[4];
                            return [2 /*return*/, {
                                    totalUsers: totalUsers,
                                    activeUsers: activeUsers,
                                    newUsersThisMonth: newUsersThisMonth,
                                    usersByRole: usersByRole,
                                    usersWithSubscription: usersWithSubscription,
                                }];
                    }
                });
            });
        };
        /**
         * Linya holatini o'zgartirish
         */
        UsersService_1.prototype.setLineStatus = function (userId, isLineActive) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.update({
                                where: { id: userId },
                                data: { isLineActive: isLineActive },
                                select: { id: true, isLineActive: true },
                            })];
                        case 1:
                            user = _a.sent();
                            this.logger.log("Linya ".concat(isLineActive ? 'yoqildi' : "o'chirildi", ": userId=").concat(userId));
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        // ============================================================
        // Task 14: E'lon uchun telefon raqamlar
        // ============================================================
        UsersService_1.prototype.getAdPhones = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { adPhoneNumbers: true },
                            })];
                        case 1:
                            user = _a.sent();
                            return [2 /*return*/, (user === null || user === void 0 ? void 0 : user.adPhoneNumbers) || []];
                    }
                });
            });
        };
        UsersService_1.prototype.updateAdPhones = function (userId, phones) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.user.update({
                            where: { id: userId },
                            data: { adPhoneNumbers: phones },
                            select: { adPhoneNumbers: true },
                        })];
                });
            });
        };
        // ===================== HODIMLAR BOSHQARUVI =====================
        /**
         * Yangi hodim yaratish (username + password + role)
         */
        UsersService_1.prototype.createStaff = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, passwordHash, telegramId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findFirst({
                                where: { username: { equals: data.username, mode: 'insensitive' } },
                            })];
                        case 1:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.BadRequestException('Bu username allaqachon mavjud');
                            }
                            passwordHash = crypto.createHash('sha256').update(data.password).digest('hex');
                            telegramId = "staff_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8));
                            return [2 /*return*/, this.prisma.user.create({
                                    data: {
                                        telegramId: telegramId,
                                        username: data.username,
                                        firstName: data.firstName,
                                        phoneNumber: data.phoneNumber,
                                        role: data.role,
                                        status: 'ACTIVE',
                                        isActive: true,
                                        brandAdText: passwordHash,
                                    },
                                })];
                    }
                });
            });
        };
        /**
         * Hodim parolini o'zgartirish
         */
        UsersService_1.prototype.changePassword = function (userId, newPassword) {
            return __awaiter(this, void 0, void 0, function () {
                var passwordHash;
                return __generator(this, function (_a) {
                    passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
                    return [2 /*return*/, this.prisma.user.update({
                            where: { id: userId },
                            data: { brandAdText: passwordHash },
                            select: { id: true, username: true },
                        })];
                });
            });
        };
        /**
         * Barcha hodimlar ro'yxati (ADMIN, SUPER_ADMIN, DISPATCHER)
         */
        UsersService_1.prototype.getStaffList = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.user.findMany({
                            where: {
                                role: { in: ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'] },
                            },
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                phoneNumber: true,
                                role: true,
                                status: true,
                                isActive: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                        })];
                });
            });
        };
        return UsersService_1;
    }());
    __setFunctionName(_classThis, "UsersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
}();
exports.UsersService = UsersService;
