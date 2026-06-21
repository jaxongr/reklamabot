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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var app_login_codes_1 = require("./app-login-codes");
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(usersService, jwtService, prisma) {
            this.usersService = usersService;
            this.jwtService = jwtService;
            this.prisma = prisma;
            this.logger = new common_1.Logger(AuthService.name);
        }
        /**
         * Authenticate user via Telegram
         */
        AuthService_1.prototype.login = function (loginDto) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, authData, role, isValid, user, userRole, existingProfile, tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            telegramId = loginDto.telegramId, authData = loginDto.authData, role = loginDto.role;
                            return [4 /*yield*/, this.verifyTelegramAuth(authData, telegramId)];
                        case 1:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.UnauthorizedException('Invalid Telegram auth data');
                            }
                            return [4 /*yield*/, this.usersService.findByTelegramId(telegramId)];
                        case 2:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 6];
                            userRole = role === 'DRIVER' ? client_1.UserRole.DRIVER : client_1.UserRole.USER;
                            return [4 /*yield*/, this.usersService.create({
                                    telegramId: telegramId,
                                    role: userRole,
                                })];
                        case 3:
                            user = _a.sent();
                            if (!(userRole === client_1.UserRole.DRIVER)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.driverProfile.create({
                                    data: { userId: user.id },
                                })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [3 /*break*/, 10];
                        case 6:
                            if (!(role === 'DRIVER' && user.role !== client_1.UserRole.DRIVER)) return [3 /*break*/, 10];
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: { role: client_1.UserRole.DRIVER },
                                })];
                        case 7:
                            // Existing user logging in as driver for the first time — update role + create profile
                            user = _a.sent();
                            return [4 /*yield*/, this.prisma.driverProfile.findUnique({
                                    where: { userId: user.id },
                                })];
                        case 8:
                            existingProfile = _a.sent();
                            if (!!existingProfile) return [3 /*break*/, 10];
                            return [4 /*yield*/, this.prisma.driverProfile.create({
                                    data: { userId: user.id },
                                })];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10:
                            if (!user.isActive) {
                                throw new common_1.UnauthorizedException('User account is suspended');
                            }
                            return [4 /*yield*/, this.generateTokens(user)];
                        case 11:
                            tokens = _a.sent();
                            // Update user info
                            return [4 /*yield*/, this.usersService.updateLastLogin(user.id)];
                        case 12:
                            // Update user info
                            _a.sent();
                            return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                    }
                });
            });
        };
        /**
         * Refresh access token
         */
        AuthService_1.prototype.refreshToken = function (refreshToken) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, user, tokens, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            payload = this.jwtService.verify(refreshToken);
                            return [4 /*yield*/, this.usersService.findOne(payload.sub)];
                        case 1:
                            user = _a.sent();
                            if (!user || !user.isActive) {
                                throw new common_1.UnauthorizedException('User not found or inactive');
                            }
                            return [4 /*yield*/, this.generateTokens(user)];
                        case 2:
                            tokens = _a.sent();
                            return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error('Invalid refresh token', error_1);
                            throw new common_1.UnauthorizedException('Invalid refresh token');
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Validate user for JWT strategy
         */
        AuthService_1.prototype.validateUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findOne(userId)];
                        case 1:
                            user = _a.sent();
                            if (!user || !user.isActive) {
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        /**
         * Verify Telegram authentication data or mobile app login code
         */
        AuthService_1.prototype.verifyTelegramAuth = function (authData, telegramId) {
            return __awaiter(this, void 0, void 0, function () {
                var entry, botToken, data, hash, rest_1, authDate, now, crypto_1, checkString, secretKey, hmac, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // === Mobile app OTP kod tekshirish ===
                            // Agar authData faqat 6 raqamdan iborat bo'lsa — bu bot orqali olingan login kod
                            if (/^\d{6}$/.test(authData.trim()) && telegramId) {
                                entry = app_login_codes_1.appLoginCodes.get(authData.trim());
                                if (entry && entry.telegramId === telegramId && entry.expiresAt > Date.now()) {
                                    // Kodni o'chirish (bir martalik)
                                    app_login_codes_1.appLoginCodes.delete(authData.trim());
                                    this.logger.log("Mobile app login: ".concat(telegramId, " muvaffaqiyatli"));
                                    return [2 /*return*/, true];
                                }
                                this.logger.warn("Mobile app login kod noto'g'ri yoki eskirgan: ".concat(telegramId));
                                return [2 /*return*/, false];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            botToken = process.env.TELEGRAM_BOT_TOKEN;
                            if (!botToken) {
                                this.logger.warn('TELEGRAM_BOT_TOKEN not set, skipping Telegram auth verification');
                                return [2 /*return*/, true];
                            }
                            data = JSON.parse(authData);
                            hash = data.hash, rest_1 = __rest(data, ["hash"]);
                            if (!hash) {
                                return [2 /*return*/, false];
                            }
                            // Check timestamp (not older than 24 hours)
                            if (data.auth_date) {
                                authDate = parseInt(data.auth_date);
                                now = Math.floor(Date.now() / 1000);
                                if (now - authDate > 86400) {
                                    this.logger.warn('Telegram auth data is too old');
                                    return [2 /*return*/, false];
                                }
                            }
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                        case 2:
                            crypto_1 = _a.sent();
                            checkString = Object.keys(rest_1)
                                .sort()
                                .map(function (key) { return "".concat(key, "=").concat(rest_1[key]); })
                                .join('\n');
                            secretKey = crypto_1
                                .createHash('sha256')
                                .update(botToken)
                                .digest();
                            hmac = crypto_1
                                .createHmac('sha256', secretKey)
                                .update(checkString)
                                .digest('hex');
                            return [2 /*return*/, hmac === hash];
                        case 3:
                            error_2 = _a.sent();
                            this.logger.error('Telegram auth verification failed', error_2);
                            // In development, allow login
                            if (process.env.NODE_ENV !== 'production') {
                                return [2 /*return*/, true];
                            }
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Generate access and refresh tokens
         */
        AuthService_1.prototype.generateTokens = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var payload, accessToken, refreshToken;
                return __generator(this, function (_a) {
                    payload = {
                        sub: user.id,
                        telegramId: user.telegramId,
                        role: user.role,
                    };
                    accessToken = this.jwtService.sign(payload, {
                        expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '2h'),
                    });
                    refreshToken = this.jwtService.sign(payload, {
                        secret: process.env.JWT_SECRET,
                        expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '30d'),
                    });
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        }];
                });
            });
        };
        /**
         * Remove sensitive data from user object
         */
        AuthService_1.prototype.sanitizeUser = function (user) {
            var sanitized = __rest(user, []);
            return sanitized;
        };
        /**
         * Telegram Mini App auth via initData
         */
        AuthService_1.prototype.telegramWebAppAuth = function (initData) {
            return __awaiter(this, void 0, void 0, function () {
                var crypto, botToken, params, hash, dataCheckString, secretKey, computedHash, authDate, userStr, tgUser, telegramId, user, tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                        case 1:
                            crypto = _a.sent();
                            botToken = process.env.TELEGRAM_BOT_TOKEN;
                            if (!botToken) {
                                throw new common_1.UnauthorizedException('Bot token not configured');
                            }
                            params = new URLSearchParams(initData);
                            hash = params.get('hash');
                            if (!hash) {
                                throw new common_1.UnauthorizedException('Invalid initData: no hash');
                            }
                            // Build data-check-string (sorted, without hash)
                            params.delete('hash');
                            dataCheckString = Array.from(params.entries())
                                .sort(function (_a, _b) {
                                var a = _a[0];
                                var b = _b[0];
                                return a.localeCompare(b);
                            })
                                .map(function (_a) {
                                var k = _a[0], v = _a[1];
                                return "".concat(k, "=").concat(v);
                            })
                                .join('\n');
                            secretKey = crypto
                                .createHmac('sha256', 'WebAppData')
                                .update(botToken)
                                .digest();
                            computedHash = crypto
                                .createHmac('sha256', secretKey)
                                .update(dataCheckString)
                                .digest('hex');
                            if (computedHash !== hash) {
                                this.logger.warn('Mini App initData hash mismatch');
                                throw new common_1.UnauthorizedException('Invalid initData signature');
                            }
                            authDate = parseInt(params.get('auth_date') || '0');
                            if (Math.floor(Date.now() / 1000) - authDate > 86400) {
                                throw new common_1.UnauthorizedException('initData expired');
                            }
                            userStr = params.get('user');
                            if (!userStr) {
                                throw new common_1.UnauthorizedException('No user in initData');
                            }
                            tgUser = JSON.parse(userStr);
                            telegramId = String(tgUser.id);
                            return [4 /*yield*/, this.usersService.findByTelegramId(telegramId)];
                        case 2:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.usersService.create({
                                    telegramId: telegramId,
                                    firstName: tgUser.first_name,
                                    lastName: tgUser.last_name,
                                    username: tgUser.username,
                                    language: tgUser.language_code || 'uz',
                                    role: client_1.UserRole.USER,
                                })];
                        case 3:
                            user = _a.sent();
                            return [3 /*break*/, 6];
                        case 4: 
                        // Update info from Telegram
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    firstName: tgUser.first_name || user.firstName,
                                    lastName: tgUser.last_name || user.lastName,
                                    username: tgUser.username || user.username,
                                },
                            }).catch(function () { })];
                        case 5:
                            // Update info from Telegram
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (!user.isActive) {
                                throw new common_1.UnauthorizedException('Akkaunt bloklangan');
                            }
                            return [4 /*yield*/, this.generateTokens(user)];
                        case 7:
                            tokens = _a.sent();
                            return [4 /*yield*/, this.usersService.updateLastLogin(user.id)];
                        case 8:
                            _a.sent();
                            this.logger.log("Mini App auth: ".concat(telegramId, " (").concat(tgUser.first_name, ")"));
                            return [2 /*return*/, {
                                    user: this.sanitizeUser(user),
                                    access_token: tokens.accessToken,
                                    refresh_token: tokens.refreshToken,
                                }];
                    }
                });
            });
        };
        /**
         * Admin login with username + password (for dashboard)
         */
        AuthService_1.prototype.adminLogin = function (username, password) {
            return __awaiter(this, void 0, void 0, function () {
                var user, crypto, hashedPassword, storedPassword, defaultPasswords, defaultPass, tokens;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByUsername(username)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('Foydalanuvchi topilmadi');
                            }
                            // Check if user is admin
                            if (![client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER].includes(user.role)) {
                                throw new common_1.UnauthorizedException('Dashboard faqat adminlar uchun');
                            }
                            if (!user.isActive) {
                                throw new common_1.UnauthorizedException('Akkaunt bloklangan');
                            }
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('crypto'); })];
                        case 2:
                            crypto = _a.sent();
                            hashedPassword = crypto
                                .createHash('sha256')
                                .update(password)
                                .digest('hex');
                            storedPassword = user.brandAdText;
                            if (storedPassword && storedPassword !== hashedPassword) {
                                throw new common_1.UnauthorizedException('Parol noto\'g\'ri');
                            }
                            // If no password stored yet (first login), accept default admin password
                            if (!storedPassword) {
                                defaultPasswords = {
                                    admin: 'admin123',
                                    superadmin: 'admin123',
                                };
                                defaultPass = defaultPasswords[username.toLowerCase()];
                                if (!defaultPass || password !== defaultPass) {
                                    throw new common_1.UnauthorizedException('Parol noto\'g\'ri');
                                }
                            }
                            return [4 /*yield*/, this.generateTokens(user)];
                        case 3:
                            tokens = _a.sent();
                            return [4 /*yield*/, this.usersService.updateLastLogin(user.id)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                    }
                });
            });
        };
        /**
         * Logout user (invalidate tokens if using Redis)
         */
        AuthService_1.prototype.logout = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // If using Redis for token blacklist:
                    // await this.redisService.set(`blacklist:${userId}`, '1', 'EX', 900);
                    this.logger.log("User ".concat(userId, " logged out"));
                    return [2 /*return*/, { message: 'Logged out successfully' }];
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
