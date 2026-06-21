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
exports.TelegramBotService = void 0;
var common_1 = require("@nestjs/common");
var telegraf_1 = require("telegraf");
var filters_1 = require("telegraf/filters");
var app_login_codes_1 = require("../auth/app-login-codes");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
var https = require("https");
var http = require("http");
var PLAN_INFO = {
    STARTER: {
        name: 'Starter',
        price: 50000,
        emoji: '🟢',
        features: ['5 ta e\'lon', '1 ta session', '50 ta guruh'],
    },
    BUSINESS: {
        name: 'Business',
        price: 150000,
        emoji: '🔵',
        features: ['20 ta e\'lon', '3 ta session', '200 ta guruh'],
    },
    PREMIUM: {
        name: 'Premium',
        price: 300000,
        emoji: '🟡',
        features: ['50 ta e\'lon', '5 ta session', '500 ta guruh'],
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: 500000,
        emoji: '🔴',
        features: ['Cheksiz e\'lon', '10 ta session', 'Cheksiz guruh'],
    },
};
var TelegramBotService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TelegramBotService = _classThis = /** @class */ (function () {
        // Mobile app login kodlari — alohida modulda (circular dependency oldini olish)
        function TelegramBotService_1(config, postingService, telegramService, prisma, systemConfig, paymentsService, subscriptionsService, locationsService) {
            this.config = config;
            this.postingService = postingService;
            this.telegramService = telegramService;
            this.prisma = prisma;
            this.systemConfig = systemConfig;
            this.paymentsService = paymentsService;
            this.subscriptionsService = subscriptionsService;
            this.locationsService = locationsService;
            this.logger = new common_1.Logger(TelegramBotService.name);
            this.isBotRunning = false;
            // Foydalanuvchi holatlari
            this.pendingSessions = new Map();
            this.subscriptionFlows = new Map();
            this.awaitingAdText = new Set();
            this.pendingRegistrations = new Set(); // telegramId lar
            this.adCloseFlows = new Map();
            this.postingFlows = new Map();
            this.driverRegistrations = new Map();
            this.botToken = this.config.get('TELEGRAM_BOT_TOKEN') || '';
            this.bot = new telegraf_1.Telegraf(this.botToken, {
                handlerTimeout: 30000,
            });
        }
        // ==================== LIFECYCLE ====================
        TelegramBotService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var botInfo, miniAppUrl, e_1, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            this.logger.log('Telegram bot ishga tushmoqda...');
                            this.setupCommands();
                            this.setupErrorHandling();
                            return [4 /*yield*/, this.bot.telegram.getMe()];
                        case 1:
                            botInfo = _a.sent();
                            this.logger.log("Bot ulandi: @".concat(botInfo.username, " (").concat(botInfo.first_name, ")"));
                            miniAppUrl = this.getMiniAppUrl();
                            if (!miniAppUrl) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.bot.telegram.setChatMenuButton({
                                    menuButton: {
                                        type: 'web_app',
                                        text: 'Mini App',
                                        web_app: { url: miniAppUrl },
                                    },
                                })];
                        case 3:
                            _a.sent();
                            this.logger.log("Mini App menu button sozlandi: ".concat(miniAppUrl));
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _a.sent();
                            this.logger.warn("Mini App menu button sozlanmadi: ".concat(e_1.message));
                            return [3 /*break*/, 5];
                        case 5:
                            this.bot.launch({ dropPendingUpdates: true }).then(function () {
                                _this.isBotRunning = true;
                                _this.logger.log('Telegram bot muvaffaqiyatli ishga tushdi!');
                            }).catch(function (err) {
                                _this.logger.error('Bot ishga tushishda xatolik:', err.message);
                            });
                            return [3 /*break*/, 7];
                        case 6:
                            error_1 = _a.sent();
                            this.logger.error('Bot ishga tushirilmadi:', error_1.message);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramBotService_1.prototype.onModuleDestroy = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.isBotRunning) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.bot.stop()];
                        case 2:
                            _b.sent();
                            this.isBotRunning = false;
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramBotService_1.prototype.beforeApplicationShutdown = function () {
            this.bot.stop();
        };
        TelegramBotService_1.prototype.setupErrorHandling = function () {
            var _this = this;
            this.bot.catch(function (err, ctx) {
                _this.logger.error("Bot xatolik (".concat(ctx.update.update_id, "):"), err);
            });
        };
        // ==================== HELPERS ====================
        TelegramBotService_1.prototype.getMainMenu = function (isMaster) {
            if (isMaster === void 0) { isMaster = false; }
            if (isMaster) {
                return telegraf_1.Markup.keyboard([
                    ['✍️ E\'lon yaratish', '📊 Mening e\'lonlarim'],
                    ['👥 Tarqatish', '🛡️ Xavfsiz tarqatish'],
                    ['👥 Tobe\'larim', '📈 Hisobot'],
                    ['🛑 To\'xtatish', '🔒 E\'lon yopish'],
                    ['💳 Obuna', '📚 Yordam'],
                ]).resize();
            }
            // Tobe menyu
            return telegraf_1.Markup.keyboard([
                ['📱 Session ulash', '📋 Sessionlarim'],
                ['📈 Hisobot', '📚 Yordam'],
            ]).resize();
        };
        /** User master ekanligini tekshirish */
        TelegramBotService_1.prototype.isUserMaster = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { id: userId },
                                select: { isMaster: true },
                            })];
                        case 1:
                            user = _a.sent();
                            return [2 /*return*/, (user === null || user === void 0 ? void 0 : user.isMaster) || false];
                    }
                });
            });
        };
        /** User uchun to'g'ri menyu qaytarish */
        TelegramBotService_1.prototype.getMenuForUser = function (internalUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var isMaster;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isUserMaster(internalUserId)];
                        case 1:
                            isMaster = _a.sent();
                            return [2 /*return*/, this.getMainMenu(isMaster)];
                    }
                });
            });
        };
        /** ctx dan foydalanuvchi menyusini qaytarish (tez helper) */
        TelegramBotService_1.prototype.getMenuFromCtx = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var tgId, user;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            tgId = (_b = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                            if (!tgId)
                                return [2 /*return*/, this.getMainMenu(false)];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { telegramId: tgId },
                                    select: { isMaster: true, masterId: true },
                                })];
                        case 1:
                            user = _c.sent();
                            return [2 /*return*/, this.getMainMenu((user === null || user === void 0 ? void 0 : user.isMaster) && !(user === null || user === void 0 ? void 0 : user.masterId))];
                    }
                });
            });
        };
        TelegramBotService_1.prototype.getMiniAppUrl = function () {
            var url = this.config.get('MINI_APP_URL');
            return url || null;
        };
        TelegramBotService_1.prototype.getExpiredMenu = function () {
            return telegraf_1.Markup.keyboard([
                ['💳 Obuna'],
                ['📚 Yordam'],
            ]).resize();
        };
        TelegramBotService_1.prototype.getContactRequestKeyboard = function () {
            return telegraf_1.Markup.keyboard([
                [telegraf_1.Markup.button.contactRequest('📱 Telefon raqamni ulashish')],
            ]).oneTime().resize();
        };
        /**
         * Foydalanuvchini DB dan topish yoki yaratish
         */
        TelegramBotService_1.prototype.getOrCreateUser = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var tgId, user, refCode, newRefCode, hasActivity, _a, error_2;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            tgId = (_c = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c.toString();
                            if (!tgId)
                                return [2 /*return*/, null];
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 12, , 13]);
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { telegramId: tgId },
                                    include: { subscription: true },
                                })];
                        case 2:
                            user = _d.sent();
                            if (!!user) return [3 /*break*/, 4];
                            refCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        telegramId: tgId,
                                        firstName: ctx.from.first_name,
                                        lastName: ctx.from.last_name,
                                        username: ctx.from.username,
                                        isMaster: true,
                                        refCode: refCode,
                                    },
                                    include: { subscription: true },
                                })];
                        case 3:
                            user = _d.sent();
                            this.logger.log("Yangi foydalanuvchi yaratildi (auto-master): ".concat(tgId));
                            _d.label = 4;
                        case 4:
                            if (!(user && !user.isMaster && !user.masterId && !user.refCode)) return [3 /*break*/, 6];
                            newRefCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: { isMaster: true, refCode: newRefCode },
                                    include: { subscription: true },
                                })];
                        case 5:
                            user = _d.sent();
                            this.logger.log("Eski user auto-master qilindi: ".concat(tgId));
                            _d.label = 6;
                        case 6:
                            if (!(user && !user.isRegistered)) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.prisma.session.count({ where: { userId: user.id } })];
                        case 7:
                            _a = (_d.sent()) > 0;
                            if (_a) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.prisma.ad.count({ where: { userId: user.id } })];
                        case 8:
                            _a = (_d.sent()) > 0;
                            _d.label = 9;
                        case 9:
                            hasActivity = _a;
                            if (!hasActivity) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: { isRegistered: true, registeredAt: user.createdAt },
                                    include: { subscription: true },
                                })];
                        case 10:
                            user = _d.sent();
                            _d.label = 11;
                        case 11: return [2 /*return*/, user];
                        case 12:
                            error_2 = _d.sent();
                            this.logger.error("Foydalanuvchi olishda xatolik: ".concat(error_2.message));
                            return [2 /*return*/, null];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Trial yoki obuna tekshirish
         */
        TelegramBotService_1.prototype.checkAccess = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription, masterSub, trialEnd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Admin/Super Admin — har doim ruxsat
                            if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
                                return [2 /*return*/, { allowed: true }];
                            }
                            return [4 /*yield*/, this.prisma.subscription.findFirst({
                                    where: { userId: user.id, status: 'ACTIVE', endDate: { gt: new Date() } },
                                })];
                        case 1:
                            subscription = _a.sent();
                            if (subscription)
                                return [2 /*return*/, { allowed: true }];
                            if (!user.masterId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.subscription.findFirst({
                                    where: { userId: user.masterId, status: 'ACTIVE', endDate: { gt: new Date() } },
                                })];
                        case 2:
                            masterSub = _a.sent();
                            if (masterSub)
                                return [2 /*return*/, { allowed: true }];
                            _a.label = 3;
                        case 3:
                            // Trial: registeredAt dan 4 soat o'tganmi?
                            if (user.registeredAt) {
                                trialEnd = new Date(new Date(user.registeredAt).getTime() + 4 * 60 * 60 * 1000);
                                if (new Date() < trialEnd) {
                                    return [2 /*return*/, { allowed: true }];
                                }
                            }
                            return [2 /*return*/, { allowed: false, reason: 'trial_expired' }];
                    }
                });
            });
        };
        /**
         * Foydalanuvchini olish + ro'yxatdan o'tganini va access tekshirish
         * Feature handlerlardan chaqiriladi. null qaytsa → handler to'xtaydi
         */
        TelegramBotService_1.prototype.getUserWithAccess = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var user, access;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/, null];
                            if (!!user.isRegistered) return [3 /*break*/, 3];
                            this.pendingRegistrations.add(ctx.from.id.toString());
                            return [4 /*yield*/, ctx.reply('⚠️ Avval ro\'yxatdan o\'ting!\n\nTelefon raqamingizni ulashing:', this.getContactRequestKeyboard())];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, null];
                        case 3: return [4 /*yield*/, this.checkAccess(user)];
                        case 4:
                            access = _a.sent();
                            if (!!access.allowed) return [3 /*break*/, 6];
                            return [4 /*yield*/, ctx.reply('⏰ *Bepul sinov muddati tugadi!*\n\n' +
                                    'Botdan foydalanishni davom ettirish uchun obuna sotib oling.', __assign({ parse_mode: 'Markdown' }, this.getExpiredMenu()))];
                        case 5:
                            _a.sent();
                            return [2 /*return*/, null];
                        case 6: return [2 /*return*/, user];
                    }
                });
            });
        };
        TelegramBotService_1.prototype.downloadPhoto = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var photos, biggestPhoto, file, fileUrl, uploadDir, ext, filename, filePath;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            photos = ctx.message.photo;
                            biggestPhoto = photos[photos.length - 1];
                            return [4 /*yield*/, ctx.telegram.getFile(biggestPhoto.file_id)];
                        case 1:
                            file = _a.sent();
                            fileUrl = "https://api.telegram.org/file/bot".concat(this.botToken, "/").concat(file.file_path);
                            uploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'receipts');
                            if (!(0, fs_1.existsSync)(uploadDir)) {
                                (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
                            }
                            ext = (0, path_1.extname)(file.file_path || '.jpg') || '.jpg';
                            filename = "".concat((0, uuid_1.v4)()).concat(ext);
                            filePath = (0, path_1.join)(uploadDir, filename);
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var protocol = fileUrl.startsWith('https') ? https : http;
                                    protocol.get(fileUrl, function (response) {
                                        var stream = (0, fs_1.createWriteStream)(filePath);
                                        response.pipe(stream);
                                        stream.on('finish', function () {
                                            stream.close();
                                            resolve("/uploads/receipts/".concat(filename));
                                        });
                                        stream.on('error', reject);
                                    }).on('error', reject);
                                })];
                    }
                });
            });
        };
        // ==================== COMMANDS SETUP ====================
        TelegramBotService_1.prototype.setupCommands = function () {
            var _this = this;
            // ========== /start ==========
            this.bot.start(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var startPayload, refCode, user, access, menu, tobes, readyTobes, botInfo, refLink, miniAppUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startPayload = ctx.startPayload || '';
                            if (!(startPayload && startPayload.startsWith('ref_'))) return [3 /*break*/, 2];
                            refCode = startPayload.replace('ref_', '');
                            return [4 /*yield*/, this.handleRefLink(ctx, refCode)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 3:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!!user.isRegistered) return [3 /*break*/, 5];
                            this.pendingRegistrations.add(ctx.from.id.toString());
                            return [4 /*yield*/, ctx.reply('👋 *Assalomu alaykum!*\n\n' +
                                    '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
                                    '📲 Botdan foydalanish uchun telefon raqamingizni ulashing:', __assign({ parse_mode: 'Markdown' }, this.getContactRequestKeyboard()))];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                        case 5: return [4 /*yield*/, this.checkAccess(user)];
                        case 6:
                            access = _a.sent();
                            if (!!access.allowed) return [3 /*break*/, 8];
                            return [4 /*yield*/, ctx.reply('👋 *Assalomu alaykum!*\n\n' +
                                    '⏰ *Bepul sinov muddati tugadi!*\n\n' +
                                    'Botdan foydalanishni davom ettirish uchun obuna sotib oling.', __assign({ parse_mode: 'Markdown' }, this.getExpiredMenu()))];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                        case 8: return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 9:
                            menu = _a.sent();
                            if (!user.isMaster) return [3 /*break*/, 15];
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: { masterId: user.id },
                                    include: {
                                        sessions: { where: { status: 'ACTIVE', sessionString: { not: null } } },
                                    },
                                })];
                        case 10:
                            tobes = _a.sent();
                            readyTobes = tobes.filter(function (t) { return t.sessions.length > 0; });
                            return [4 /*yield*/, this.bot.telegram.getMe()];
                        case 11:
                            botInfo = _a.sent();
                            refLink = "https://t.me/".concat(botInfo.username, "?start=ref_").concat(user.refCode);
                            return [4 /*yield*/, ctx.reply('👑 *MASTER PANEL*\n\n' +
                                    "\uD83D\uDC65 Tobe'lar: ".concat(readyTobes.length, "/").concat(tobes.length, " tayyor\n\n") +
                                    "\uD83D\uDCCE *Referal havola:*\n`".concat(refLink, "`\n\n") +
                                    'Tobe\'larga yuborib, ular session ulaydi.\n' +
                                    '👥 Tarqatish — tobe\'lar orqali tarqatish\n\n' +
                                    '👇 Quyidagi menudan tanlang:', __assign({ parse_mode: 'Markdown' }, menu))];
                        case 12:
                            _a.sent();
                            miniAppUrl = this.getMiniAppUrl();
                            if (!miniAppUrl) return [3 /*break*/, 14];
                            return [4 /*yield*/, ctx.reply('📱 Mini App orqali buyurtmalarni kuzating:', {
                                    reply_markup: {
                                        inline_keyboard: [[
                                                { text: '📱 Mini App ochish', web_app: { url: miniAppUrl } },
                                            ]],
                                    },
                                })];
                        case 13:
                            _a.sent();
                            _a.label = 14;
                        case 14: return [3 /*break*/, 17];
                        case 15: 
                        // Tobe panel
                        return [4 /*yield*/, ctx.reply('👋 *Assalomu alaykum!*\n\n' +
                                '🤖 *Reklama Bot* ga xush kelibsiz!\n\n' +
                                '📝 *Sizning vazifalingiz:*\n' +
                                '• 📱 Session ulash\n' +
                                '• 📋 Sessionlarni boshqarish\n\n' +
                                'Master xabar yuborganda avtomatik tarqatiladi!\n\n' +
                                '👇 Quyidagi menudan tanlang:', __assign({ parse_mode: 'Markdown' }, menu))];
                        case 16:
                            // Tobe panel
                            _a.sent();
                            _a.label = 17;
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📲 /app — MOBILE APP LOGIN KODI ==========
            this.bot.command('app', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var telegramId, code, _i, appLoginCodes_1, _a, k, v, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 4]);
                            telegramId = ctx.from.id.toString();
                            code = Math.floor(100000 + Math.random() * 900000).toString();
                            // 5 daqiqa amal muddati
                            app_login_codes_1.appLoginCodes.set(code, {
                                telegramId: telegramId,
                                expiresAt: Date.now() + 5 * 60 * 1000,
                            });
                            // Eskirgan kodlarni tozalash
                            for (_i = 0, appLoginCodes_1 = app_login_codes_1.appLoginCodes; _i < appLoginCodes_1.length; _i++) {
                                _a = appLoginCodes_1[_i], k = _a[0], v = _a[1];
                                if (v.expiresAt < Date.now()) {
                                    app_login_codes_1.appLoginCodes.delete(k);
                                }
                            }
                            return [4 /*yield*/, ctx.reply('📲 *Mobile ilovaga kirish*\n\n' +
                                    "\uD83C\uDD94 Telegram ID: `".concat(telegramId, "`\n") +
                                    "\uD83D\uDD11 Login kod: `".concat(code, "`\n\n") +
                                    '📱 Ilovada:\n' +
                                    '1. *Telegram ID* maydoniga ID ni kiriting\n' +
                                    '2. *Auth ma\'lumot* maydoniga kodni kiriting\n\n' +
                                    '⏰ Kod 5 daqiqa amal qiladi.', { parse_mode: 'Markdown' })];
                        case 1:
                            _b.sent();
                            this.logger.log("App login kod yaratildi: ".concat(telegramId));
                            return [3 /*break*/, 4];
                        case 2:
                            error_3 = _b.sent();
                            this.logger.error('App login kod xatolik:', error_3);
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.')];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📱 /miniapp — MINI APP OCHISH ==========
            this.bot.command('miniapp', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var miniAppUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            miniAppUrl = this.getMiniAppUrl();
                            if (!!miniAppUrl) return [3 /*break*/, 2];
                            return [4 /*yield*/, ctx.reply('❌ Mini App hozircha sozlanmagan.')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2: return [4 /*yield*/, ctx.reply('📱 *Mini App*\n\nBuyurtmalar, balans va profilni ko\'ring:', {
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [[
                                            { text: '📱 Mini App ochish', web_app: { url: miniAppUrl } },
                                        ]],
                                },
                            })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🚛 /haydovchi — HAYDOVCHI RO'YXATDAN O'TISH ==========
            this.bot.command('haydovchi', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var telegramId, chatId, existingUser, code, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 7]);
                            telegramId = ctx.from.id.toString();
                            chatId = ctx.chat.id;
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { telegramId: telegramId },
                                    include: { driverProfile: true },
                                })];
                        case 1:
                            existingUser = _a.sent();
                            if (!(existingUser === null || existingUser === void 0 ? void 0 : existingUser.driverProfile)) return [3 /*break*/, 3];
                            code = Math.floor(100000 + Math.random() * 900000).toString();
                            app_login_codes_1.appLoginCodes.set(code, {
                                telegramId: telegramId,
                                expiresAt: Date.now() + 5 * 60 * 1000,
                            });
                            return [4 /*yield*/, ctx.reply('✅ *Siz allaqachon haydovchi sifatida ro\'yxatdan o\'tgansiz!*\n\n' +
                                    "\uD83C\uDD94 Telegram ID: `".concat(telegramId, "`\n") +
                                    "\uD83D\uDD11 Login kod: `".concat(code, "`\n\n") +
                                    '📱 Ilovada "Haydovchi" ni tanlang va kirish uchun ID va kodni kiriting.\n\n' +
                                    '⏰ Kod 5 daqiqa amal qiladi.', { parse_mode: 'Markdown' })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                        case 3:
                            // Yangi ro'yxatdan o'tish flow boshlash
                            this.driverRegistrations.set(chatId, { step: 'fullName' });
                            return [4 /*yield*/, ctx.reply('🚛 *Haydovchi sifatida ro\'yxatdan o\'tish*\n\n' +
                                    '📝 To\'liq ismingizni kiriting (Familiya Ism):', { parse_mode: 'Markdown' })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            error_4 = _a.sent();
                            this.logger.error('Haydovchi buyrug\'i xatolik:', error_4);
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.')];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📋 /takliflar — HAYDOVCHI TAKLIFLARI ==========
            this.bot.command('takliflar', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var offers, text, _i, offers_1, offer, name_1, verified, error_5;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 7]);
                            return [4 /*yield*/, this.prisma.driverOffer.findMany({
                                    where: { status: 'ACTIVE' },
                                    orderBy: { createdAt: 'desc' },
                                    take: 10,
                                    include: {
                                        driverProfile: { select: { fullName: true, vehicleType: true, vehicleCapacity: true, isVerified: true, phone: true } },
                                    },
                                })];
                        case 1:
                            offers = _c.sent();
                            if (!(offers.length === 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, ctx.reply('📋 Hozircha haydovchi takliflari yo\'q.')];
                        case 2:
                            _c.sent();
                            return [2 /*return*/];
                        case 3:
                            text = '📋 *Oxirgi haydovchi takliflari:*\n\n';
                            for (_i = 0, offers_1 = offers; _i < offers_1.length; _i++) {
                                offer = offers_1[_i];
                                name_1 = ((_a = offer.driverProfile) === null || _a === void 0 ? void 0 : _a.fullName) || 'Noma\'lum';
                                verified = ((_b = offer.driverProfile) === null || _b === void 0 ? void 0 : _b.isVerified) ? '✅' : '';
                                text += "\uD83D\uDE9B *".concat(offer.fromCity, " \u2192 ").concat(offer.toCity, "* ").concat(verified, "\n");
                                text += "\uD83D\uDC64 ".concat(name_1, " | ").concat(offer.vehicleType);
                                if (offer.vehicleCapacity)
                                    text += " | ".concat(offer.vehicleCapacity);
                                text += '\n';
                                if (offer.price)
                                    text += "\uD83D\uDCB0 ".concat(offer.price, "\n");
                                text += "\uD83D\uDCDE ".concat(offer.phone, "\n");
                                if (offer.description)
                                    text += "\uD83D\uDCDD ".concat(offer.description, "\n");
                                text += '\n';
                            }
                            return [4 /*yield*/, ctx.reply(text, { parse_mode: 'Markdown' })];
                        case 4:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            error_5 = _c.sent();
                            this.logger.error('Takliflar buyrug\'i xatolik:', error_5);
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi.')];
                        case 6:
                            _c.sent();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📱 KONTAKT (RO'YXATDAN O'TISH) ==========
            this.bot.on((0, filters_1.message)('contact'), function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var contact, telegramId, user, access, _a, _b, _c, updatedUser, regMenu, _d, regMsg, botInfo, refLink, error_6;
                var _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            contact = ctx.message.contact;
                            telegramId = ctx.from.id.toString();
                            if (!(((_e = contact.user_id) === null || _e === void 0 ? void 0 : _e.toString()) !== telegramId)) return [3 /*break*/, 2];
                            return [4 /*yield*/, ctx.reply('⚠️ Faqat o\'z telefon raqamingizni ulashishingiz mumkin!')];
                        case 1:
                            _f.sent();
                            return [2 /*return*/];
                        case 2:
                            _f.trys.push([2, 22, , 24]);
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { telegramId: telegramId } })];
                        case 3:
                            user = _f.sent();
                            if (!!user) return [3 /*break*/, 5];
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi. /start bosing.')];
                        case 4:
                            _f.sent();
                            return [2 /*return*/];
                        case 5:
                            if (!user.isRegistered) return [3 /*break*/, 12];
                            return [4 /*yield*/, this.checkAccess(user)];
                        case 6:
                            access = _f.sent();
                            if (!access.allowed) return [3 /*break*/, 9];
                            _b = (_a = ctx).reply;
                            _c = ['✅ Siz allaqachon ro\'yxatdan o\'tgansiz!'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7: return [4 /*yield*/, _b.apply(_a, _c.concat([_f.sent()]))];
                        case 8:
                            _f.sent();
                            return [3 /*break*/, 11];
                        case 9: return [4 /*yield*/, ctx.reply('⏰ *Bepul sinov muddati tugadi!*\n\nObuna sotib oling.', __assign({ parse_mode: 'Markdown' }, this.getExpiredMenu()))];
                        case 10:
                            _f.sent();
                            _f.label = 11;
                        case 11: return [2 /*return*/];
                        case 12: 
                        // DB yangilash — ro'yxatdan o'tkazish
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { telegramId: telegramId },
                                data: {
                                    phoneNumber: contact.phone_number,
                                    isRegistered: true,
                                    registeredAt: new Date(),
                                },
                            })];
                        case 13:
                            // DB yangilash — ro'yxatdan o'tkazish
                            _f.sent();
                            this.pendingRegistrations.delete(telegramId);
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { telegramId: telegramId } })];
                        case 14:
                            updatedUser = _f.sent();
                            if (!updatedUser) return [3 /*break*/, 16];
                            return [4 /*yield*/, this.getMenuForUser(updatedUser.id)];
                        case 15:
                            _d = _f.sent();
                            return [3 /*break*/, 18];
                        case 16: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 17:
                            _d = _f.sent();
                            _f.label = 18;
                        case 18:
                            regMenu = _d;
                            regMsg = '✅ *Ro\'yxatdan o\'tdingiz!*\n\n' +
                                '🎉 4 soat bepul foydalanishingiz mumkin.\n\n';
                            if (!(updatedUser && updatedUser.isMaster && updatedUser.refCode)) return [3 /*break*/, 20];
                            return [4 /*yield*/, this.bot.telegram.getMe()];
                        case 19:
                            botInfo = _f.sent();
                            refLink = "https://t.me/".concat(botInfo.username, "?start=ref_").concat(updatedUser.refCode);
                            regMsg += "\uD83D\uDCCE *Referal havola:*\n`".concat(refLink, "`\n\n");
                            _f.label = 20;
                        case 20:
                            regMsg += '👇 Quyidagi menudan tanlang:';
                            return [4 /*yield*/, ctx.reply(regMsg, __assign({ parse_mode: 'Markdown' }, regMenu))];
                        case 21:
                            _f.sent();
                            return [3 /*break*/, 24];
                        case 22:
                            error_6 = _f.sent();
                            this.logger.error("Kontakt saqlashda xatolik: ".concat(error_6.message));
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.')];
                        case 23:
                            _f.sent();
                            return [3 /*break*/, 24];
                        case 24: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📱 SESSION ULASH ==========
            this.bot.hears(/📱 Session ulash/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, menu;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!(user.isMaster && !user.masterId)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _b.sent();
                            return [4 /*yield*/, ctx.reply('❌ Master session ulay olmaydi.\nTobe\'laringiz session ulaydi.', menu)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                        case 4:
                            // Boshqa jarayonlarni tozalash
                            this.clearUserState(userId);
                            this.pendingSessions.set(userId, { step: 'phone' });
                            ctx.reply('📱 *Session ulash*\n\n' +
                                'Telegram accountingizni ulash uchun telefon raqamingizni yuboring.\n\n' +
                                '📝 *Format:* `+998901234567`\n\n' +
                                '⚠️ *Eslatma:* Kod Telegram ilovangizga keladi.\n\n' +
                                '⏳ Telefon raqamingizni kutmoqda...', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                            ])));
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📋 SESSIONLARIM (tobe o'z sessionlari) ==========
            this.bot.hears(/📋 (Mening sessionlarim|Sessionlarim)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, sessions, menu, msg, i, s, connected, statusEmoji, groupCount, buttons, _i, sessions_1, s, label, error_7, _a, _b, _c;
                var _this = this;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _e.sent();
                            if (!user)
                                return [2 /*return*/];
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.telegramService.getUserSessions(user.id)];
                        case 3:
                            sessions = _e.sent();
                            if (!(sessions.length === 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 4:
                            menu = _e.sent();
                            ctx.reply('📋 *Sessionlarim*\n\n' +
                                '🔍 Sizda hech qanday session yo\'q.\n\n' +
                                '💡 "📱 Session ulash" tugmasini bosing.', __assign({ parse_mode: 'Markdown' }, menu));
                            return [2 /*return*/];
                        case 5:
                            msg = '📋 *Sessionlarim*\n\n';
                            for (i = 0; i < sessions.length; i++) {
                                s = sessions[i];
                                connected = this.telegramService.isClientConnected(s.id);
                                statusEmoji = connected ? '🟢' : s.isFrozen ? '🔴' : '🟡';
                                groupCount = ((_d = s._count) === null || _d === void 0 ? void 0 : _d.groups) || 0;
                                msg += "".concat(i + 1, ". ").concat(statusEmoji, " *").concat(s.name || 'Nomsiz', "*\n");
                                msg += "   \uD83D\uDCDE ".concat(s.phone || '—', "\n");
                                msg += "   \uD83D\uDCCA ".concat(groupCount, " ta guruh\n");
                                msg += "   \uD83D\uDCC5 ".concat(s.status);
                                if (s.isFrozen)
                                    msg += ' (Muzlatilgan)';
                                msg += '\n\n';
                            }
                            msg += "\uD83D\uDCF1 Jami: ".concat(sessions.length, " ta session\n");
                            msg += "\uD83D\uDFE2 Ulangan: ".concat(sessions.filter(function (s) { return _this.telegramService.isClientConnected(s.id); }).length);
                            buttons = [];
                            for (_i = 0, sessions_1 = sessions; _i < sessions_1.length; _i++) {
                                s = sessions_1[_i];
                                label = "".concat(s.name || s.phone || s.id.slice(0, 8));
                                if (this.telegramService.isClientConnected(s.id)) {
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDD04 Sinxron: ".concat(label), "sync_".concat(s.id)),
                                        telegraf_1.Markup.button.callback("\uD83D\uDD0C Uzish: ".concat(label), "disconnect_".concat(s.id)),
                                    ]);
                                }
                                else if (s.status === 'ACTIVE' && s.sessionString) {
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDD17 Ulash: ".concat(label), "reconnect_".concat(s.id)),
                                        telegraf_1.Markup.button.callback("\uD83D\uDDD1 O'chirish: ".concat(label), "delete_session_".concat(s.id)),
                                    ]);
                                }
                                else {
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDDD1 O'chirish: ".concat(label), "delete_session_".concat(s.id)),
                                    ]);
                                }
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)));
                            return [3 /*break*/, 8];
                        case 6:
                            error_7 = _e.sent();
                            this.logger.error("Sessionlar ko'rsatishda xatolik: ".concat(error_7.message));
                            _b = (_a = ctx).reply;
                            _c = ['❌ Xatolik yuz berdi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7:
                            _b.apply(_a, _c.concat([_e.sent()]));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Session callback'lari
            this.bot.action(/sync_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, count, _a, _b, _c, _d, error_8, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            sessionId = ctx.match[1];
                            ctx.answerCbQuery('🔄 Sinxronlanmoqda...');
                            _h.label = 1;
                        case 1:
                            _h.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.telegramService.syncGroups(sessionId)];
                        case 2:
                            count = _h.sent();
                            _b = (_a = ctx).reply;
                            _c = ["\u2705 *Guruhlar sinxronlandi!*\n\n\uD83D\uDCCA Jami: ".concat(count, " ta guruh")];
                            _d = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([__assign.apply(void 0, _d.concat([_h.sent()]))]));
                            return [3 /*break*/, 6];
                        case 4:
                            error_8 = _h.sent();
                            _f = (_e = ctx).reply;
                            _g = ["\u274C Sinxronlashda xatolik: ".concat(error_8.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _f.apply(_e, _g.concat([_h.sent()]));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action(/disconnect_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, _a, _b, _c, error_9, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            sessionId = ctx.match[1];
                            ctx.answerCbQuery('🔌 Uzilmoqda...');
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.telegramService.disconnectSession(sessionId)];
                        case 2:
                            _g.sent();
                            _b = (_a = ctx).reply;
                            _c = ['✅ Session uzildi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_g.sent()]));
                            return [3 /*break*/, 6];
                        case 4:
                            error_9 = _g.sent();
                            _e = (_d = ctx).reply;
                            _f = ["\u274C Xatolik: ".concat(error_9.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _e.apply(_d, _f.concat([_g.sent()]));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action(/reconnect_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, count, _a, _b, _c, _d, error_10, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            sessionId = ctx.match[1];
                            ctx.answerCbQuery('🔗 Ulanmoqda...');
                            _h.label = 1;
                        case 1:
                            _h.trys.push([1, 5, , 7]);
                            return [4 /*yield*/, this.telegramService.connectSession(sessionId)];
                        case 2:
                            _h.sent();
                            return [4 /*yield*/, this.telegramService.syncGroups(sessionId)];
                        case 3:
                            count = _h.sent();
                            _b = (_a = ctx).reply;
                            _c = ["\u2705 *Session qayta ulandi!*\n\uD83D\uDCCA ".concat(count, " ta guruh")];
                            _d = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _b.apply(_a, _c.concat([__assign.apply(void 0, _d.concat([_h.sent()]))]));
                            return [3 /*break*/, 7];
                        case 5:
                            error_10 = _h.sent();
                            _f = (_e = ctx).reply;
                            _g = ["\u274C Ulashda xatolik: ".concat(error_10.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 6:
                            _f.apply(_e, _g.concat([_h.sent()]));
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action(/delete_session_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, _a, _b, _c, error_11, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            sessionId = ctx.match[1];
                            ctx.answerCbQuery("O'chirilmoqda...");
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.telegramService.deleteSession(sessionId)];
                        case 2:
                            _g.sent();
                            _b = (_a = ctx).reply;
                            _c = ["✅ Session o'chirildi."];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_g.sent()]));
                            return [3 /*break*/, 6];
                        case 4:
                            error_11 = _g.sent();
                            _e = (_d = ctx).reply;
                            _f = ["\u274C Xatolik: ".concat(error_11.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _e.apply(_d, _f.concat([_g.sent()]));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // ========== ✍️ E'LON YARATISH ==========
            this.bot.hears(/✍️ E'lon yaratish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                return [2 /*return*/];
                            this.clearUserState(userId);
                            this.awaitingAdText.add(userId);
                            ctx.reply('✍️ *E\'lon yaratish*\n\n' +
                                'E\'lon matnini yuboring:\n\n' +
                                '📌 *Misol:*\n```\nPloshchadka kerak\nYuk pishgan g\'isht paddonida\n998901234567\n```\n\n' +
                                '⏳ Matnni kutmoqda...', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_ad')],
                            ])));
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📊 MENING E'LONLARIM ==========
            this.bot.hears(/📊 Mening e'lonlarim/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, ads, _a, _b, _c, _d, isMasterUser, msg, buttons, i, ad, adChars50, preview, statusEmoji, error_12, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _h.sent();
                            if (!user)
                                return [2 /*return*/];
                            _h.label = 2;
                        case 2:
                            _h.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.prisma.ad.findMany({
                                    where: { userId: user.id, status: { notIn: ['ARCHIVED', 'CLOSED'] } },
                                    orderBy: { createdAt: 'desc' },
                                    take: 20,
                                })];
                        case 3:
                            ads = _h.sent();
                            if (!(ads.length === 0)) return [3 /*break*/, 5];
                            _b = (_a = ctx).reply;
                            _c = ['📊 *Mening e\'lonlarim*\n\n🔍 E\'lon yo\'q.\n💡 "✍️ E\'lon yaratish" tugmasini bosing.'];
                            _d = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _b.apply(_a, _c.concat([__assign.apply(void 0, _d.concat([_h.sent()]))]));
                            return [2 /*return*/];
                        case 5:
                            isMasterUser = user.isMaster && !user.masterId;
                            msg = '📊 *Mening e\'lonlarim*\n\n';
                            buttons = [];
                            for (i = 0; i < ads.length; i++) {
                                ad = ads[i];
                                adChars50 = Array.from(ad.content);
                                preview = adChars50.length > 50 ? adChars50.slice(0, 50).join('') + '...' : ad.content;
                                statusEmoji = ad.status === 'ACTIVE' ? '🟢' : ad.status === 'PAUSED' ? '⏸' : '📝';
                                msg += "".concat(i + 1, ". ").concat(statusEmoji, " ").concat(preview, "\n");
                                msg += "   \uD83D\uDCC5 ".concat(new Date(ad.createdAt).toLocaleDateString('uz-UZ'), "\n\n");
                                if (isMasterUser) {
                                    // Master — tobe'lar orqali tarqatish
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDC65 Tarqat: #".concat(i + 1), "master_broadcast_".concat(ad.id)),
                                        telegraf_1.Markup.button.callback("\uD83D\uDEE1\uFE0F Xavfsiz: #".concat(i + 1), "master_safe_broadcast_".concat(ad.id)),
                                    ]);
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDDD1 O'chir: #".concat(i + 1), "del_ad_".concat(ad.id)),
                                    ]);
                                }
                                else {
                                    buttons.push([
                                        telegraf_1.Markup.button.callback("\uD83D\uDE80 Tarqat: #".concat(i + 1), "post_ad_".concat(ad.id)),
                                        telegraf_1.Markup.button.callback("\uD83D\uDDD1 O'chir: #".concat(i + 1), "del_ad_".concat(ad.id)),
                                    ]);
                                }
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)));
                            return [3 /*break*/, 8];
                        case 6:
                            error_12 = _h.sent();
                            _f = (_e = ctx).reply;
                            _g = ['❌ Xatolik yuz berdi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7:
                            _f.apply(_e, _g.concat([_h.sent()]));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // E'lon tanlanganda — session tanlash sahifasi (faqat tobe uchun)
            this.bot.action(/post_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, user, menu, ad, _a, _b, _c, sessions, _d, _e, _f, msg, buttons, _i, sessions_2, s, label, groupCount, _g, error_13, _h, _j, _k;
                var _l, _m;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_l = ctx.from) === null || _l === void 0 ? void 0 : _l.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _o.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!(user.isMaster && !user.masterId)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _o.sent();
                            return [4 /*yield*/, ctx.reply('❌ Master o\'z sessionlari orqali yubora olmaydi.\n' +
                                    '"👥 Tarqatish" yoki "🛡️ Xavfsiz tarqatish" tugmasini ishlating.', menu)];
                        case 3:
                            _o.sent();
                            return [2 /*return*/];
                        case 4:
                            _o.trys.push([4, 16, , 18]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 5:
                            ad = _o.sent();
                            if (!!ad) return [3 /*break*/, 7];
                            _b = (_a = ctx).reply;
                            _c = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 6:
                            _b.apply(_a, _c.concat([_o.sent()]));
                            return [2 /*return*/];
                        case 7: return [4 /*yield*/, this.prisma.session.findMany({
                                where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
                                include: { _count: { select: { groups: true } } },
                            })];
                        case 8:
                            sessions = _o.sent();
                            if (!(sessions.length === 0)) return [3 /*break*/, 10];
                            _e = (_d = ctx).reply;
                            _f = ['❌ Faol session topilmadi. Avval session ulang.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 9:
                            _e.apply(_d, _f.concat([_o.sent()]));
                            return [2 /*return*/];
                        case 10:
                            // PostingFlow ni boshlash — default hammasi tanlangan
                            this.postingFlows.set(userId, {
                                step: 'select_sessions',
                                adId: adId,
                                selectedSessions: sessions.map(function (s) { return s.id; }),
                            });
                            msg = '📱 *Session tanlang:*\n\n';
                            msg += '✅ Barcha sessionlar tanlangan. Alohida tanlash uchun bosilg:\n\n';
                            buttons = [];
                            // Hammasi tanlangan holda
                            buttons.push([telegraf_1.Markup.button.callback('🔄 Barcha sessionlar ✅', "toggle_all_sessions")]);
                            for (_i = 0, sessions_2 = sessions; _i < sessions_2.length; _i++) {
                                s = sessions_2[_i];
                                label = s.name || s.phone || s.id.slice(0, 8);
                                groupCount = ((_m = s._count) === null || _m === void 0 ? void 0 : _m.groups) || 0;
                                buttons.push([
                                    telegraf_1.Markup.button.callback("\uD83D\uDCF1 ".concat(label, " (").concat(groupCount, " guruh) \u2705"), "toggle_session_".concat(s.id)),
                                ]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('🚀 Oddiy tarqatish', "start_posting_confirm")]);
                            buttons.push([telegraf_1.Markup.button.callback('🛡️ Himoyalangan', "start_safe_posting_confirm")]);
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            _o.label = 11;
                        case 11:
                            _o.trys.push([11, 13, , 15]);
                            return [4 /*yield*/, ctx.editMessageText(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 12:
                            _o.sent();
                            return [3 /*break*/, 15];
                        case 13:
                            _g = _o.sent();
                            return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons))).catch(function () { })];
                        case 14:
                            _o.sent();
                            return [3 /*break*/, 15];
                        case 15: return [3 /*break*/, 18];
                        case 16:
                            error_13 = _o.sent();
                            _j = (_h = ctx).reply;
                            _k = ["\u274C Xatolik: ".concat(error_13.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 17:
                            _j.apply(_h, _k.concat([_o.sent()]));
                            return [3 /*break*/, 18];
                        case 18: return [2 /*return*/];
                    }
                });
            }); });
            // Session toggle
            this.bot.action(/toggle_session_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var sessionId, userId, flow, idx;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            sessionId = ctx.match[1];
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            flow = this.postingFlows.get(userId);
                            if (!flow || flow.step !== 'select_sessions')
                                return [2 /*return*/];
                            idx = (_c = (_b = flow.selectedSessions) === null || _b === void 0 ? void 0 : _b.indexOf(sessionId)) !== null && _c !== void 0 ? _c : -1;
                            if (idx >= 0) {
                                flow.selectedSessions.splice(idx, 1);
                            }
                            else {
                                flow.selectedSessions = flow.selectedSessions || [];
                                flow.selectedSessions.push(sessionId);
                            }
                            // Qayta render
                            return [4 /*yield*/, this.renderSessionSelection(ctx, userId)];
                        case 1:
                            // Qayta render
                            _d.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Barcha sessionlarni toggle
            this.bot.action('toggle_all_sessions', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, flow, user, sessions;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            flow = this.postingFlows.get(userId);
                            if (!flow || flow.step !== 'select_sessions')
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _c.sent();
                            if (!user)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
                                })];
                        case 2:
                            sessions = _c.sent();
                            // Agar hammasi tanlangan — hammasini olib tashlash; aks holda hammasini tanlash
                            if (((_b = flow.selectedSessions) === null || _b === void 0 ? void 0 : _b.length) === sessions.length) {
                                flow.selectedSessions = [];
                            }
                            else {
                                flow.selectedSessions = sessions.map(function (s) { return s.id; });
                            }
                            return [4 /*yield*/, this.renderSessionSelection(ctx, userId)];
                        case 3:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Oddiy tarqatishni boshlash (session tanlangandan keyin)
            this.bot.action('start_posting_confirm', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, flow, _a, _b, _c, user, ad, _d, _e, _f, sessionIds, safeMode, job, modeLabel, chatId, statusMsg, _g, _h, _j, error_14, _k, _l, _m;
                var _o, _p;
                return __generator(this, function (_q) {
                    switch (_q.label) {
                        case 0:
                            userId = (_o = ctx.from) === null || _o === void 0 ? void 0 : _o.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery('🚀 Oddiy tarqatish boshlanmoqda...');
                            flow = this.postingFlows.get(userId);
                            if (!(!flow || !flow.adId)) return [3 /*break*/, 2];
                            _b = (_a = ctx).reply;
                            _c = ['❌ Xatolik. Qayta urinib ko\'ring.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_q.sent()]));
                            return [2 /*return*/];
                        case 2:
                            if (!flow.selectedSessions || flow.selectedSessions.length === 0) {
                                ctx.answerCbQuery('⚠️ Kamida 1 ta session tanlang!');
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 3:
                            user = _q.sent();
                            if (!user)
                                return [2 /*return*/];
                            _q.label = 4;
                        case 4:
                            _q.trys.push([4, 13, , 15]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: flow.adId } })];
                        case 5:
                            ad = _q.sent();
                            if (!!ad) return [3 /*break*/, 7];
                            _e = (_d = ctx).reply;
                            _f = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 6:
                            _e.apply(_d, _f.concat([_q.sent()]));
                            this.postingFlows.delete(userId);
                            return [2 /*return*/];
                        case 7:
                            sessionIds = flow.selectedSessions.length > 0 ? flow.selectedSessions : undefined;
                            safeMode = flow.mode === 'safe';
                            return [4 /*yield*/, this.postingService.startPosting(ad.id, ad.content, user.id, sessionIds, safeMode)];
                        case 8:
                            job = _q.sent();
                            // E'lon statusini yangilash
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: flow.adId },
                                    data: { status: 'ACTIVE' },
                                })];
                        case 9:
                            // E'lon statusini yangilash
                            _q.sent();
                            this.postingFlows.delete(userId);
                            modeLabel = safeMode ? '🛡️ Himoyalangan' : '🚀 Oddiy';
                            chatId = (_p = ctx.chat) === null || _p === void 0 ? void 0 : _p.id;
                            if (!chatId) return [3 /*break*/, 11];
                            try {
                                ctx.editMessageText("".concat(modeLabel, " tarqatish boshlandi! Quyida live holat:"));
                            }
                            catch (_r) { }
                            return [4 /*yield*/, ctx.reply(this.formatPostingProgress(job.id))];
                        case 10:
                            statusMsg = _q.sent();
                            this.registerProgressCallback(job.id, chatId, statusMsg.message_id);
                            _q.label = 11;
                        case 11:
                            _h = (_g = ctx).reply;
                            _j = ['👇 Asosiy menyu:'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 12:
                            _h.apply(_g, _j.concat([_q.sent()]));
                            return [3 /*break*/, 15];
                        case 13:
                            error_14 = _q.sent();
                            this.postingFlows.delete(userId);
                            _l = (_k = ctx).reply;
                            _m = ["\u274C Xatolik: ".concat(error_14.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 14:
                            _l.apply(_k, _m.concat([_q.sent()]));
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            // E'lonni o'chirish
            this.bot.action(/del_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            adId = ctx.match[1];
                            ctx.answerCbQuery("O'chirildi");
                            _h.label = 1;
                        case 1:
                            _h.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: adId },
                                    data: { status: 'ARCHIVED' },
                                })];
                        case 2:
                            _h.sent();
                            _b = (_a = ctx).reply;
                            _c = ["✅ E'lon o'chirildi."];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_h.sent()]));
                            return [3 /*break*/, 6];
                        case 4:
                            _d = _h.sent();
                            _f = (_e = ctx).reply;
                            _g = ['❌ Xatolik.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _f.apply(_e, _g.concat([_h.sent()]));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🚀 ODDIY TARQATISH — Eski handler ==========
            this.bot.hears(/🚀 Oddiy tarqatish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _a = _b.sent();
                            _b.label = 5;
                        case 5:
                            menu = _a;
                            return [4 /*yield*/, ctx.reply('❌ Sizda bu funksiya yo\'q.', menu)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🛡️ HIMOYALANGAN — Eski handler ==========
            this.bot.hears(/🛡️ Himoyalangan$/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _a = _b.sent();
                            _b.label = 5;
                        case 5:
                            menu = _a;
                            return [4 /*yield*/, ctx.reply('❌ Sizda bu funksiya yo\'q.', menu)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Himoyalangan — e'lon tanlanganda session tanlash (faqat tobe uchun)
            this.bot.action(/safe_post_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, user, menu, ad, _a, _b, _c, sessions, _d, _e, _f, msg, buttons, _i, sessions_3, s, label, groupCount, _g, error_15, _h, _j, _k;
                var _l, _m;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_l = ctx.from) === null || _l === void 0 ? void 0 : _l.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _o.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!(user.isMaster && !user.masterId)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _o.sent();
                            return [4 /*yield*/, ctx.reply('❌ Master o\'z sessionlari orqali yubora olmaydi.\n' +
                                    '"🛡️ Xavfsiz tarqatish" tugmasini ishlating.', menu)];
                        case 3:
                            _o.sent();
                            return [2 /*return*/];
                        case 4:
                            _o.trys.push([4, 16, , 18]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 5:
                            ad = _o.sent();
                            if (!!ad) return [3 /*break*/, 7];
                            _b = (_a = ctx).reply;
                            _c = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 6:
                            _b.apply(_a, _c.concat([_o.sent()]));
                            return [2 /*return*/];
                        case 7: return [4 /*yield*/, this.prisma.session.findMany({
                                where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
                                include: { _count: { select: { groups: true } } },
                            })];
                        case 8:
                            sessions = _o.sent();
                            if (!(sessions.length === 0)) return [3 /*break*/, 10];
                            _e = (_d = ctx).reply;
                            _f = ['❌ Faol session topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 9:
                            _e.apply(_d, _f.concat([_o.sent()]));
                            return [2 /*return*/];
                        case 10:
                            // PostingFlow — safe mode
                            this.postingFlows.set(userId, {
                                step: 'select_sessions',
                                adId: adId,
                                selectedSessions: sessions.map(function (s) { return s.id; }),
                                mode: 'safe',
                            });
                            msg = '🛡️ *Himoyalangan tarqatish*\n\n';
                            msg += '📱 Barcha sessionlar tanlangan:\n\n';
                            buttons = [];
                            buttons.push([telegraf_1.Markup.button.callback('🔄 Barcha sessionlar ✅', 'toggle_all_sessions')]);
                            for (_i = 0, sessions_3 = sessions; _i < sessions_3.length; _i++) {
                                s = sessions_3[_i];
                                label = s.name || s.phone || s.id.slice(0, 8);
                                groupCount = ((_m = s._count) === null || _m === void 0 ? void 0 : _m.groups) || 0;
                                buttons.push([
                                    telegraf_1.Markup.button.callback("\uD83D\uDCF1 ".concat(label, " (").concat(groupCount, " guruh) \u2705"), "toggle_session_".concat(s.id)),
                                ]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('🛡️ Himoyalangan boshlash', 'start_safe_posting_confirm')]);
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            _o.label = 11;
                        case 11:
                            _o.trys.push([11, 13, , 15]);
                            return [4 /*yield*/, ctx.editMessageText(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 12:
                            _o.sent();
                            return [3 /*break*/, 15];
                        case 13:
                            _g = _o.sent();
                            return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons))).catch(function () { })];
                        case 14:
                            _o.sent();
                            return [3 /*break*/, 15];
                        case 15: return [3 /*break*/, 18];
                        case 16:
                            error_15 = _o.sent();
                            _j = (_h = ctx).reply;
                            _k = ["\u274C Xatolik: ".concat(error_15.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 17:
                            _j.apply(_h, _k.concat([_o.sent()]));
                            return [3 /*break*/, 18];
                        case 18: return [2 /*return*/];
                    }
                });
            }); });
            // Himoyalangan tarqatishni boshlash
            this.bot.action('start_safe_posting_confirm', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, flow, _a, _b, _c, user, ad, _d, _e, _f, sessionIds, job, chatId, statusMsg, _g, _h, _j, error_16, _k, _l, _m;
                var _o, _p;
                return __generator(this, function (_q) {
                    switch (_q.label) {
                        case 0:
                            userId = (_o = ctx.from) === null || _o === void 0 ? void 0 : _o.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery('🛡️ Himoyalangan tarqatish boshlanmoqda...');
                            flow = this.postingFlows.get(userId);
                            if (!(!flow || !flow.adId)) return [3 /*break*/, 2];
                            _b = (_a = ctx).reply;
                            _c = ['❌ Xatolik. Qayta urinib ko\'ring.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_q.sent()]));
                            return [2 /*return*/];
                        case 2:
                            if (!flow.selectedSessions || flow.selectedSessions.length === 0) {
                                ctx.answerCbQuery('⚠️ Kamida 1 ta session tanlang!');
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 3:
                            user = _q.sent();
                            if (!user)
                                return [2 /*return*/];
                            _q.label = 4;
                        case 4:
                            _q.trys.push([4, 13, , 15]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: flow.adId } })];
                        case 5:
                            ad = _q.sent();
                            if (!!ad) return [3 /*break*/, 7];
                            _e = (_d = ctx).reply;
                            _f = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 6:
                            _e.apply(_d, _f.concat([_q.sent()]));
                            this.postingFlows.delete(userId);
                            return [2 /*return*/];
                        case 7:
                            sessionIds = flow.selectedSessions.length > 0 ? flow.selectedSessions : undefined;
                            return [4 /*yield*/, this.postingService.startPosting(ad.id, ad.content, user.id, sessionIds, true)];
                        case 8:
                            job = _q.sent();
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: flow.adId },
                                    data: { status: 'ACTIVE' },
                                })];
                        case 9:
                            _q.sent();
                            this.postingFlows.delete(userId);
                            chatId = (_p = ctx.chat) === null || _p === void 0 ? void 0 : _p.id;
                            if (!chatId) return [3 /*break*/, 11];
                            try {
                                ctx.editMessageText('🛡️ Himoyalangan tarqatish boshlandi! Quyida live holat:');
                            }
                            catch (_r) { }
                            return [4 /*yield*/, ctx.reply(this.formatPostingProgress(job.id))];
                        case 10:
                            statusMsg = _q.sent();
                            this.registerProgressCallback(job.id, chatId, statusMsg.message_id);
                            _q.label = 11;
                        case 11:
                            _h = (_g = ctx).reply;
                            _j = ['👇 Asosiy menyu:'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 12:
                            _h.apply(_g, _j.concat([_q.sent()]));
                            return [3 /*break*/, 15];
                        case 13:
                            error_16 = _q.sent();
                            this.postingFlows.delete(userId);
                            _l = (_k = ctx).reply;
                            _m = ["\u274C Xatolik: ".concat(error_16.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 14:
                            _l.apply(_k, _m.concat([_q.sent()]));
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🛑 TO'XTATISH (birlashtirilgan — master va tobe uchun) ==========
            this.bot.hears(/🛑 To'xtatish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu, stoppedCount, ownJobs, activeOwnJobs, _i, activeOwnJobs_1, job, jobs, activeJobs, _a, activeJobs_1, job;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _b.sent();
                            if (!user.isMaster) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.postingService.stopAllSlaves(user.id)];
                        case 3:
                            stoppedCount = _b.sent();
                            ownJobs = this.postingService.getUserJobs(user.id);
                            activeOwnJobs = ownJobs.filter(function (j) { return j.status === 'running' || j.status === 'paused'; });
                            for (_i = 0, activeOwnJobs_1 = activeOwnJobs; _i < activeOwnJobs_1.length; _i++) {
                                job = activeOwnJobs_1[_i];
                                this.postingService.stopJob(job.id);
                            }
                            return [4 /*yield*/, ctx.reply("\uD83D\uDED1 *Barcha tarqatishlar to'xtatildi*\n\n" +
                                    "To'xtatilgan tobe'lar: ".concat(stoppedCount, " ta"), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 4:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            jobs = this.postingService.getUserJobs(user.id);
                            activeJobs = jobs.filter(function (j) { return j.status === 'running' || j.status === 'paused'; });
                            if (activeJobs.length === 0) {
                                ctx.reply('⏸ *To\'xtatish*\n\n🔍 Faol tarqatish yo\'q.', __assign({ parse_mode: 'Markdown' }, menu));
                                return [2 /*return*/];
                            }
                            for (_a = 0, activeJobs_1 = activeJobs; _a < activeJobs_1.length; _a++) {
                                job = activeJobs_1[_a];
                                this.postingService.stopJob(job.id);
                            }
                            return [4 /*yield*/, ctx.reply('🛑 To\'xtatildi', menu)];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📈 HISOBOT ==========
            this.bot.hears(/📈 Hisobot/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, sessions, connectedCount, totalGroupsCount, msg, _i, sessions_4, s, connected, emoji, name_2, groupCount, activeCount, jobs, runningJobs, completedJobs, _a, runningJobs_1, job, recent, _b, recent_1, job, stats, durationMin, emoji, _c, _d, s, tobes, readyTobes, activeSlaves, tobeGroups, menu;
                var _this = this;
                var _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _f.sent();
                            if (!user)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.telegramService.getUserSessions(user.id)];
                        case 2:
                            sessions = _f.sent();
                            connectedCount = sessions.filter(function (s) { return _this.telegramService.isClientConnected(s.id); }).length;
                            totalGroupsCount = 0;
                            sessions.forEach(function (s) { totalGroupsCount += s.totalGroups; });
                            msg = '📈 Hisobot\n\n';
                            // Har bir session tafsiloti
                            msg += '📱 Sessionlar:\n';
                            for (_i = 0, sessions_4 = sessions; _i < sessions_4.length; _i++) {
                                s = sessions_4[_i];
                                connected = this.telegramService.isClientConnected(s.id);
                                emoji = connected ? '🟢' : s.isFrozen ? '🔴' : '🟡';
                                name_2 = s.name || s.phone || s.id.slice(0, 8);
                                groupCount = ((_e = s._count) === null || _e === void 0 ? void 0 : _e.groups) || s.totalGroups || 0;
                                activeCount = s.activeGroups || 0;
                                msg += "".concat(emoji, " ").concat(name_2, " \u2014 ").concat(activeCount, "/").concat(groupCount, " guruh");
                                if (s.isFrozen)
                                    msg += ' (Muzlatilgan)';
                                msg += '\n';
                            }
                            msg += "\nJami: ".concat(sessions.length, " session, ").concat(connectedCount, " ulangan, ").concat(totalGroupsCount, " guruh\n");
                            jobs = this.postingService.getUserJobs(user.id);
                            if (jobs.length > 0) {
                                runningJobs = jobs.filter(function (j) { return j.status === 'running' || j.status === 'paused'; });
                                completedJobs = jobs.filter(function (j) { return j.status === 'completed' || j.status === 'stopped'; });
                                // Faol tarqatishlar — to'liq per-session statistika
                                for (_a = 0, runningJobs_1 = runningJobs; _a < runningJobs_1.length; _a++) {
                                    job = runningJobs_1[_a];
                                    msg += '\n' + this.formatPostingProgress(job.id) + '\n';
                                }
                                if (completedJobs.length > 0) {
                                    msg += '\n📋 Oxirgi tarqatishlar:\n';
                                    recent = completedJobs.slice(-5);
                                    for (_b = 0, recent_1 = recent; _b < recent_1.length; _b++) {
                                        job = recent_1[_b];
                                        stats = this.postingService.getJobStats(job.id);
                                        if (!stats)
                                            continue;
                                        durationMin = Math.floor(stats.duration / 60000);
                                        emoji = job.status === 'completed' ? '✅' : '⏹';
                                        msg += "".concat(emoji, " ").concat(stats.postedGroups, "/").concat(stats.totalGroups, " guruh");
                                        msg += " | ".concat(stats.roundsCompleted, " round");
                                        msg += " | ".concat(durationMin, " min");
                                        msg += " | ".concat(stats.successRate.toFixed(0), "%\n");
                                        // Per-session tafsilot
                                        for (_c = 0, _d = stats.perSessionStats; _c < _d.length; _c++) {
                                            s = _d[_c];
                                            msg += "   \uD83D\uDCF1 ".concat(s.name, ": \u2705").concat(s.sent, " \u274C").concat(s.failed, " \u23ED").concat(s.skipped, "\n");
                                        }
                                    }
                                }
                            }
                            else {
                                msg += '\nTarqatish yo\'q.\n';
                            }
                            msg += '\n⏱ Oddiy: 0.3-6s, 5min | Himoyalangan: 1-15s, 10min';
                            if (!user.isMaster) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: { masterId: user.id },
                                    include: {
                                        sessions: {
                                            where: { status: 'ACTIVE', sessionString: { not: null } },
                                            include: { _count: { select: { groups: true } } },
                                        },
                                    },
                                })];
                        case 3:
                            tobes = _f.sent();
                            readyTobes = tobes.filter(function (t) { return t.sessions.length > 0; });
                            activeSlaves = tobes.filter(function (t) { return _this.postingService.isSlaveBroadcasting(t.id); });
                            tobeGroups = readyTobes.reduce(function (sum, t) { return sum + t.sessions.reduce(function (s, sess) { var _a; return s + (((_a = sess._count) === null || _a === void 0 ? void 0 : _a.groups) || 0); }, 0); }, 0);
                            msg += "\n\n\uD83D\uDC51 MASTER HISOBOT\n";
                            msg += "\uD83D\uDC65 Tobe'lar: ".concat(readyTobes.length, "/").concat(tobes.length, " tayyor\n");
                            msg += "\uD83D\uDFE2 Hozir faol: ".concat(activeSlaves.length, "\n");
                            msg += "\uD83D\uDCCB Tobe guruhlar: ".concat(tobeGroups, "\n");
                            msg += "\uD83D\uDCCE Ref kod: ".concat(user.refCode || '—');
                            _f.label = 4;
                        case 4: return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            menu = _f.sent();
                            ctx.reply(msg, menu);
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 💳 OBUNA ==========
            this.bot.hears(/💳 Obuna/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, menu, subInfo, sub, plan, endDate;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            this.clearUserState(userId);
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!(!user.isMaster && user.masterId)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _b.sent();
                            return [4 /*yield*/, ctx.reply('❌ Obuna faqat masterlar tomonidan boshqariladi.', menu)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/];
                        case 4:
                            subInfo = '';
                            if (user.subscription) {
                                sub = user.subscription;
                                plan = PLAN_INFO[sub.planType];
                                endDate = sub.endDate ? new Date(sub.endDate).toLocaleDateString('uz-UZ') : '—';
                                subInfo =
                                    "\n\uD83D\uDCCB *Joriy obuna:*\n" +
                                        "".concat((plan === null || plan === void 0 ? void 0 : plan.emoji) || '📦', " *").concat((plan === null || plan === void 0 ? void 0 : plan.name) || sub.planType, "*\n") +
                                        "\uD83D\uDCC5 Tugash: ".concat(endDate, "\n") +
                                        "\uD83D\uDCCA Holat: ".concat(sub.status === 'ACTIVE' ? '✅ Faol' : '❌ ' + sub.status, "\n\n");
                            }
                            else {
                                subInfo = '\n⚠️ *Faol obuna yo\'q.*\n\n';
                            }
                            ctx.reply('💳 *Obuna / To\'lov*\n' +
                                subInfo +
                                '📦 *Tariflar:*\n\n' +
                                '🟢 *STARTER* — 50,000 UZS/oy\n   5 e\'lon, 1 session, 50 guruh\n\n' +
                                '🔵 *BUSINESS* — 150,000 UZS/oy\n   20 e\'lon, 3 session, 200 guruh\n\n' +
                                '🟡 *PREMIUM* — 300,000 UZS/oy\n   50 e\'lon, 5 session, 500 guruh\n\n' +
                                '🔴 *ENTERPRISE* — 500,000 UZS/oy\n   Cheksiz e\'lon, 10 session, cheksiz guruh\n\n' +
                                '👇 Tarifni tanlang:', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [
                                    telegraf_1.Markup.button.callback('🟢 Starter 50K', 'plan_STARTER'),
                                    telegraf_1.Markup.button.callback('🔵 Business 150K', 'plan_BUSINESS'),
                                ],
                                [
                                    telegraf_1.Markup.button.callback('🟡 Premium 300K', 'plan_PREMIUM'),
                                    telegraf_1.Markup.button.callback('🔴 Enterprise 500K', 'plan_ENTERPRISE'),
                                ],
                                [telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')],
                            ])));
                            return [2 /*return*/];
                    }
                });
            }); });
            // Plan tanlash
            this.bot.action(/plan_(STARTER|BUSINESS|PREMIUM|ENTERPRISE)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, planType, plan, cardsMsg, cards, _a;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
                            if (!userId)
                                return [2 /*return*/];
                            planType = ctx.match[1];
                            plan = PLAN_INFO[planType];
                            ctx.answerCbQuery("".concat(plan.name, " tanlandi"));
                            cardsMsg = '';
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.systemConfig.getPaymentCards()];
                        case 2:
                            cards = _c.sent();
                            if (cards.length > 0) {
                                cardsMsg = '💳 *To\'lov kartalari:*\n\n';
                                cards.forEach(function (card, i) {
                                    cardsMsg += "".concat(i + 1, ". *").concat(card.bankName, "*\n");
                                    cardsMsg += "   `".concat(card.cardNumber, "`\n");
                                    cardsMsg += "   ".concat(card.cardHolder, "\n");
                                    if (card.description)
                                        cardsMsg += "   _".concat(card.description, "_\n");
                                    cardsMsg += '\n';
                                });
                            }
                            else {
                                cardsMsg = '⚠️ Karta ma\'lumotlari hali kiritilmagan.\n\n';
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            cardsMsg = '⚠️ Karta olishda xatolik.\n\n';
                            return [3 /*break*/, 4];
                        case 4:
                            this.subscriptionFlows.set(userId, {
                                step: 'awaiting_receipt',
                                selectedPlan: planType,
                                amount: plan.price,
                            });
                            ctx.editMessageText("".concat(plan.emoji, " *").concat(plan.name, "* \u2014 ").concat(plan.price.toLocaleString(), " UZS\n\n") +
                                "\uD83D\uDCE6 *Imkoniyatlar:*\n".concat(plan.features.map(function (f) { return "   \u2022 ".concat(f); }).join('\n'), "\n\n") +
                                cardsMsg +
                                '📸 *Yuqoridagi kartaga pul o\'tkazing va chek rasmini yuboring.*\n\n' +
                                '⏳ Chek rasmini kutmoqda...', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_subscription')],
                            ])));
                            return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action('cancel_subscription', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, _b, _c;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            userId = (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id;
                            if (userId)
                                this.subscriptionFlows.delete(userId);
                            ctx.answerCbQuery('Bekor qilindi');
                            ctx.editMessageText('❌ Obuna bekor qilindi.');
                            _b = (_a = ctx).reply;
                            _c = ['👇 Asosiy menyu:'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_e.sent()]));
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🔒 E'LON YOPISH ==========
            this.bot.hears(/🔒 E'lon yopish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, ads, _a, _b, _c, _d, msg, buttons, i, ad, chars, preview, statusEmoji, error_17, _e, _f, _g;
                var _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            userId = (_h = ctx.from) === null || _h === void 0 ? void 0 : _h.id;
                            if (!userId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _j.sent();
                            if (!user)
                                return [2 /*return*/];
                            this.clearUserState(userId);
                            _j.label = 2;
                        case 2:
                            _j.trys.push([2, 6, , 8]);
                            return [4 /*yield*/, this.prisma.ad.findMany({
                                    where: { userId: user.id, status: { in: ['ACTIVE', 'DRAFT', 'PAUSED'] } },
                                    orderBy: { createdAt: 'desc' },
                                    take: 20,
                                })];
                        case 3:
                            ads = _j.sent();
                            if (!(ads.length === 0)) return [3 /*break*/, 5];
                            _b = (_a = ctx).reply;
                            _c = ['🔒 *E\'lon yopish*\n\n🔍 Yopiladigan e\'lon yo\'q.'];
                            _d = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _b.apply(_a, _c.concat([__assign.apply(void 0, _d.concat([_j.sent()]))]));
                            return [2 /*return*/];
                        case 5:
                            msg = '🔒 *Yopish uchun e\'lonni tanlang:*\n\n';
                            buttons = [];
                            for (i = 0; i < ads.length; i++) {
                                ad = ads[i];
                                chars = Array.from(ad.content);
                                preview = chars.length > 40 ? chars.slice(0, 40).join('') + '...' : ad.content;
                                statusEmoji = ad.status === 'ACTIVE' ? '🟢' : ad.status === 'PAUSED' ? '⏸' : '📝';
                                msg += "".concat(i + 1, ". ").concat(statusEmoji, " ").concat(preview, "\n\n");
                                buttons.push([telegraf_1.Markup.button.callback("\uD83D\uDD12 #".concat(i + 1, " \u2014 Yopish"), "close_ad_".concat(ad.id))]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)));
                            return [3 /*break*/, 8];
                        case 6:
                            error_17 = _j.sent();
                            _f = (_e = ctx).reply;
                            _g = ['❌ Xatolik yuz berdi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7:
                            _f.apply(_e, _g.concat([_j.sent()]));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // E'lon tanlanganda — mazmuni va amallar ko'rsatish
            this.bot.action(/close_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, ad, _a, _b, _c, chars, preview, dealCount, msgText, _d, _e, _f, _g, _h;
                var _j;
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_j = ctx.from) === null || _j === void 0 ? void 0 : _j.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            _k.label = 1;
                        case 1:
                            _k.trys.push([1, 10, , 12]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 2:
                            ad = _k.sent();
                            if (!!ad) return [3 /*break*/, 4];
                            _b = (_a = ctx).reply;
                            _c = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_k.sent()]));
                            return [2 /*return*/];
                        case 4:
                            chars = Array.from(ad.content);
                            preview = chars.length > 200 ? chars.slice(0, 200).join('') + '...' : ad.content;
                            dealCount = ad.soldQuantity || 0;
                            msgText = "\uD83D\uDCCB E'lon:\n\n".concat(preview, "\n\n") +
                                "\uD83D\uDCC5 Yaratilgan: ".concat(new Date(ad.createdAt).toLocaleDateString('uz-UZ'), "\n") +
                                "\uD83D\uDCCA Holat: ".concat(ad.status, "\n") +
                                (dealCount > 0 ? "\uD83D\uDD12 Yopilgan yuklar: ".concat(dealCount, " ta\n\n") : '\n') +
                                '👇 Amalni tanlang:';
                            _k.label = 5;
                        case 5:
                            _k.trys.push([5, 7, , 9]);
                            return [4 /*yield*/, ctx.editMessageText(msgText, __assign({}, telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('🔒 Yuk yopish (yangi deal)', "close_confirm_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('✏️ Tahrirlash', "edit_close_ad_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('🗑 O\'chirish (arxivlash)', "delete_close_ad_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')],
                                ])))];
                        case 6:
                            _k.sent();
                            return [3 /*break*/, 9];
                        case 7:
                            _d = _k.sent();
                            return [4 /*yield*/, ctx.reply(msgText, __assign({}, telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('🔒 Yuk yopish (yangi deal)', "close_confirm_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('✏️ Tahrirlash', "edit_close_ad_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('🗑 O\'chirish (arxivlash)', "delete_close_ad_".concat(adId))],
                                    [telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')],
                                ]))).catch(function () { })];
                        case 8:
                            _k.sent();
                            return [3 /*break*/, 9];
                        case 9: return [3 /*break*/, 12];
                        case 10:
                            _e = _k.sent();
                            _g = (_f = ctx).reply;
                            _h = ['❌ Xatolik.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 11:
                            _g.apply(_f, _h.concat([_k.sent()]));
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); });
            // Tahrirlash — matn so'rash
            this.bot.action(/edit_close_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId;
                var _a;
                return __generator(this, function (_b) {
                    adId = ctx.match[1];
                    userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId)
                        return [2 /*return*/];
                    ctx.answerCbQuery();
                    this.adCloseFlows.set(userId, { step: 'editing', adId: adId });
                    ctx.editMessageText('✏️ *E\'lon tahrirlash*\n\nYangi matnni yuboring:', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
                    ])));
                    return [2 /*return*/];
                });
            }); });
            // O'chirish (arxivlash) + guruhlardan xabarlarni o'chirish
            this.bot.action(/delete_close_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, _a, _b, _c, _d, _e, _f, _g;
                var _this = this;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            adId = ctx.match[1];
                            ctx.answerCbQuery();
                            _h.label = 1;
                        case 1:
                            _h.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: adId },
                                    data: { status: 'ARCHIVED' },
                                })];
                        case 2:
                            _h.sent();
                            ctx.editMessageText('✅ E\'lon arxivlandi. Guruhlardan xabarlar o\'chirilmoqda...').catch(function () { });
                            _b = (_a = ctx).reply;
                            _c = ['👇 Asosiy menyu:'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_h.sent()]));
                            // Guruhlardan xabarlarni o'chirish
                            this.deleteAdMessagesInBackground(adId).catch(function (err) {
                                return _this.logger.error("Xabar o'chirishda xatolik: ".concat(err.message));
                            });
                            return [3 /*break*/, 6];
                        case 4:
                            _d = _h.sent();
                            _f = (_e = ctx).reply;
                            _g = ['❌ Xatolik.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _f.apply(_e, _g.concat([_h.sent()]));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // "Men yopmadim" — e'lonni yopmasdan o'tkazish
            this.bot.action(/skip_close_ad_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            ctx.answerCbQuery();
                            ctx.editMessageText('✅ E\'lon yopilmadi. Keyinroq yopishingiz mumkin.');
                            _b = (_a = ctx).reply;
                            _c = ['👇 Asosiy menyu:'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_d.sent()]));
                            return [2 /*return*/];
                    }
                });
            }); });
            // Yopish boshlash — avto-parsing + faqat yetishmagan maydonlarni so'rash
            this.bot.action(/close_confirm_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, ad, _a, _b, _c, parsed, flow, foundMsg, _d, _e, _f, _g, _h;
                var _j;
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_j = ctx.from) === null || _j === void 0 ? void 0 : _j.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery();
                            _k.label = 1;
                        case 1:
                            _k.trys.push([1, 11, , 13]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 2:
                            ad = _k.sent();
                            if (!!ad) return [3 /*break*/, 4];
                            _b = (_a = ctx).reply;
                            _c = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 3:
                            _b.apply(_a, _c.concat([_k.sent()]));
                            return [2 /*return*/];
                        case 4: return [4 /*yield*/, this.parseAdContent(ad.content)];
                        case 5:
                            parsed = _k.sent();
                            flow = {
                                step: 'amount',
                                adId: adId,
                                cargoFrom: parsed.cargoFrom || undefined,
                                cargoTo: parsed.cargoTo || undefined,
                                cargoType: parsed.cargoType || undefined,
                                cargoWeight: parsed.cargoWeight || undefined,
                            };
                            foundMsg = '';
                            if (parsed.cargoFrom)
                                foundMsg += "\uD83D\uDCCD Qayerdan: ".concat(parsed.cargoFrom, "\n");
                            if (parsed.cargoTo)
                                foundMsg += "\uD83D\uDCCD Qayerga: ".concat(parsed.cargoTo, "\n");
                            if (parsed.cargoType)
                                foundMsg += "\uD83D\uDCE6 Yuk turi: ".concat(parsed.cargoType, "\n");
                            if (parsed.cargoWeight)
                                foundMsg += "\u2696\uFE0F Tonna: ".concat(parsed.cargoWeight, "\n");
                            if (parsed.vehicleType) {
                                foundMsg += "\uD83D\uDE9B Mashina: ".concat(parsed.vehicleType, "\n");
                                // vehicleType ni ham saqlash — keyinroq so'ramaslik uchun
                                flow.vehicleType = parsed.vehicleType;
                            }
                            if (foundMsg) {
                                foundMsg = '🤖 E\'londan topildi:\n' + foundMsg + '\n';
                            }
                            this.adCloseFlows.set(userId, flow);
                            _k.label = 6;
                        case 6:
                            _k.trys.push([6, 8, , 10]);
                            return [4 /*yield*/, ctx.editMessageText(foundMsg +
                                    '💰 Qancha summaga yoptingiz?\n\n' +
                                    'Faqat raqam yuboring (masalan: 5000000)', telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
                                ]))];
                        case 7:
                            _k.sent();
                            return [3 /*break*/, 10];
                        case 8:
                            _d = _k.sent();
                            return [4 /*yield*/, ctx.reply(foundMsg +
                                    '💰 Qancha summaga yoptingiz?\n\n' +
                                    'Faqat raqam yuboring (masalan: 5000000)', telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'back_to_main')],
                                ])).catch(function () { })];
                        case 9:
                            _k.sent();
                            return [3 /*break*/, 10];
                        case 10: return [3 /*break*/, 13];
                        case 11:
                            _e = _k.sent();
                            _g = (_f = ctx).reply;
                            _h = ['❌ Xatolik.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 12:
                            _g.apply(_f, _h.concat([_k.sent()]));
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 👑 MASTER BO'LISH — Har bir user avtomatik master ==========
            this.bot.hears(/👑 Master bo'lish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, botInfo, refLink, menu, menu;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!user.isMaster) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.bot.telegram.getMe()];
                        case 2:
                            botInfo = _a.sent();
                            refLink = "https://t.me/".concat(botInfo.username, "?start=ref_").concat(user.refCode);
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 3:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply("\uD83D\uDC51 Siz allaqachon master!\n\n\uD83D\uDCCE Referal havola:\n`".concat(refLink, "`"), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 5: return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 6:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply('ℹ️ Har bir foydalanuvchi avtomatik master bo\'ladi.', menu)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📤 O'ZIMDAN — O'chirilgan ==========
            this.bot.hears(/📤 O'zimdan$/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _a = _b.sent();
                            _b.label = 5;
                        case 5:
                            menu = _a;
                            return [4 /*yield*/, ctx.reply('❌ Bu funksiya o\'chirilgan. "👥 Tarqatish" tugmasini ishlating.', menu)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🛡️ O'ZIMDAN (XAVFSIZ) — O'chirilgan ==========
            this.bot.hears(/🛡️ O'zimdan \(xavfsiz\)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _b.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _a = _b.sent();
                            _b.label = 5;
                        case 5:
                            menu = _a;
                            return [4 /*yield*/, ctx.reply('❌ Bu funksiya o\'chirilgan. "🛡️ Xavfsiz tarqatish" tugmasini ishlating.', menu)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 👥 TARQATISH (Master broadcast oddiy rejimda) ==========
            this.bot.hears(/👥 Tarqatish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, ads, menu, msg, buttons, i, ad, adChars, preview;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!!user.isMaster) return [3 /*break*/, 3];
                            return [4 /*yield*/, ctx.reply('❌ Siz master emassiz!')];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.prisma.ad.findMany({
                                where: { userId: user.id, status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] } },
                                orderBy: { createdAt: 'desc' },
                                take: 10,
                            })];
                        case 4:
                            ads = _a.sent();
                            if (!(ads.length === 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply('🔍 E\'lon yo\'q. Avval e\'lon yarating.', menu)];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                        case 7:
                            msg = '👥 *Tarqatish — Oddiy rejim*\n\n';
                            msg += '👇 E\'lonni tanlang:\n\n';
                            buttons = [];
                            for (i = 0; i < ads.length; i++) {
                                ad = ads[i];
                                adChars = Array.from(ad.content);
                                preview = adChars.length > 40 ? adChars.slice(0, 40).join('') + '...' : ad.content;
                                msg += "".concat(i + 1, ". ").concat(preview, "\n\n");
                                buttons.push([telegraf_1.Markup.button.callback("\uD83D\uDC65 #".concat(i + 1), "master_broadcast_".concat(ad.id))]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 8:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Master broadcast callback — oddiy rejim
            this.bot.action(/master_broadcast_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, user, ad, chatId_1, result, menu, error_18, menu;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery('👥 Tobe\'larga yuborilmoqda...');
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _c.sent();
                            if (!user)
                                return [2 /*return*/];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 9]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 3:
                            ad = _c.sent();
                            if (!ad) {
                                ctx.reply('❌ E\'lon topilmadi.');
                                return [2 /*return*/];
                            }
                            chatId_1 = (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id;
                            return [4 /*yield*/, this.postingService.masterBroadcast(user.id, ad.content, false, chatId_1 ? function (text) {
                                    _this.bot.telegram.sendMessage(chatId_1, text).catch(function () { });
                                } : undefined)];
                        case 4:
                            result = _c.sent();
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            menu = _c.sent();
                            return [4 /*yield*/, ctx.reply("\u2705 *Tarqatish boshlandi!*\n\n" +
                                    "\uD83D\uDC65 ".concat(result.readyCount, "/").concat(result.totalSlaves, " ta tobe'ga buyruq yuborildi\n") +
                                    "\uD83D\uDCCB Jami guruhlar: ".concat(result.totalGroups), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 6:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 7:
                            error_18 = _c.sent();
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 8:
                            menu = _c.sent();
                            ctx.reply("\u274C ".concat(error_18.message), menu);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🛡️ XAVFSIZ TARQATISH (Master broadcast himoyalangan) ==========
            this.bot.hears(/🛡️ Xavfsiz tarqatish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, ads, menu, msg, buttons, i, ad, adChars, preview;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!!user.isMaster) return [3 /*break*/, 3];
                            return [4 /*yield*/, ctx.reply('❌ Siz master emassiz!')];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.prisma.ad.findMany({
                                where: { userId: user.id, status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] } },
                                orderBy: { createdAt: 'desc' },
                                take: 10,
                            })];
                        case 4:
                            ads = _a.sent();
                            if (!(ads.length === 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply('🔍 E\'lon yo\'q. Avval e\'lon yarating.', menu)];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                        case 7:
                            msg = '🛡️ *Xavfsiz tarqatish — Himoyalangan rejim*\n\n';
                            msg += '👇 E\'lonni tanlang:\n\n';
                            buttons = [];
                            for (i = 0; i < ads.length; i++) {
                                ad = ads[i];
                                adChars = Array.from(ad.content);
                                preview = adChars.length > 40 ? adChars.slice(0, 40).join('') + '...' : ad.content;
                                msg += "".concat(i + 1, ". ").concat(preview, "\n\n");
                                buttons.push([telegraf_1.Markup.button.callback("\uD83D\uDEE1\uFE0F #".concat(i + 1), "master_safe_broadcast_".concat(ad.id))]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 8:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Master broadcast callback — himoyalangan rejim
            this.bot.action(/master_safe_broadcast_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var adId, userId, user, ad, chatId_2, result, menu, error_19, menu;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            adId = ctx.match[1];
                            userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                            if (!userId)
                                return [2 /*return*/];
                            ctx.answerCbQuery('🛡️ Himoyalangan tarqatish...');
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _c.sent();
                            if (!user)
                                return [2 /*return*/];
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 7, , 9]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 3:
                            ad = _c.sent();
                            if (!ad) {
                                ctx.reply('❌ E\'lon topilmadi.');
                                return [2 /*return*/];
                            }
                            chatId_2 = (_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id;
                            return [4 /*yield*/, this.postingService.masterBroadcast(user.id, ad.content, true, chatId_2 ? function (text) {
                                    _this.bot.telegram.sendMessage(chatId_2, text).catch(function () { });
                                } : undefined)];
                        case 4:
                            result = _c.sent();
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            menu = _c.sent();
                            return [4 /*yield*/, ctx.reply("\u2705 *Himoyalangan tarqatish boshlandi!*\n\n" +
                                    "\uD83D\uDC65 ".concat(result.readyCount, "/").concat(result.totalSlaves, " ta tobe'ga buyruq yuborildi\n") +
                                    "\uD83D\uDCCB Jami guruhlar: ".concat(result.totalGroups), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 6:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 7:
                            error_19 = _c.sent();
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 8:
                            menu = _c.sent();
                            ctx.reply("\u274C ".concat(error_19.message), menu);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // ========== 👥 TOBE'LARIM ==========
            this.bot.hears(/👥 Tobe'larim/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, tobes, botInfo, refLink, menu, msg, buttons, i, t, hasSession, groupCount, name_3, isActive, statusIcon, readyCount, totalGroups;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            if (!!user.isMaster) return [3 /*break*/, 3];
                            return [4 /*yield*/, ctx.reply('❌ Siz master emassiz!')];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.prisma.user.findMany({
                                where: { masterId: user.id },
                                include: {
                                    sessions: {
                                        where: { status: 'ACTIVE', sessionString: { not: null } },
                                        include: { _count: { select: { groups: true } } },
                                    },
                                },
                            })];
                        case 4:
                            tobes = _a.sent();
                            if (!(tobes.length === 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.bot.telegram.getMe()];
                        case 5:
                            botInfo = _a.sent();
                            refLink = "https://t.me/".concat(botInfo.username, "?start=ref_").concat(user.refCode);
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 6:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply("\uD83D\uDC65 *Tobe'lar yo'q*\n\n\uD83D\uDCCE Referal havolani ulashing:\n`".concat(refLink, "`"), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                        case 8:
                            msg = "\uD83D\uDC65 *Tobe'lar: ".concat(tobes.length, " ta*\n\n");
                            buttons = [];
                            for (i = 0; i < tobes.length; i++) {
                                t = tobes[i];
                                hasSession = t.sessions.length > 0;
                                groupCount = t.sessions.reduce(function (sum, s) { var _a; return sum + (((_a = s._count) === null || _a === void 0 ? void 0 : _a.groups) || 0); }, 0);
                                name_3 = t.firstName || t.username || t.telegramId;
                                isActive = this.postingService.isSlaveBroadcasting(t.id);
                                statusIcon = isActive ? '🟢' : '⚪';
                                msg += "".concat(i + 1, ". ").concat(statusIcon, " ").concat(name_3, "\n");
                                msg += "   Session: ".concat(hasSession ? '✅' : '❌', " | Guruhlar: ").concat(groupCount, "\n\n");
                                buttons.push([
                                    telegraf_1.Markup.button.callback("\uD83D\uDDD1 O'chirish: ".concat(name_3.slice(0, 20)), "remove_tobe_".concat(t.id)),
                                ]);
                            }
                            readyCount = tobes.filter(function (t) { return t.sessions.length > 0; }).length;
                            totalGroups = tobes.reduce(function (sum, t) { return sum + t.sessions.reduce(function (s, sess) { var _a; return s + (((_a = sess._count) === null || _a === void 0 ? void 0 : _a.groups) || 0); }, 0); }, 0);
                            msg += "\uD83D\uDCCA *Tayyor:* ".concat(readyCount, "/").concat(tobes.length, "\n");
                            msg += "\uD83D\uDCCB *Jami guruhlar:* ".concat(totalGroups);
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 9:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Tobe'ni o'chirish (master dan ajratish)
            this.bot.action(/remove_tobe_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var tobeId, user, tobe, _a, _b, _c, tobeName, newRefCode, menu, error_20, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            tobeId = ctx.match[1];
                            ctx.answerCbQuery();
                            return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _g.sent();
                            if (!user || !user.isMaster)
                                return [2 /*return*/];
                            _g.label = 2;
                        case 2:
                            _g.trys.push([2, 10, , 13]);
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: tobeId } })];
                        case 3:
                            tobe = _g.sent();
                            if (!(!tobe || tobe.masterId !== user.id)) return [3 /*break*/, 6];
                            _b = (_a = ctx).reply;
                            _c = ['❌ Tobe topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4: return [4 /*yield*/, _b.apply(_a, _c.concat([_g.sent()]))];
                        case 5:
                            _g.sent();
                            return [2 /*return*/];
                        case 6:
                            tobeName = tobe.firstName || tobe.username || tobe.telegramId;
                            newRefCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: tobeId },
                                    data: { masterId: null, isMaster: true, refCode: newRefCode },
                                })];
                        case 7:
                            _g.sent();
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 8:
                            menu = _g.sent();
                            return [4 /*yield*/, ctx.reply("\u2705 *".concat(tobeName, "* tobe'likdan o'chirildi."), __assign({ parse_mode: 'Markdown' }, menu))];
                        case 9:
                            _g.sent();
                            return [3 /*break*/, 13];
                        case 10:
                            error_20 = _g.sent();
                            _e = (_d = ctx).reply;
                            _f = ["\u274C Xatolik: ".concat(error_20.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 11: return [4 /*yield*/, _e.apply(_d, _f.concat([_g.sent()]))];
                        case 12:
                            _g.sent();
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            }); });
            // 🛑 Hammani to'xtatish — eski handler, endi 🛑 To'xtatish ga birlashtirilgan
            this.bot.hears(/🛑 Hammani to'xtatish/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, menu;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getUserWithAccess(ctx)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            menu = _a.sent();
                            return [4 /*yield*/, ctx.reply('ℹ️ "🛑 To\'xtatish" tugmasini ishlating.', menu)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 📚 YORDAM ==========
            this.bot.hears(/📚 Yordam/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var user, isMaster, _a, menu, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _c.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.isUserMaster(user.id)];
                        case 2:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = false;
                            _c.label = 4;
                        case 4:
                            isMaster = _a;
                            if (!user) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 5:
                            _b = _c.sent();
                            return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7:
                            _b = _c.sent();
                            _c.label = 8;
                        case 8:
                            menu = _b;
                            if (isMaster) {
                                ctx.reply('📚 *Yordam (Master)*\n\n' +
                                    '🔹 *E\'lon yaratish:*\n' +
                                    '   ✍️ "E\'lon yaratish" → matn yuboring → tayyor!\n\n' +
                                    '🔹 *Tarqatish:*\n' +
                                    '   👥 "Tarqatish" — tobe\'lar orqali oddiy rejimda\n' +
                                    '   🛡️ "Xavfsiz tarqatish" — himoyalangan rejimda\n\n' +
                                    '🔹 *Tobe qo\'shish:*\n' +
                                    '   Referal havolani tobe\'larga yuboring\n' +
                                    '   Ular session ulab, master buyruq beradi\n\n' +
                                    '🔹 *Rejimlar:*\n' +
                                    '   🚀 *Oddiy:* 0.3-6 sek, 5 min pauza\n' +
                                    '   🛡️ *Himoyalangan:* 1-15 sek, 10 min pauza\n\n' +
                                    '📞 Savol bo\'lsa admin bilan bog\'laning.', __assign({ parse_mode: 'Markdown' }, menu));
                            }
                            else {
                                ctx.reply('📚 *Yordam (Tobe)*\n\n' +
                                    '🔹 *Session ulash:*\n' +
                                    '   📱 "Session ulash" → telefon raqam → kod → tayyor!\n' +
                                    '   Bir nechta account ulash mumkin\n\n' +
                                    '🔹 *Vazifangiz:*\n' +
                                    '   Session ulang va guruhlaringiz tayyor bo\'lsin\n' +
                                    '   Master xabar yuborganda avtomatik tarqatiladi\n\n' +
                                    '📞 Savol bo\'lsa admin bilan bog\'laning.', __assign({ parse_mode: 'Markdown' }, menu));
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== CANCEL CALLBACKS ==========
            this.bot.action('cancel_session', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, pending_1, _a, _b, _c;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            userId = (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id;
                            if (userId) {
                                pending_1 = this.pendingSessions.get(userId);
                                if (pending_1 === null || pending_1 === void 0 ? void 0 : pending_1.sessionId) {
                                    this.telegramService.cancelPendingAuth(pending_1.sessionId).catch(function () { });
                                }
                                this.pendingSessions.delete(userId);
                            }
                            ctx.answerCbQuery('Bekor qilindi');
                            _b = (_a = ctx).reply;
                            _c = ['❌ Session ulash bekor qilindi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_e.sent()]));
                            return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action('cancel_ad', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, _b, _c;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            userId = (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id;
                            if (userId)
                                this.awaitingAdText.delete(userId);
                            ctx.answerCbQuery('Bekor qilindi');
                            _b = (_a = ctx).reply;
                            _c = ["❌ E'lon yaratish bekor qilindi."];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 1:
                            _b.apply(_a, _c.concat([_e.sent()]));
                            return [2 /*return*/];
                    }
                });
            }); });
            this.bot.action('back_to_main', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, menu, _a;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            userId = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
                            if (userId)
                                this.clearUserState(userId);
                            ctx.answerCbQuery();
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _c.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 2:
                            _a = _c.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _a = _c.sent();
                            _c.label = 5;
                        case 5:
                            menu = _a;
                            ctx.reply('👇 Asosiy menyu:', menu);
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== PHOTO HANDLER (chek rasm) ==========
            this.bot.on((0, filters_1.message)('photo'), function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, flow, receiptUrl, user, _a, _b, _c, _d, _e, _f, _g, error_21, _h, _j, _k;
                var _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            userId = (_l = ctx.from) === null || _l === void 0 ? void 0 : _l.id;
                            if (!userId)
                                return [2 /*return*/];
                            flow = this.subscriptionFlows.get(userId);
                            if (!flow || flow.step !== 'awaiting_receipt')
                                return [2 /*return*/];
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 8, , 10]);
                            return [4 /*yield*/, this.downloadPhoto(ctx)];
                        case 2:
                            receiptUrl = _m.sent();
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 3:
                            user = _m.sent();
                            if (!!user) return [3 /*break*/, 5];
                            _b = (_a = ctx).reply;
                            _c = ['❌ Foydalanuvchi topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _b.apply(_a, _c.concat([_m.sent()]));
                            this.subscriptionFlows.delete(userId);
                            return [2 /*return*/];
                        case 5: return [4 /*yield*/, this.paymentsService.create(user.id, flow.amount, flow.selectedPlan, { receiptImage: receiptUrl })];
                        case 6:
                            _m.sent();
                            this.subscriptionFlows.delete(userId);
                            _e = (_d = ctx).reply;
                            _f = ['✅ *To\'lovingiz qabul qilindi!*\n\n' +
                                    "\uD83D\uDCB0 *Summa:* ".concat(flow.amount.toLocaleString(), " UZS\n") +
                                    "\uD83D\uDCE6 *Plan:* ".concat(PLAN_INFO[flow.selectedPlan].name, "\n") +
                                    '📸 *Chek:* Yuklandi\n\n' +
                                    '⏳ *Admin tasdiqlashini kuting.*\n' +
                                    'Tasdiqlangandan keyin obuna faollashadi.'];
                            _g = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 7:
                            _e.apply(_d, _f.concat([__assign.apply(void 0, _g.concat([_m.sent()]))]));
                            return [3 /*break*/, 10];
                        case 8:
                            error_21 = _m.sent();
                            this.logger.error("Chek yuklashda xatolik: ".concat(error_21.message));
                            this.subscriptionFlows.delete(userId);
                            _j = (_h = ctx).reply;
                            _k = ['❌ Xatolik yuz berdi. Qayta urinib ko\'ring.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 9:
                            _j.apply(_h, _k.concat([_m.sent()]));
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
            // ========== TEXT HANDLER ==========
            this.bot.on((0, filters_1.message)('text'), function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var userId, text, driverReg, pending, closeFlow, user, _a, _b, _c, isMasterAd, adMenu, adHint, error_22, _d, _e, _f, defUser, defMenu, _g;
                var _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            userId = (_h = ctx.from) === null || _h === void 0 ? void 0 : _h.id;
                            text = ctx.message.text;
                            if (!userId)
                                return [2 /*return*/];
                            driverReg = this.driverRegistrations.get(ctx.chat.id);
                            if (!driverReg) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.handleDriverRegistrationFlow(ctx, driverReg, text)];
                        case 1:
                            _j.sent();
                            return [2 /*return*/];
                        case 2:
                            pending = this.pendingSessions.get(userId);
                            if (!pending) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.handleSessionFlow(ctx, pending, text)];
                        case 3:
                            _j.sent();
                            return [2 /*return*/];
                        case 4:
                            closeFlow = this.adCloseFlows.get(userId);
                            if (!closeFlow) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.handleAdCloseFlow(ctx, closeFlow, text)];
                        case 5:
                            _j.sent();
                            return [2 /*return*/];
                        case 6:
                            if (!this.awaitingAdText.has(userId)) return [3 /*break*/, 15];
                            this.awaitingAdText.delete(userId);
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 7:
                            user = _j.sent();
                            if (!!user) return [3 /*break*/, 9];
                            _b = (_a = ctx).reply;
                            _c = ['❌ Foydalanuvchi topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 8:
                            _b.apply(_a, _c.concat([_j.sent()]));
                            return [2 /*return*/];
                        case 9:
                            _j.trys.push([9, 12, , 14]);
                            return [4 /*yield*/, this.prisma.ad.create({
                                    data: {
                                        userId: user.id,
                                        title: text.slice(0, 50),
                                        content: text,
                                        mediaType: 'TEXT',
                                        status: 'DRAFT',
                                        createdBy: user.id,
                                    },
                                })];
                        case 10:
                            _j.sent();
                            isMasterAd = user.isMaster && !user.masterId;
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 11:
                            adMenu = _j.sent();
                            adHint = isMasterAd
                                ? '👥 Tarqatish uchun "👥 Tarqatish" tugmasini bosing.'
                                : '📋 "📋 Mening sessionlarim" dan session ulang.';
                            ctx.reply('✅ *E\'lon saqlandi!*\n\n' +
                                "\uD83D\uDCDD ".concat(text, "\n\n") +
                                adHint, __assign({ parse_mode: 'Markdown' }, adMenu));
                            return [3 /*break*/, 14];
                        case 12:
                            error_22 = _j.sent();
                            _e = (_d = ctx).reply;
                            _f = ["\u274C Xatolik: ".concat(error_22.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 13:
                            _e.apply(_d, _f.concat([_j.sent()]));
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/];
                        case 15: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 16:
                            defUser = _j.sent();
                            if (!defUser) return [3 /*break*/, 18];
                            return [4 /*yield*/, this.getMenuForUser(defUser.id)];
                        case 17:
                            _g = _j.sent();
                            return [3 /*break*/, 20];
                        case 18: return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 19:
                            _g = _j.sent();
                            _j.label = 20;
                        case 20:
                            defMenu = _g;
                            ctx.reply('👇 Quyidagi menudan tanlang:', defMenu);
                            return [2 /*return*/];
                    }
                });
            }); });
            // ========== 🚛 HAYDOVCHI — mashina turi tanlash callback ==========
            this.bot.action(/dvt_(.+)/, function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var vehicleType, chatId, reg;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            vehicleType = ctx.match[1];
                            chatId = (_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id;
                            if (!chatId)
                                return [2 /*return*/];
                            reg = this.driverRegistrations.get(chatId);
                            if (!(!reg || reg.step !== 'vehicleType')) return [3 /*break*/, 2];
                            return [4 /*yield*/, ctx.answerCbQuery('⚠️ Muddati o\'tgan')];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                        case 2:
                            reg.vehicleType = vehicleType;
                            reg.step = 'vehicleCapacity';
                            this.driverRegistrations.set(chatId, reg);
                            return [4 /*yield*/, ctx.answerCbQuery("".concat(vehicleType, " tanlandi"))];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, ctx.editMessageText("\u2705 Mashina: *".concat(vehicleType, "*\n\n\u2696\uFE0F Yuk sig'imi kiriting (masalan: 20 tonna):"), { parse_mode: 'Markdown' })];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            // Generic callback
            this.bot.on('callback_query', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                var data, paymentId, isApprove, tgId, adminUser, e_2;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!('data' in ctx.callbackQuery) || !ctx.callbackQuery.data) {
                                ctx.answerCbQuery('⚠️ Noma\'lum buyruq');
                                return [2 /*return*/];
                            }
                            data = ctx.callbackQuery.data;
                            if (!(data.startsWith('pay_approve_') || data.startsWith('pay_reject_'))) return [3 /*break*/, 16];
                            paymentId = data.replace('pay_approve_', '').replace('pay_reject_', '');
                            isApprove = data.startsWith('pay_approve_');
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 13, , 15]);
                            tgId = String((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id);
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: { telegramId: tgId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                                })];
                        case 2:
                            adminUser = _e.sent();
                            if (!!adminUser) return [3 /*break*/, 4];
                            return [4 /*yield*/, ctx.answerCbQuery('⛔ Faqat admin tasdiqlashi mumkin')];
                        case 3:
                            _e.sent();
                            return [2 /*return*/];
                        case 4:
                            if (!isApprove) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.paymentsService.approve(paymentId, adminUser.id)];
                        case 5:
                            _e.sent();
                            return [4 /*yield*/, ctx.editMessageCaption(((_b = ctx.callbackQuery.message) === null || _b === void 0 ? void 0 : _b.caption) + '\n\n✅ *TASDIQLANDI* — ' + (adminUser.firstName || 'Admin'), { parse_mode: 'Markdown' }).catch(function () { })];
                        case 6:
                            _e.sent();
                            return [4 /*yield*/, ctx.answerCbQuery('✅ To\'lov tasdiqlandi!')];
                        case 7:
                            _e.sent();
                            return [3 /*break*/, 12];
                        case 8: return [4 /*yield*/, this.paymentsService.reject(paymentId, adminUser.id, 'Telegram orqali rad etildi')];
                        case 9:
                            _e.sent();
                            return [4 /*yield*/, ctx.editMessageCaption(((_c = ctx.callbackQuery.message) === null || _c === void 0 ? void 0 : _c.caption) + '\n\n❌ *RAD ETILDI* — ' + (adminUser.firstName || 'Admin'), { parse_mode: 'Markdown' }).catch(function () { })];
                        case 10:
                            _e.sent();
                            return [4 /*yield*/, ctx.answerCbQuery('❌ To\'lov rad etildi')];
                        case 11:
                            _e.sent();
                            _e.label = 12;
                        case 12: return [3 /*break*/, 15];
                        case 13:
                            e_2 = _e.sent();
                            return [4 /*yield*/, ctx.answerCbQuery("\u26A0\uFE0F Xato: ".concat((_d = e_2.message) === null || _d === void 0 ? void 0 : _d.slice(0, 50)))];
                        case 14:
                            _e.sent();
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                        case 16: return [2 /*return*/];
                    }
                });
            }); });
        };
        // ==================== SESSION FLOW ====================
        TelegramBotService_1.prototype.handleSessionFlow = function (ctx, pending, text) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, _a, phone, fullPhone, user, _b, _c, _d, result, code, result, _e, _f, _g, _h, error_23, _j, _k, _l, result, _m, _o, _p, _q, error_24, _r, _s, _t, _u, _v, _w, error_25, _x, _y, _z;
                var _0;
                return __generator(this, function (_1) {
                    switch (_1.label) {
                        case 0:
                            userId = (_0 = ctx.from) === null || _0 === void 0 ? void 0 : _0.id;
                            if (!userId)
                                return [2 /*return*/];
                            _1.label = 1;
                        case 1:
                            _1.trys.push([1, 28, , 30]);
                            _a = pending.step;
                            switch (_a) {
                                case 'phone': return [3 /*break*/, 2];
                                case 'code': return [3 /*break*/, 7];
                                case 'password': return [3 /*break*/, 18];
                            }
                            return [3 /*break*/, 25];
                        case 2:
                            phone = text.replace(/[\s\-\(\)]/g, '');
                            if (!/^\+?\d{10,15}$/.test(phone)) {
                                ctx.reply('❌ *Noto\'g\'ri format!*\n\n' +
                                    'To\'g\'ri format: `+998901234567`\n\n' +
                                    'Qayta yuboring:', { parse_mode: 'Markdown' });
                                return [2 /*return*/];
                            }
                            fullPhone = phone.startsWith('+') ? phone : '+' + phone;
                            ctx.reply("\uD83D\uDCF1 *".concat(fullPhone, "* ga kod yuborilmoqda..."), { parse_mode: 'Markdown' });
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 3:
                            user = _1.sent();
                            if (!!user) return [3 /*break*/, 5];
                            _c = (_b = ctx).reply;
                            _d = ['❌ Foydalanuvchi topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _c.apply(_b, _d.concat([_1.sent()]));
                            this.pendingSessions.delete(userId);
                            return [2 /*return*/];
                        case 5: return [4 /*yield*/, this.telegramService.sendCode(user.id, fullPhone)];
                        case 6:
                            result = _1.sent();
                            this.pendingSessions.set(userId, {
                                step: 'code',
                                phone: fullPhone,
                                sessionId: result.sessionId,
                            });
                            ctx.reply('✅ *Kod yuborildi!*\n\n' +
                                '🔐 Telegram ilovangizga kelgan kodni yuboring:\n\n' +
                                '⏳ Kodni kutmoqda...', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                            ])));
                            return [3 /*break*/, 27];
                        case 7:
                            code = text.replace(/[^0-9]/g, '');
                            if (code.length < 4 || code.length > 6) {
                                ctx.reply('❌ Kod 4-6 ta raqamdan iborat bo\'lishi kerak.\n' +
                                    'Agar kodda harflar bo\'lsa, shunday yuboring — raqamlarni o\'zimiz ajratamiz.\n' +
                                    'Qayta yuboring:');
                                return [2 /*return*/];
                            }
                            ctx.reply('🔐 Kod tekshirilmoqda...');
                            _1.label = 8;
                        case 8:
                            _1.trys.push([8, 11, , 17]);
                            return [4 /*yield*/, this.telegramService.signIn(pending.sessionId, code)];
                        case 9:
                            result = _1.sent();
                            this.pendingSessions.delete(userId);
                            _f = (_e = ctx).reply;
                            _g = ['✅ *Session muvaffaqiyatli ulandi!*\n\n' +
                                    "\uD83D\uDCCA *Guruhlar:* ".concat(result.groupsCount, " ta\n\n") +
                                    '📋 "📋 Mening sessionlarim" — barchani ko\'ring\n' +
                                    '🚀 Endi e\'lon tarqatishingiz mumkin!'];
                            _h = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 10:
                            _f.apply(_e, _g.concat([__assign.apply(void 0, _h.concat([_1.sent()]))]));
                            return [3 /*break*/, 17];
                        case 11:
                            error_23 = _1.sent();
                            if (!(error_23.message === '2FA_REQUIRED')) return [3 /*break*/, 12];
                            this.pendingSessions.set(userId, __assign(__assign({}, pending), { step: 'password' }));
                            ctx.reply('🔒 *2FA parol kerak!*\n\n' +
                                'Telegram hisobingizning 2FA parolini yuboring:', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                            ])));
                            return [3 /*break*/, 16];
                        case 12:
                            if (!(error_23.message === 'RESEND_CODE')) return [3 /*break*/, 13];
                            // Kod muddati o'tgan — yangi kod yuborildi
                            ctx.reply('⏳ *Kod muddati o\'tgan!*\n\n' +
                                '📱 Yangi kod qayta yuborildi.\n' +
                                'Yangi kodni yuboring:', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                            ])));
                            return [3 /*break*/, 16];
                        case 13:
                            if (!(error_23.message.includes('noto') || error_23.message.includes('INVALID'))) return [3 /*break*/, 14];
                            // Kod noto'g'ri — qayta kiritish imkoniyati
                            ctx.reply('❌ *Kod noto\'g\'ri!* Qayta yuboring:', __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard([
                                [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_session')],
                            ])));
                            return [3 /*break*/, 16];
                        case 14:
                            this.pendingSessions.delete(userId);
                            _k = (_j = ctx).reply;
                            _l = ["\u274C Xatolik: ".concat(error_23.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 15:
                            _k.apply(_j, _l.concat([_1.sent()]));
                            _1.label = 16;
                        case 16: return [3 /*break*/, 17];
                        case 17: return [3 /*break*/, 27];
                        case 18:
                            ctx.reply('🔒 Parol tekshirilmoqda...');
                            _1.label = 19;
                        case 19:
                            _1.trys.push([19, 22, , 24]);
                            return [4 /*yield*/, this.telegramService.signIn(pending.sessionId, '', text)];
                        case 20:
                            result = _1.sent();
                            this.pendingSessions.delete(userId);
                            _o = (_m = ctx).reply;
                            _p = ['✅ *Session muvaffaqiyatli ulandi!*\n\n' +
                                    "\uD83D\uDCCA *Guruhlar:* ".concat(result.groupsCount, " ta")];
                            _q = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 21:
                            _o.apply(_m, _p.concat([__assign.apply(void 0, _q.concat([_1.sent()]))]));
                            return [3 /*break*/, 24];
                        case 22:
                            error_24 = _1.sent();
                            this.pendingSessions.delete(userId);
                            _s = (_r = ctx).reply;
                            _t = ["\u274C Xatolik: ".concat(error_24.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 23:
                            _s.apply(_r, _t.concat([_1.sent()]));
                            return [3 /*break*/, 24];
                        case 24: return [3 /*break*/, 27];
                        case 25:
                            this.pendingSessions.delete(userId);
                            _v = (_u = ctx).reply;
                            _w = ['❌ Xatolik. Qayta urinib ko\'ring.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 26:
                            _v.apply(_u, _w.concat([_1.sent()]));
                            _1.label = 27;
                        case 27: return [3 /*break*/, 30];
                        case 28:
                            error_25 = _1.sent();
                            this.pendingSessions.delete(userId);
                            this.logger.error("Session flow xatolik: ".concat(error_25.message));
                            _y = (_x = ctx).reply;
                            _z = ["\u274C Xatolik: ".concat(error_25.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 29:
                            _y.apply(_x, _z.concat([_1.sent()]));
                            return [3 /*break*/, 30];
                        case 30: return [2 /*return*/];
                    }
                });
            });
        };
        // ==================== AD CLOSE FLOW ====================
        // ==================== HAYDOVCHI RO'YXATDAN O'TISH ====================
        TelegramBotService_1.prototype.handleDriverRegistrationFlow = function (ctx, reg, text) {
            return __awaiter(this, void 0, void 0, function () {
                var chatId, telegramId, _a, vehicleKeyboard, user, existingProfile, code, error_26;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            chatId = ctx.chat.id;
                            telegramId = ctx.from.id.toString();
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 23, , 25]);
                            _a = reg.step;
                            switch (_a) {
                                case 'fullName': return [3 /*break*/, 2];
                                case 'phone': return [3 /*break*/, 4];
                                case 'vehicleType': return [3 /*break*/, 6];
                                case 'vehicleCapacity': return [3 /*break*/, 8];
                            }
                            return [3 /*break*/, 20];
                        case 2:
                            reg.fullName = text.trim();
                            reg.step = 'phone';
                            this.driverRegistrations.set(chatId, reg);
                            return [4 /*yield*/, ctx.reply("\u2705 Ism: *".concat(reg.fullName, "*\n\n\uD83D\uDCDE Telefon raqamingizni kiriting (masalan: +998901234567):"), { parse_mode: 'Markdown' })];
                        case 3:
                            _d.sent();
                            return [3 /*break*/, 22];
                        case 4:
                            reg.phone = text.trim().replace(/\s/g, '');
                            reg.step = 'vehicleType';
                            this.driverRegistrations.set(chatId, reg);
                            vehicleKeyboard = {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: '🚛 Fura', callback_data: 'dvt_Fura' }, { text: '🚚 Kamaz', callback_data: 'dvt_Kamaz' }],
                                        [{ text: '🚛 MAN', callback_data: 'dvt_MAN' }, { text: '🚛 Volvo', callback_data: 'dvt_Volvo' }],
                                        [{ text: '🚛 Scania', callback_data: 'dvt_Scania' }, { text: '🚛 DAF', callback_data: 'dvt_DAF' }],
                                        [{ text: '🚛 Mercedes', callback_data: 'dvt_Mercedes' }, { text: '🚛 HOWO', callback_data: 'dvt_HOWO' }],
                                        [{ text: '🚐 Isuzu', callback_data: 'dvt_Isuzu' }, { text: '🚐 Gazel', callback_data: 'dvt_Gazel' }],
                                        [{ text: '📦 Boshqa', callback_data: 'dvt_Boshqa' }],
                                    ],
                                },
                            };
                            return [4 /*yield*/, ctx.reply('✅ Telefon saqlandi!\n\n🚛 Mashina turini tanlang:', vehicleKeyboard)];
                        case 5:
                            _d.sent();
                            return [3 /*break*/, 22];
                        case 6:
                            reg.vehicleType = text.trim();
                            reg.step = 'vehicleCapacity';
                            this.driverRegistrations.set(chatId, reg);
                            return [4 /*yield*/, ctx.reply("\u2705 Mashina: *".concat(reg.vehicleType, "*\n\n\u2696\uFE0F Yuk sig'imi (tonnaj) kiriting (masalan: 20 tonna):"), { parse_mode: 'Markdown' })];
                        case 7:
                            _d.sent();
                            return [3 /*break*/, 22];
                        case 8:
                            reg.vehicleCapacity = text.trim();
                            reg.step = 'otp';
                            this.driverRegistrations.set(chatId, reg);
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { telegramId: telegramId } })];
                        case 9:
                            user = _d.sent();
                            if (!!user) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        telegramId: telegramId,
                                        role: 'DRIVER',
                                        firstName: ((_b = reg.fullName) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || reg.fullName,
                                        lastName: ((_c = reg.fullName) === null || _c === void 0 ? void 0 : _c.split(' ')[0]) || undefined,
                                        phoneNumber: reg.phone,
                                        isRegistered: true,
                                        registeredAt: new Date(),
                                    },
                                })];
                        case 10:
                            user = _d.sent();
                            return [3 /*break*/, 13];
                        case 11: return [4 /*yield*/, this.prisma.user.update({
                                where: { telegramId: telegramId },
                                data: {
                                    role: 'DRIVER',
                                    phoneNumber: reg.phone || user.phoneNumber,
                                    isRegistered: true,
                                    registeredAt: user.registeredAt || new Date(),
                                },
                            })];
                        case 12:
                            user = _d.sent();
                            _d.label = 13;
                        case 13: return [4 /*yield*/, this.prisma.driverProfile.findUnique({ where: { userId: user.id } })];
                        case 14:
                            existingProfile = _d.sent();
                            if (!!existingProfile) return [3 /*break*/, 16];
                            return [4 /*yield*/, this.prisma.driverProfile.create({
                                    data: {
                                        userId: user.id,
                                        fullName: reg.fullName,
                                        phone: reg.phone,
                                        vehicleType: reg.vehicleType,
                                        vehicleCapacity: reg.vehicleCapacity,
                                    },
                                })];
                        case 15:
                            _d.sent();
                            return [3 /*break*/, 18];
                        case 16: return [4 /*yield*/, this.prisma.driverProfile.update({
                                where: { userId: user.id },
                                data: {
                                    fullName: reg.fullName,
                                    phone: reg.phone,
                                    vehicleType: reg.vehicleType,
                                    vehicleCapacity: reg.vehicleCapacity,
                                },
                            })];
                        case 17:
                            _d.sent();
                            _d.label = 18;
                        case 18:
                            code = Math.floor(100000 + Math.random() * 900000).toString();
                            app_login_codes_1.appLoginCodes.set(code, {
                                telegramId: telegramId,
                                expiresAt: Date.now() + 5 * 60 * 1000,
                            });
                            this.driverRegistrations.delete(chatId);
                            return [4 /*yield*/, ctx.reply('✅ *Ro\'yxatdan o\'tish muvaffaqiyatli!*\n\n' +
                                    '📋 *Sizning ma\'lumotlaringiz:*\n' +
                                    "\uD83D\uDC64 Ism: ".concat(reg.fullName, "\n") +
                                    "\uD83D\uDCDE Tel: ".concat(reg.phone, "\n") +
                                    "\uD83D\uDE9B Mashina: ".concat(reg.vehicleType, "\n") +
                                    "\u2696\uFE0F Tonnaj: ".concat(reg.vehicleCapacity, "\n\n") +
                                    '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                                    '📲 *Ilovaga kirish uchun:*\n\n' +
                                    "\uD83C\uDD94 Telegram ID: `".concat(telegramId, "`\n") +
                                    "\uD83D\uDD11 Login kod: `".concat(code, "`\n\n") +
                                    '📱 Ilovada "Haydovchi" ni tanlang va yuqoridagi ma\'lumotlarni kiriting.\n\n' +
                                    '⏰ Kod 5 daqiqa amal qiladi.', { parse_mode: 'Markdown' })];
                        case 19:
                            _d.sent();
                            return [3 /*break*/, 22];
                        case 20:
                            this.driverRegistrations.delete(chatId);
                            return [4 /*yield*/, ctx.reply('❌ Noma\'lum qadam. /haydovchi buyrug\'ini qayta yuboring.')];
                        case 21:
                            _d.sent();
                            _d.label = 22;
                        case 22: return [3 /*break*/, 25];
                        case 23:
                            error_26 = _d.sent();
                            this.logger.error('Driver registration flow xatolik:', error_26);
                            this.driverRegistrations.delete(chatId);
                            return [4 /*yield*/, ctx.reply('❌ Xatolik yuz berdi. /haydovchi buyrug\'ini qayta yuboring.')];
                        case 24:
                            _d.sent();
                            return [3 /*break*/, 25];
                        case 25: return [2 /*return*/];
                    }
                });
            });
        };
        TelegramBotService_1.prototype.handleAdCloseFlow = function (ctx, flow, text) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, _a, _b, _c, _d, _e, amount, fromMatch, toMatch, weight, vehicleType, _f, _g, _h, error_27, _j, _k, _l;
                var _m;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0:
                            userId = (_m = ctx.from) === null || _m === void 0 ? void 0 : _m.id;
                            if (!userId)
                                return [2 /*return*/];
                            _o.label = 1;
                        case 1:
                            _o.trys.push([1, 17, , 19]);
                            _a = flow.step;
                            switch (_a) {
                                case 'editing': return [3 /*break*/, 2];
                                case 'amount': return [3 /*break*/, 5];
                                case 'cargo_from': return [3 /*break*/, 6];
                                case 'cargo_to': return [3 /*break*/, 8];
                                case 'cargo_type': return [3 /*break*/, 10];
                                case 'cargo_weight': return [3 /*break*/, 11];
                                case 'vehicle_type': return [3 /*break*/, 12];
                            }
                            return [3 /*break*/, 14];
                        case 2:
                            // Matnni yangilash
                            if (!flow.adId)
                                return [3 /*break*/, 16];
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: flow.adId },
                                    data: { content: text, title: text.slice(0, 50) },
                                })];
                        case 3:
                            _o.sent();
                            this.adCloseFlows.delete(userId);
                            _c = (_b = ctx).reply;
                            _d = ['✅ *E\'lon matni yangilandi!*\n\n' +
                                    "\uD83D\uDCDD ".concat(text.length > 100 ? text.slice(0, 100) + '...' : text)];
                            _e = [{ parse_mode: 'Markdown' }];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 4:
                            _c.apply(_b, _d.concat([__assign.apply(void 0, _e.concat([_o.sent()]))]));
                            return [3 /*break*/, 16];
                        case 5:
                            {
                                amount = parseFloat(text.replace(/[^\d.]/g, ''));
                                if (isNaN(amount) || amount <= 0) {
                                    ctx.reply('❌ Noto\'g\'ri summa. Faqat raqam yuboring (masalan: 5000000):');
                                    return [2 /*return*/];
                                }
                                flow.closedAmount = amount;
                                // Keyingi bo'sh maydonni topish
                                this.advanceCloseFlow(ctx, userId, flow);
                                return [3 /*break*/, 16];
                            }
                            _o.label = 6;
                        case 6: return [4 /*yield*/, this.locationsService.matchLocation(text.trim())];
                        case 7:
                            fromMatch = _o.sent();
                            flow.cargoFrom = fromMatch ? fromMatch.name : text.trim();
                            if (fromMatch) {
                                ctx.reply("\u2705 ".concat(fromMatch.name, " (").concat(fromMatch.region, ")"));
                            }
                            this.advanceCloseFlow(ctx, userId, flow);
                            return [3 /*break*/, 16];
                        case 8: return [4 /*yield*/, this.locationsService.matchLocation(text.trim())];
                        case 9:
                            toMatch = _o.sent();
                            flow.cargoTo = toMatch ? toMatch.name : text.trim();
                            if (toMatch) {
                                ctx.reply("\u2705 ".concat(toMatch.name, " (").concat(toMatch.region, ")"));
                            }
                            this.advanceCloseFlow(ctx, userId, flow);
                            return [3 /*break*/, 16];
                        case 10:
                            {
                                flow.cargoType = text.trim();
                                this.advanceCloseFlow(ctx, userId, flow);
                                return [3 /*break*/, 16];
                            }
                            _o.label = 11;
                        case 11:
                            {
                                weight = parseFloat(text.replace(/[^\d.]/g, ''));
                                if (isNaN(weight) || weight <= 0) {
                                    ctx.reply('❌ Noto\'g\'ri qiymat. Faqat raqam yuboring:');
                                    return [2 /*return*/];
                                }
                                flow.cargoWeight = weight;
                                this.advanceCloseFlow(ctx, userId, flow);
                                return [3 /*break*/, 16];
                            }
                            _o.label = 12;
                        case 12:
                            vehicleType = text.trim();
                            return [4 /*yield*/, this.finalizeCloseFlow(ctx, userId, flow, vehicleType)];
                        case 13:
                            _o.sent();
                            return [3 /*break*/, 16];
                        case 14:
                            this.adCloseFlows.delete(userId);
                            _g = (_f = ctx).reply;
                            _h = ['❌ Xatolik. Qayta urinib ko\'ring.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 15:
                            _g.apply(_f, _h.concat([_o.sent()]));
                            _o.label = 16;
                        case 16: return [3 /*break*/, 19];
                        case 17:
                            error_27 = _o.sent();
                            this.adCloseFlows.delete(userId);
                            _k = (_j = ctx).reply;
                            _l = ["\u274C Xatolik: ".concat(error_27.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 18:
                            _k.apply(_j, _l.concat([_o.sent()]));
                            return [3 /*break*/, 19];
                        case 19: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * E'lon xabarlarini background da o'chirish (bot service dan)
         */
        TelegramBotService_1.prototype.deleteAdMessagesInBackground = function (adId) {
            return __awaiter(this, void 0, void 0, function () {
                var histories, messagesToDelete, result, error_28;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, this.prisma.postHistory.findMany({
                                    where: {
                                        post: { adId: adId },
                                        status: 'SENT',
                                        messageId: { not: null },
                                    },
                                    include: {
                                        group: { select: { telegramId: true, sessionId: true } },
                                    },
                                })];
                        case 1:
                            histories = _a.sent();
                            this.logger.log("E'lon xabarlari topildi: ".concat(histories.length, " ta (adId: ").concat(adId, ")"));
                            if (histories.length === 0)
                                return [2 /*return*/];
                            messagesToDelete = histories
                                .filter(function (h) { return h.messageId && h.group; })
                                .map(function (h) { return ({
                                messageId: h.messageId,
                                groupTelegramId: h.group.telegramId,
                                sessionId: h.group.sessionId,
                            }); });
                            if (!(messagesToDelete.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.telegramService.deleteAdMessages(messagesToDelete)];
                        case 2:
                            result = _a.sent();
                            this.logger.log("E'lon xabarlari o'chirildi: ".concat(result.deleted, "/").concat(messagesToDelete.length, " (adId: ").concat(adId, ")"));
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            error_28 = _a.sent();
                            this.logger.error("E'lon xabarlarini o'chirishda xatolik: ".concat(error_28.message));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        // ==================== AD CLOSE — AUTO-PARSE & ADVANCE ====================
        /**
         * E'lon matnidan ma'lumotlarni avto-ajratish
         */
        TelegramBotService_1.prototype.parseAdContent = function (content) {
            return __awaiter(this, void 0, void 0, function () {
                var result, text, lines, routePatterns, _i, routePatterns_1, pattern, match, fromRaw, toRaw, fromMatch, toMatch, rawWords, words, foundLocations, _a, words_1, word, match, weightPatterns, _b, weightPatterns_1, pattern, match, vehicleTypes, _c, _d, _e, type, patterns, _f, patterns_1, p, cargoTypes, _g, _h, _j, type, patterns, _k, patterns_2, p;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            result = {
                                cargoFrom: null,
                                cargoTo: null,
                                cargoType: null,
                                cargoWeight: null,
                                vehicleType: null,
                            };
                            text = content.toLowerCase();
                            lines = content.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
                            routePatterns = [
                                // "Toshkent → Samarqand", "Toshkent - Samarqand", "Toshkent – Samarqand"
                                /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*[→➡⟶\-–—=]+[>\s]*\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+)/i,
                                // "Toshkentdan Samarqandga", "Toshkent dan Samarqand ga"
                                /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*dan\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s*ga\b/i,
                                // "Toshkentdan Samarqanga" (qisqartirilgan)
                                /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)dan\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)ga\b/i,
                                // "Toshkent Samarqand yo'nalish/marshrut"
                                /([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s+([A-Za-zА-Яа-яЎўҚқҒғҲҳ''\s]+?)\s+(?:yo.?nalish|marshrut|yonalish)/i,
                            ];
                            _i = 0, routePatterns_1 = routePatterns;
                            _l.label = 1;
                        case 1:
                            if (!(_i < routePatterns_1.length)) return [3 /*break*/, 5];
                            pattern = routePatterns_1[_i];
                            match = content.match(pattern);
                            if (!match) return [3 /*break*/, 4];
                            fromRaw = match[1].trim().replace(/dan$/i, '').trim();
                            toRaw = match[2].trim().replace(/ga$/i, '').replace(/ga\b.*$/i, '').trim();
                            return [4 /*yield*/, this.locationsService.matchLocation(fromRaw)];
                        case 2:
                            fromMatch = _l.sent();
                            return [4 /*yield*/, this.locationsService.matchLocation(toRaw)];
                        case 3:
                            toMatch = _l.sent();
                            if (fromMatch)
                                result.cargoFrom = fromMatch.name;
                            if (toMatch)
                                result.cargoTo = toMatch.name;
                            if (result.cargoFrom || result.cargoTo)
                                return [3 /*break*/, 5];
                            _l.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5:
                            if (!(!result.cargoFrom && !result.cargoTo)) return [3 /*break*/, 10];
                            rawWords = content.split(/[\s,\n\-→➡]+/).filter(function (w) { return w.length >= 3; });
                            words = rawWords.map(function (w) { return w.replace(/^(dan|ga)$/i, '').replace(/(dan|ga)$/i, '').trim(); }).filter(function (w) { return w.length >= 3; });
                            foundLocations = [];
                            _a = 0, words_1 = words;
                            _l.label = 6;
                        case 6:
                            if (!(_a < words_1.length)) return [3 /*break*/, 9];
                            word = words_1[_a];
                            if (foundLocations.length >= 2)
                                return [3 /*break*/, 9];
                            return [4 /*yield*/, this.locationsService.matchLocation(word.trim())];
                        case 7:
                            match = _l.sent();
                            if (match && !foundLocations.includes(match.name)) {
                                foundLocations.push(match.name);
                            }
                            _l.label = 8;
                        case 8:
                            _a++;
                            return [3 /*break*/, 6];
                        case 9:
                            if (foundLocations.length >= 2) {
                                result.cargoFrom = foundLocations[0];
                                result.cargoTo = foundLocations[1];
                            }
                            else if (foundLocations.length === 1) {
                                result.cargoFrom = foundLocations[0];
                            }
                            _l.label = 10;
                        case 10:
                            weightPatterns = [
                                /(\d+(?:[.,]\d+)?)\s*(?:tonna?|тонн?а?)/i, // "20 tonna", "20тонна"
                                /(\d+(?:[.,]\d+)?)\s*(?:tn\b|t\b|т\b)/i, // "20t", "20tn", "20т"
                                /(\d+(?:[.,]\d+)?)\s*(?:tonn?a?|tona)/i, // "20tona", "20tonna"
                                /(?:tonna?|тонн?а?)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i, // "tonna: 20", "тонна 20"
                            ];
                            for (_b = 0, weightPatterns_1 = weightPatterns; _b < weightPatterns_1.length; _b++) {
                                pattern = weightPatterns_1[_b];
                                match = text.match(pattern);
                                if (match) {
                                    result.cargoWeight = parseFloat(match[1].replace(',', '.'));
                                    break;
                                }
                            }
                            vehicleTypes = {
                                'Fura': ['fu+ra', 'фу+ра', 'trailer', 'тент', 'tent', 'fura', 'furo', 'fyra', 'phura'],
                                'Isuzu': ['is[uo]z[uo]', 'исузу', 'izuzu', 'isuzi', 'isizu', 'isusu'],
                                'Gazel': ['gaz[eiao]l', 'газел', 'gazelle', 'gazel', 'gazil', 'gasel'],
                                'Kamaz': ['k[ao]m[ao]z', 'камаз', 'kamaz', 'kamas', 'kamoz'],
                                'Daf': ['\\bdaf\\b', 'даф'],
                                'Man': ['\\bman\\b', '\\bман\\b'],
                                'Volvo': ['vol[bv]o', 'вольво', 'wolvo'],
                                'Scania': ['scan[iy]a', 'скания', 'skaniya', 'skania'],
                                'Howo': ['ho[vw]o', 'хово', 'havo'],
                                'Shacman': ['sha[ck]man', 'шакман', 'shakman', 'shachman', 'shacmen'],
                                'Samosvall': ['sam[oa]sval', 'самосвал', 'samasval'],
                                'Ref': ['ref\\b', 'реф\\b', 'refr[ie]', 'рефри', 'refka'],
                                'Labo': ['\\blabo\\b', 'лабо', 'damas', 'дамас'],
                                'Sprinter': ['spr[ie]nter', 'спринтер'],
                                'Bortovoy': ['bort[oa]v', 'бортов', 'bortovoy'],
                            };
                            for (_c = 0, _d = Object.entries(vehicleTypes); _c < _d.length; _c++) {
                                _e = _d[_c], type = _e[0], patterns = _e[1];
                                for (_f = 0, patterns_1 = patterns; _f < patterns_1.length; _f++) {
                                    p = patterns_1[_f];
                                    if (new RegExp(p, 'i').test(text)) {
                                        result.vehicleType = type;
                                        break;
                                    }
                                }
                                if (result.vehicleType)
                                    break;
                            }
                            cargoTypes = {
                                'G\'isht': ['g.?isht', 'gisht', 'кирпич', 'kirpich', 'kisht', 'gisth'],
                                'Sement': ['se?ment', 'cement', 'цемент', 'semint', 'ciment'],
                                'Qum': ['\\bqum\\b', 'песок', 'pesok', '\\bkum\\b'],
                                'Shag\'al': ['shag.?al', 'щебен', 'sheben', 'shagal', 'shagel'],
                                'Meva': ['meva', 'фрукт', 'frukt', 'miva'],
                                'Sabzavot': ['sabz[ao]vot', 'овощ', 'sabzivot'],
                                'Paxta': ['p[ao]xta', 'хлопок', 'cotton', 'pahta', 'pakta'],
                                'Bug\'doy': ['bug.?doy', 'пшениц', 'wheat', 'bugdoy', 'bugday'],
                                'Un': ['\\bun\\b', 'мука', 'flour'],
                                'Yog\'och': ['yog.?och', 'древесин', 'les\\b', 'лес\\b', 'yogoch', 'yogach'],
                                'Temir': ['temir', 'металл', 'metall', 'iron', 'timir'],
                                'Ko\'mir': ['ko.?mir', 'уголь', 'coal', 'komir', 'kumir'],
                                'Ploshchadka': ['ploshch?adka', 'площадк', 'ploshadka', 'ploshchatka'],
                                'Armattura': ['armat[uy]ra', 'арматур'],
                                'Don': ['\\bdon\\b', 'зерно', 'zerno'],
                                'Guruch': ['gur[iu]ch', 'рис\\b'],
                                'Kartoshka': ['kart[oa]shk', 'картошк', 'kartofka'],
                                'Piyoz': ['piy[oa]z', 'лук\\b'],
                                'Suv': ['\\bsuv\\b', 'вод[аы]'],
                                'Moy': ['\\bmoy\\b', 'масло', 'yog'],
                            };
                            for (_g = 0, _h = Object.entries(cargoTypes); _g < _h.length; _g++) {
                                _j = _h[_g], type = _j[0], patterns = _j[1];
                                for (_k = 0, patterns_2 = patterns; _k < patterns_2.length; _k++) {
                                    p = patterns_2[_k];
                                    if (new RegExp(p, 'i').test(text)) {
                                        result.cargoType = type;
                                        break;
                                    }
                                }
                                if (result.cargoType)
                                    break;
                            }
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Yopish oqimini keyingi bo'sh maydon ga otkzish
         * Agar maydon allaqachon to'ldirilgan bo'lsa, o'tkazib yuboradi
         */
        TelegramBotService_1.prototype.advanceCloseFlow = function (ctx, userId, flow) {
            return __awaiter(this, void 0, void 0, function () {
                var steps, _i, steps_1, s, value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            steps = [
                                { field: 'cargoFrom', step: 'cargo_from', prompt: '📍 Qayerdan?\n\nMasalan: Toshkent' },
                                { field: 'cargoTo', step: 'cargo_to', prompt: '📍 Qayerga?\n\nMasalan: Samarqand' },
                                { field: 'cargoType', step: 'cargo_type', prompt: '📦 Yuk turi?\n\nMasalan: G\'isht, Sement' },
                                { field: 'cargoWeight', step: 'cargo_weight', prompt: '⚖️ Nechchi tonna?\n\nFaqat raqam yuboring (masalan: 20)' },
                                { field: 'vehicleType', step: 'vehicle_type', prompt: '🚛 Qanday mashinaga ortildi?\n\nMasalan: Fura, Isuzu, Gazel, Kamaz' },
                            ];
                            // Birinchi bo'sh maydonni topish
                            for (_i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
                                s = steps_1[_i];
                                value = flow[s.field];
                                if (!value) {
                                    flow.step = s.step;
                                    this.adCloseFlows.set(userId, flow);
                                    ctx.reply(s.prompt);
                                    return [2 /*return*/];
                                }
                            }
                            // Barcha maydonlar to'ldirilgan — vehicle_type step ga yuborish
                            // (vehicle_type handler flow ni tugatadi)
                            flow.step = 'vehicle_type';
                            this.adCloseFlows.set(userId, flow);
                            if (!flow.vehicleType) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.finalizeCloseFlow(ctx, userId, flow, flow.vehicleType)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            ctx.reply('🚛 Qanday mashinaga ortildi?\n\nMasalan: Fura, Isuzu, Gazel, Kamaz');
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Yuk yopish oqimini tugatish (yakuniy qadam)
         */
        TelegramBotService_1.prototype.finalizeCloseFlow = function (ctx, userId, flow, vehicleType) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, _b, _c, ad, _d, _e, _f, autoDistance, distResult, _g, distText, _h, _j, _k, error_29, _l, _m, _o;
                var _this = this;
                var _p;
                return __generator(this, function (_q) {
                    switch (_q.label) {
                        case 0: return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _q.sent();
                            if (!(!user || !flow.adId)) return [3 /*break*/, 3];
                            this.adCloseFlows.delete(userId);
                            _b = (_a = ctx).reply;
                            _c = ['❌ Xatolik.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 2:
                            _b.apply(_a, _c.concat([_q.sent()]));
                            return [2 /*return*/];
                        case 3:
                            _q.trys.push([3, 14, , 16]);
                            return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: flow.adId } })];
                        case 4:
                            ad = _q.sent();
                            if (!!ad) return [3 /*break*/, 6];
                            this.adCloseFlows.delete(userId);
                            _e = (_d = ctx).reply;
                            _f = ['❌ E\'lon topilmadi.'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 5:
                            _e.apply(_d, _f.concat([_q.sent()]));
                            return [2 /*return*/];
                        case 6:
                            autoDistance = null;
                            if (!(flow.cargoFrom && flow.cargoTo)) return [3 /*break*/, 10];
                            _q.label = 7;
                        case 7:
                            _q.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.locationsService.calculateDistance(flow.cargoFrom, flow.cargoTo)];
                        case 8:
                            distResult = _q.sent();
                            autoDistance = distResult.distance;
                            return [3 /*break*/, 10];
                        case 9:
                            _g = _q.sent();
                            return [3 /*break*/, 10];
                        case 10: 
                        // YANGI deal yaratish
                        return [4 /*yield*/, this.prisma.ad.create({
                                data: {
                                    userId: user.id,
                                    title: "".concat(flow.cargoFrom || '', " \u2192 ").concat(flow.cargoTo || ''),
                                    content: ad.content,
                                    mediaType: 'TEXT',
                                    status: 'CLOSED',
                                    isSold: true,
                                    soldAt: new Date(),
                                    soldQuantity: 1,
                                    closedBy: user.id,
                                    closedAmount: flow.closedAmount,
                                    cargoFrom: flow.cargoFrom,
                                    cargoTo: flow.cargoTo,
                                    cargoType: flow.cargoType,
                                    cargoWeight: flow.cargoWeight,
                                    vehicleType: vehicleType,
                                    distance: autoDistance,
                                    createdBy: user.id,
                                },
                            })];
                        case 11:
                            // YANGI deal yaratish
                            _q.sent();
                            // Asl e'lonni CLOSED qilish + soldQuantity oshirish
                            return [4 /*yield*/, this.prisma.ad.update({
                                    where: { id: flow.adId },
                                    data: {
                                        status: 'CLOSED',
                                        isSold: true,
                                        soldAt: new Date(),
                                        soldQuantity: { increment: 1 },
                                    },
                                }).catch(function () { })];
                        case 12:
                            // Asl e'lonni CLOSED qilish + soldQuantity oshirish
                            _q.sent();
                            this.adCloseFlows.delete(userId);
                            distText = autoDistance ? "\uD83D\uDCCF Masofa: ".concat(autoDistance, " km\n") : '';
                            _j = (_h = ctx).reply;
                            _k = ['✅ Yuk yopildi!\n\n' +
                                    "\uD83D\uDCB0 Summa: ".concat((_p = flow.closedAmount) === null || _p === void 0 ? void 0 : _p.toLocaleString(), " UZS\n") +
                                    "\uD83D\uDCCD Marshrut: ".concat(flow.cargoFrom, " \u2192 ").concat(flow.cargoTo, "\n") +
                                    distText +
                                    "\uD83D\uDCE6 Yuk turi: ".concat(flow.cargoType, "\n") +
                                    "\u2696\uFE0F Tonna: ".concat(flow.cargoWeight, "\n") +
                                    "\uD83D\uDE9B Mashina: ".concat(vehicleType, "\n\n") +
                                    '🔄 Guruhlardan xabarlar o\'chirilmoqda...'];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 13:
                            _j.apply(_h, _k.concat([_q.sent()]));
                            // Guruhlardan xabarlarni o'chirish
                            this.deleteAdMessagesInBackground(flow.adId).catch(function (err) {
                                return _this.logger.error("Xabar o'chirishda xatolik: ".concat(err.message));
                            });
                            return [3 /*break*/, 16];
                        case 14:
                            error_29 = _q.sent();
                            this.adCloseFlows.delete(userId);
                            _m = (_l = ctx).reply;
                            _o = ["\u274C Xatolik: ".concat(error_29.message)];
                            return [4 /*yield*/, this.getMenuFromCtx(ctx)];
                        case 15:
                            _m.apply(_l, _o.concat([_q.sent()]));
                            return [3 /*break*/, 16];
                        case 16: return [2 /*return*/];
                    }
                });
            });
        };
        // ==================== SESSION SELECTION RENDER ====================
        TelegramBotService_1.prototype.renderSessionSelection = function (ctx, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var flow, user, sessions, allSelected, msg, buttons, _i, sessions_5, s, label, groupCount, isSelected, _a;
                var _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            flow = this.postingFlows.get(userId);
                            if (!flow)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.getOrCreateUser(ctx)];
                        case 1:
                            user = _f.sent();
                            if (!user)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: { userId: user.id, status: 'ACTIVE', sessionString: { not: null } },
                                    include: { _count: { select: { groups: true } } },
                                })];
                        case 2:
                            sessions = _f.sent();
                            allSelected = ((_b = flow.selectedSessions) === null || _b === void 0 ? void 0 : _b.length) === sessions.length;
                            msg = '📱 *Session tanlang:*\n\n';
                            msg += "Tanlangan: ".concat(((_c = flow.selectedSessions) === null || _c === void 0 ? void 0 : _c.length) || 0, " / ").concat(sessions.length, "\n\n");
                            buttons = [];
                            buttons.push([
                                telegraf_1.Markup.button.callback("\uD83D\uDD04 Barcha sessionlar ".concat(allSelected ? '✅' : '⬜'), 'toggle_all_sessions'),
                            ]);
                            for (_i = 0, sessions_5 = sessions; _i < sessions_5.length; _i++) {
                                s = sessions_5[_i];
                                label = s.name || s.phone || s.id.slice(0, 8);
                                groupCount = ((_d = s._count) === null || _d === void 0 ? void 0 : _d.groups) || 0;
                                isSelected = (_e = flow.selectedSessions) === null || _e === void 0 ? void 0 : _e.includes(s.id);
                                buttons.push([
                                    telegraf_1.Markup.button.callback("\uD83D\uDCF1 ".concat(label, " (").concat(groupCount, " guruh) ").concat(isSelected ? '✅' : '⬜'), "toggle_session_".concat(s.id)),
                                ]);
                            }
                            // Mode ga qarab tugma ko'rsatish
                            if (flow.mode === 'safe') {
                                buttons.push([telegraf_1.Markup.button.callback('🛡️ Himoyalangan boshlash', 'start_safe_posting_confirm')]);
                            }
                            else {
                                buttons.push([telegraf_1.Markup.button.callback('🚀 Oddiy tarqatishni boshlash', 'start_posting_confirm')]);
                            }
                            buttons.push([telegraf_1.Markup.button.callback('◀️ Orqaga', 'back_to_main')]);
                            _f.label = 3;
                        case 3:
                            _f.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, ctx.editMessageText(msg, __assign({ parse_mode: 'Markdown' }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                        case 4:
                            _f.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            _a = _f.sent();
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        // ==================== LIVE PROGRESS ====================
        /**
         * Tarqatish holatini formatlash (plain text, Markdown yo'q)
         */
        TelegramBotService_1.prototype.formatPostingProgress = function (jobId) {
            var stats = this.postingService.getJobStats(jobId);
            if (!stats)
                return '📈 Tarqatish holati: ma\'lumot yo\'q';
            var durationMin = Math.floor(stats.duration / 60000);
            var durationSec = Math.floor((stats.duration % 60000) / 1000);
            var msg = '';
            // Status
            if (stats.status === 'running') {
                msg += "\uD83D\uDFE2 Tarqatish davom etmoqda (Round ".concat(stats.currentRound || stats.roundsCompleted, ")\n\n");
            }
            else if (stats.status === 'completed') {
                msg += '✅ Tarqatish tugadi!\n\n';
            }
            else if (stats.status === 'stopped') {
                msg += '⏹ Tarqatish to\'xtatildi\n\n';
            }
            else if (stats.status === 'paused') {
                msg += '⏸ Tarqatish pauzada\n\n';
            }
            // Per-session stats
            if (stats.perSessionStats.length > 0) {
                msg += '📱 Sessionlar:\n';
                for (var _i = 0, _a = stats.perSessionStats; _i < _a.length; _i++) {
                    var s = _a[_i];
                    var total = s.sent + s.failed + s.skipped;
                    var pct = s.totalGroups > 0 ? Math.floor((s.sent / s.totalGroups) * 100) : 0;
                    msg += "  ".concat(s.sent > 0 ? '🟢' : '⏳', " ").concat(s.name, "\n");
                    msg += "    \u2705 ".concat(s.sent, " yuborildi");
                    if (s.failed > 0)
                        msg += " | \u274C ".concat(s.failed, " xato");
                    if (s.skipped > 0)
                        msg += " | \u23ED ".concat(s.skipped, " skip");
                    msg += " (".concat(total, "/").concat(s.totalGroups);
                    if (pct > 0)
                        msg += ", ".concat(pct, "%");
                    msg += ')\n';
                }
                msg += '\n';
            }
            // Overall stats
            msg += "\uD83D\uDCCA Jami: ".concat(stats.postedGroups, "/").concat(stats.totalGroups, " guruh\n");
            if (stats.failedGroups > 0)
                msg += "\u274C Xato: ".concat(stats.failedGroups, "\n");
            if (stats.skippedGroups > 0)
                msg += "\u23ED Skip: ".concat(stats.skippedGroups, "\n");
            msg += "\uD83D\uDD04 Roundlar: ".concat(stats.roundsCompleted, "\n");
            msg += "\u23F1 Muddat: ".concat(durationMin, "m ").concat(durationSec, "s\n");
            if (stats.successRate > 0) {
                msg += "\uD83D\uDCC8 Muvaffaqiyat: ".concat(stats.successRate.toFixed(1), "%\n");
            }
            // Keyingi round info
            if (stats.nextRoundAt) {
                var remaining = Math.max(0, stats.nextRoundAt.getTime() - Date.now());
                var remainMin = Math.floor(remaining / 60000);
                var remainSec = Math.floor((remaining % 60000) / 1000);
                var nextTime = stats.nextRoundAt.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                msg += "\n\u23F3 Keyingi round: ".concat(nextTime, " (").concat(remainMin, "m ").concat(remainSec, "s qoldi)");
            }
            // Interval info — broadcast bot kabi
            if (stats.safeMode) {
                msg += '\n\n🛡️ Rejim: HIMOYALANGAN\n';
                msg += '⏱ Interval: 1-15s (guruh), 10 min (round)';
            }
            else {
                msg += '\n\n🚀 Rejim: ODDIY\n';
                msg += '⏱ Interval: 0.3-6s (guruh), 5 min (round)';
            }
            if (stats.blockedGroups > 0) {
                msg += "\n\uD83D\uDEAB Bloklangan: ".concat(stats.blockedGroups, " ta guruh");
            }
            return msg;
        };
        /**
         * Job ga progress callback o'rnatish — xabar tahrirlaydi
         */
        TelegramBotService_1.prototype.registerProgressCallback = function (jobId, chatId, messageId) {
            var _this = this;
            this.postingService.setJobProgressCallback(jobId, function () {
                var text = _this.formatPostingProgress(jobId);
                _this.bot.telegram.editMessageText(chatId, messageId, undefined, text).catch(function () { });
            });
        };
        // ==================== STATE CLEANUP ====================
        TelegramBotService_1.prototype.clearUserState = function (userId) {
            this.pendingSessions.delete(userId);
            this.subscriptionFlows.delete(userId);
            this.awaitingAdText.delete(userId);
            this.pendingRegistrations.delete(userId.toString());
            this.adCloseFlows.delete(userId);
            this.postingFlows.delete(userId);
        };
        // ==================== MASTER/TOBE — REFERAL LINK ====================
        /**
         * /start ref_XXX — Tobe sifatida master ga ulash
         */
        TelegramBotService_1.prototype.handleRefLink = function (ctx, refCode) {
            return __awaiter(this, void 0, void 0, function () {
                var tgId, master, user, access, menu;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            tgId = (_b = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                            if (!tgId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: { refCode: refCode, isMaster: true },
                                })];
                        case 1:
                            master = _c.sent();
                            if (!!master) return [3 /*break*/, 3];
                            return [4 /*yield*/, ctx.reply('❌ Noto\'g\'ri referal havola!')];
                        case 2:
                            _c.sent();
                            return [2 /*return*/];
                        case 3: return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { telegramId: tgId },
                            })];
                        case 4:
                            user = _c.sent();
                            if (!!user) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.user.create({
                                    data: {
                                        telegramId: tgId,
                                        firstName: ctx.from.first_name,
                                        lastName: ctx.from.last_name,
                                        username: ctx.from.username,
                                        masterId: master.id,
                                    },
                                })];
                        case 5:
                            // Yangi user — tobe sifatida yaratish
                            user = _c.sent();
                            return [4 /*yield*/, ctx.reply("\u2705 *Siz tobe sifatida ulangingiz!*\n\n" +
                                    "\uD83D\uDC51 Master: ".concat(master.firstName || master.username || 'Anonim', "\n\n") +
                                    "*Endi qilishingiz kerak:*\n" +
                                    "1\uFE0F\u20E3 Telefon raqamingizni ulashing\n" +
                                    "2\uFE0F\u20E3 Session ulang\n\n" +
                                    "Master xabar yuborganda avtomatik tarqatiladi!", __assign({ parse_mode: 'Markdown' }, this.getContactRequestKeyboard()))];
                        case 6:
                            _c.sent();
                            this.pendingRegistrations.add(tgId);
                            return [2 /*return*/];
                        case 7:
                            if (!(user.masterId === master.id)) return [3 /*break*/, 9];
                            return [4 /*yield*/, ctx.reply('✅ Siz allaqachon bu masterga ulangansiz!')];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 14];
                        case 9: return [4 /*yield*/, this.prisma.user.update({
                                where: { id: user.id },
                                data: { masterId: master.id, isMaster: false },
                            })];
                        case 10:
                            _c.sent();
                            if (!(user.masterId && user.masterId !== master.id)) return [3 /*break*/, 12];
                            return [4 /*yield*/, ctx.reply("\u2705 *Master o'zgartirildi!*\n\n\uD83D\uDC51 Yangi master: ".concat(master.firstName || master.username || 'Anonim'), { parse_mode: 'Markdown' })];
                        case 11:
                            _c.sent();
                            return [3 /*break*/, 14];
                        case 12: return [4 /*yield*/, ctx.reply("\u2705 *Siz tobe sifatida ulangingiz!*\n\n\uD83D\uDC51 Master: ".concat(master.firstName || master.username || 'Anonim'), { parse_mode: 'Markdown' })];
                        case 13:
                            _c.sent();
                            _c.label = 14;
                        case 14:
                            if (!user.isRegistered) return [3 /*break*/, 21];
                            return [4 /*yield*/, this.checkAccess(user)];
                        case 15:
                            access = _c.sent();
                            if (!access.allowed) return [3 /*break*/, 18];
                            return [4 /*yield*/, this.getMenuForUser(user.id)];
                        case 16:
                            menu = _c.sent();
                            return [4 /*yield*/, ctx.reply('👇 Asosiy menyu:', menu)];
                        case 17:
                            _c.sent();
                            return [3 /*break*/, 20];
                        case 18: return [4 /*yield*/, ctx.reply('⏰ *Bepul sinov muddati tugadi!*\n\nObuna sotib oling.', __assign({ parse_mode: 'Markdown' }, this.getExpiredMenu()))];
                        case 19:
                            _c.sent();
                            _c.label = 20;
                        case 20: return [3 /*break*/, 23];
                        case 21:
                            this.pendingRegistrations.add(tgId);
                            return [4 /*yield*/, ctx.reply('📲 Botdan foydalanish uchun telefon raqamingizni ulashing:', this.getContactRequestKeyboard())];
                        case 22:
                            _c.sent();
                            _c.label = 23;
                        case 23: return [2 /*return*/];
                    }
                });
            });
        };
        return TelegramBotService_1;
    }());
    __setFunctionName(_classThis, "TelegramBotService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TelegramBotService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TelegramBotService = _classThis;
}();
exports.TelegramBotService = TelegramBotService;
