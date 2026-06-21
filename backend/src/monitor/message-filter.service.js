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
exports.MessageFilterService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var dispatcher_keywords_1 = require("./data/dispatcher-keywords");
var city_distances_1 = require("./data/city-distances");
var MessageFilterService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MessageFilterService = _classThis = /** @class */ (function () {
        function MessageFilterService_1(prisma, systemConfig, gateway, smsService, telegramSmsService) {
            var _this = this;
            this.prisma = prisma;
            this.systemConfig = systemConfig;
            this.gateway = gateway;
            this.smsService = smsService;
            this.telegramSmsService = telegramSmsService;
            this.logger = new common_1.Logger(MessageFilterService.name);
            // In-memory trackers
            this.userGroupTracker = new Map();
            this.userMessageTracker = new Map();
            this.phoneGroupTracker = new Map();
            // Rule 14: Soxta ko'p yo'nalish tracker
            // key = senderTelegramId, value = { routes: Set<"from→to">, froms: Set<from>, firstSeen }
            this.routeTracker = new Map();
            this.ROUTE_TRACKER_TTL = 24 * 60 * 60000; // 24 soat
            // Whitelist cache
            this.whitelistCache = null;
            this.whitelistCacheTime = 0;
            this.WHITELIST_CACHE_TTL = 60000; // 1 min
            // Blocked users in-memory cache (DB query kamaytirish uchun)
            this.blockedIdsCache = null;
            this.blockedPhonesCache = null;
            this.blockedCacheTime = 0;
            this.BLOCKED_CACHE_TTL = 60000; // 60 sek (10 sek juda tez — har xabarda DB query)
            this.TRACKER_TTL = 120000; // 2 min cleanup
            this.cleanupInterval = setInterval(function () { return _this.cleanupTrackers(); }, this.TRACKER_TTL);
        }
        MessageFilterService_1.prototype.onModuleDestroy = function () {
            clearInterval(this.cleanupInterval);
        };
        /**
         * Quick check: sender already blocked? (no full rule pipeline)
         * Used BEFORE dedup to catch manually blocked senders immediately.
         */
        MessageFilterService_1.prototype.isBlockedSender = function (telegramId, phone) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, blockedIds, blockedPhones;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getBlockedCache()];
                        case 1:
                            _a = _b.sent(), blockedIds = _a.blockedIds, blockedPhones = _a.blockedPhones;
                            if (telegramId && blockedIds.has(telegramId))
                                return [2 /*return*/, true];
                            if (phone && blockedPhones.has(phone))
                                return [2 /*return*/, true];
                            if (phone && blockedIds.has("phone_".concat(phone)))
                                return [2 /*return*/, true];
                            return [2 /*return*/, false];
                    }
                });
            });
        };
        /**
         * Main filter pipeline — 13 qoida
         */
        MessageFilterService_1.prototype.filterMessage = function (ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var messageText, sender, phone, text, textLower, whitelist, _a, blockedIds, blockedPhones, hashtagCount, spamKeywords, _i, spamKeywords_1, kw, dispatcherNoPattern, match, dispatcherEmojiPattern, match, invisibleChars, nameStr, _b, DISPATCHER_KEYWORDS_1, kw, exoticChars, rawFirstName, firstNameLower, fullNameLower, hasManName, _c, FEMALE_NAMES_1, name_1, mentions, emojiCount, emptyLines, userTracker, msgTracker, phoneTracker, phoneSuperTracker, cities, from, to, routeKey, now, tracker, routesArr, allFroms, allTos, uniqueFroms, uniqueTos, routesArr;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            messageText = ctx.messageText, sender = ctx.sender, phone = ctx.phone;
                            text = messageText;
                            textLower = text.toLowerCase();
                            return [4 /*yield*/, this.getWhitelist()];
                        case 1:
                            whitelist = _d.sent();
                            if (whitelist.has(sender.telegramId)) {
                                return [2 /*return*/, { blocked: false }];
                            }
                            if (phone && whitelist.has(phone)) {
                                return [2 /*return*/, { blocked: false }];
                            }
                            return [4 /*yield*/, this.getBlockedCache()];
                        case 2:
                            _a = _d.sent(), blockedIds = _a.blockedIds, blockedPhones = _a.blockedPhones;
                            if (sender.telegramId && blockedIds.has(sender.telegramId)) {
                                return [2 /*return*/, {
                                        blocked: true,
                                        reason: client_1.BlockReason.LONG_MESSAGE,
                                        ruleNumber: 0,
                                        description: "Avval bloklangan (ID cache)",
                                    }];
                            }
                            // Phone bo'yicha ham bloklangan bo'lishi mumkin (phone_+998... yoki to'g'ridan-to'g'ri)
                            if (phone && blockedPhones.has(phone)) {
                                return [2 /*return*/, {
                                        blocked: true,
                                        reason: client_1.BlockReason.LONG_MESSAGE,
                                        ruleNumber: 0,
                                        description: "Avval bloklangan (telefon cache)",
                                    }];
                            }
                            // Phone orqali bloklangan sender — telegramId `phone_+998...` bo'lishi mumkin
                            if (phone && blockedIds.has("phone_".concat(phone))) {
                                return [2 /*return*/, {
                                        blocked: true,
                                        reason: client_1.BlockReason.LONG_MESSAGE,
                                        ruleNumber: 0,
                                        description: "Avval bloklangan (phone->id cache)",
                                    }];
                            }
                            // senderTelegramId bo'sh bo'lsa, faqat telefon tekshirildi, qolgan qoidalar o'tkazilsin
                            if (!sender.telegramId) {
                                return [2 /*return*/, { blocked: false }];
                            }
                            hashtagCount = (text.match(/#\S+/g) || []).length;
                            if (hashtagCount >= 4) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 1, "Spam kontenti: ".concat(hashtagCount, " ta hashtag"))];
                            }
                            spamKeywords = [
                                // Vakansiya
                                'вакансия', 'vakansiya', 'ищу работу', 'ищу сотрудника',
                                'резюме', 'собеседование', 'оклад', 'зарплата',
                                'заработок', 'подработка', 'удалённ', 'удаленн', 'фриланс',
                                // Reklama/marketing
                                'авито', 'avito', 'продвижени', 'трафик',
                                'маркетинг', 'smm', 'таргет', 'арбитраж',
                                // Kripto/investitsiya
                                'криптовалют', 'crypto', 'bitcoin', 'биткоин',
                                'инвестиц', 'пассивный доход', 'mlm', 'сетевой',
                                // Qimor
                                'казино', 'casino', 'ставк', 'букмекер',
                                // Ta'lim spam
                                'обучение', 'тренинг', 'вебинар', 'марафон',
                                // App reklama / agregator
                                'agregator', 'агрегатор', 'ilovani yuklab', 'скачайте приложение',
                                'yuklab oling', 'скачать', 'скачайте',
                                'bonus', 'бонус', 'komissiya', 'комиссия', '0% komissiya', '0% комисси',
                                "ro'yxatdan o'ting", 'регистрируйтесь', 'зарегистрируйтесь',
                                'промокод', 'promokod', 'promo kod', 'referral', 'реферал',
                                'cashback', 'кэшбэк', 'кешбек',
                                // Kanalga obuna
                                'подписывайтесь', 'obuna bo\'ling', 'kanalga obuna',
                                'каналга обуна', 'подписка на канал',
                                // Dispatcher xabarlar — yuk emas, dispetcher izlash
                                'dispetcher kerak', 'dispetcher kk', 'диспетчер керак', 'диспетчер кк',
                                'диспатчер нужен', 'ищем диспетчера', 'нужен диспетчер',
                                'logist kerak', 'логист керак', 'логист нужен', 'ищем логиста',
                                'lagist no', 'logist no', 'lagis no', 'логист но', 'логист ном', 'логист tel',
                                'lagis kerakmas', 'lagist kerakmas', 'logist kerakmas',
                                'lagis kerak emas', 'lagist kerak emas', 'logist kerak emas',
                                'lagis kmas', 'lagist kmas', 'logist kmas',
                                'логист керакмас', 'логист керак эмас', 'логист не нужен',
                                'dispetcher kerakmas', 'dispechr kerakmas', 'диспетчер керакмас',
                                'dispetcher kerak emas', 'диспетчер керак эмас', 'диспетчер не нужен',
                                'ekspeditor kerak', 'экспедитор нужен', 'ищем экспедитора',
                                // Mashina sotish e'lonlari — yuk emas
                                'sotiladi', 'sotaman', 'sotamiz', 'sotuv',
                                'продается', 'продаю', 'продам', 'продаётся',
                                'сотилади', 'сотаман',
                            ];
                            for (_i = 0, spamKeywords_1 = spamKeywords; _i < spamKeywords_1.length; _i++) {
                                kw = spamKeywords_1[_i];
                                if (textLower.includes(kw)) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 1, "Spam kontenti: \"".concat(kw, "\" topildi"))];
                                }
                            }
                            dispatcherNoPattern = /(?:lagis[t]?|logist?|логист|dispechr?|dispetcher|диспетчер|экспедитор|ekspeditor)\s*(?:kerakmas|kerak\s*emas|kmas|керакмас|керак\s*эмас|не\s*нужен|no\b|kk\b)/i;
                            if (dispatcherNoPattern.test(text)) {
                                match = text.match(dispatcherNoPattern);
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 1, "Dispatcher reklama: \"".concat(match === null || match === void 0 ? void 0 : match[0], "\" topildi"))];
                            }
                            dispatcherEmojiPattern = /(?:lagis[t]?|logist?|log|лог(?:ист)?|disp(?:etcher|echr)?|дисп(?:етчер)?|экспед(?:итор)?|eksped(?:itor)?)\s*[❌🚫⛔🛑✖\u274C\u{1F6AB}\u26D4\u{1F6D1}]/iu;
                            if (dispatcherEmojiPattern.test(text)) {
                                match = text.match(dispatcherEmojiPattern);
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 1, "Dispatcher emoji: \"".concat(match === null || match === void 0 ? void 0 : match[0], "\" topildi"))];
                            }
                            invisibleChars = (text.match(/[\u1160\u3164\u200B\u200C\u200D\u2060\uFEFF\u00A0]/g) || []).length;
                            if (invisibleChars >= 3) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 1, "Spam formatlovchi: ".concat(invisibleChars, " ta yashirin belgi"))];
                            }
                            nameStr = [sender.firstName, sender.lastName, sender.username]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase();
                            for (_b = 0, DISPATCHER_KEYWORDS_1 = dispatcher_keywords_1.DISPATCHER_KEYWORDS; _b < DISPATCHER_KEYWORDS_1.length; _b++) {
                                kw = DISPATCHER_KEYWORDS_1[_b];
                                if (nameStr.includes(kw)) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.DISPATCHER_NAME, 2, "Dispatcher so'z: \"".concat(kw, "\" \u2014 ").concat(nameStr))];
                                }
                            }
                            exoticChars = nameStr.match(/[\u{10000}-\u{1FFFF}]/gu);
                            if (exoticChars && exoticChars.length >= 3) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.DISPATCHER_NAME, 2, "Nostandart Unicode nom: ".concat(exoticChars.length, " ta exotic belgi \u2014 ").concat(nameStr.substring(0, 50)))];
                            }
                            rawFirstName = (sender.firstName || '').toLowerCase().trim();
                            firstNameLower = rawFirstName
                                .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
                                .replace(/[^\p{L}\p{N}\s'-]/gu, '')
                                .trim();
                            fullNameLower = nameStr.toLowerCase();
                            if (/\b\w+(ova|eva|ovna|evna)\b/.test(fullNameLower) ||
                                /\b\w+(ова|ева|овна|евна)\b/.test(fullNameLower)) {
                                hasManName = ['murod', 'sardor', 'bahodir', 'jamshid', 'sherzod',
                                    'dilshod', 'farxod', 'baxodir', 'obid', 'mansur', 'rustam', 'alisher',
                                    'мурод', 'сардор', 'баходир', 'жамшид', 'шерзод', 'дилшод'].some(function (m) { return firstNameLower.startsWith(m); });
                                if (!hasManName) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.FEMALE_NAME, 3, "Ayol familiyasi (-ova/-eva): ".concat(nameStr.substring(0, 50)))];
                                }
                            }
                            for (_c = 0, FEMALE_NAMES_1 = dispatcher_keywords_1.FEMALE_NAMES; _c < FEMALE_NAMES_1.length; _c++) {
                                name_1 = FEMALE_NAMES_1[_c];
                                if (firstNameLower === name_1 || firstNameLower.startsWith(name_1)) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.FEMALE_NAME, 3, "Ayol ismi: \"".concat(name_1, "\" \u2014 ").concat(firstNameLower))];
                                }
                            }
                            // ===== RULE 4: 30+ takrorlanuvchi belgi =====
                            if (/(.)\1{29,}/.test(text)) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.REPEATED_CHARS, 4, 'Takrorlanuvchi belgilar')];
                            }
                            mentions = text.match(/@\w+/g);
                            if (mentions && mentions.length >= 2) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.MULTIPLE_MENTIONS, 6, "".concat(mentions.length, " ta mention"))];
                            }
                            // ===== RULE 7: 200+ belgi uzunlik =====
                            if (text.length > 200) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.LONG_MESSAGE, 7, "Xabar uzunligi: ".concat(text.length))];
                            }
                            emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu) || []).length;
                            if (emojiCount >= 3) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.EXCESSIVE_EMOJI, 8, "".concat(emojiCount, " ta emoji"))];
                            }
                            emptyLines = (text.match(/\n\s*\n/g) || []).length;
                            if (emptyLines >= 3) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.EXCESSIVE_NEWLINES, 9, "".concat(emptyLines, " ta bo'sh qator"))];
                            }
                            userTracker = this.trackUserGroup(sender.telegramId, ctx.groupTelegramId);
                            if (userTracker.groups.size >= 15) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.USER_MULTI_GROUP, 10, "".concat(userTracker.groups.size, " guruhda faol (5 min)"))];
                            }
                            msgTracker = this.trackUserMessage(sender.telegramId);
                            if (msgTracker.count >= 10) {
                                return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.USER_SPAM_RATE, 11, "".concat(msgTracker.count, " ta xabar (5 min)"))];
                            }
                            // ===== RULE 12: Telefon 15+ guruhda (10 min) =====
                            if (phone) {
                                phoneTracker = this.trackPhoneGroup(phone, ctx.groupTelegramId, 10);
                                if (phoneTracker.groups.size >= 15) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.PHONE_MULTI_GROUP, 12, "Telefon ".concat(phone, " \u2014 ").concat(phoneTracker.groups.size, " guruhda (10 min)"))];
                                }
                                phoneSuperTracker = this.trackPhoneGroup("super_".concat(phone), ctx.groupTelegramId, 30);
                                if (phoneSuperTracker.groups.size >= 20) {
                                    return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.PHONE_SUPER_SPAM, 13, "SUPER BLOCK: Telefon ".concat(phone, " \u2014 ").concat(phoneSuperTracker.groups.size, " guruhda (30 min)"))];
                                }
                            }
                            // ===== RULE 14: Soxta ko'p yo'nalish (1 kun ichida A ham B ham farqli) =====
                            // Agar sender bir kunda 2+ yo'nalishda e'lon bersa va A nuqtalar HAM farqli bo'lsa → bloklash
                            // A nuqta bir xil bo'lsa → bloklama (bitta tashkilot ko'p shaharga yuk yuborishi mumkin)
                            if (sender.telegramId) {
                                cities = (0, city_distances_1.findCitiesInText)(text);
                                if (cities.length >= 2) {
                                    from = cities[0].name;
                                    to = cities[1].name;
                                    routeKey = "".concat(from, "\u2192").concat(to);
                                    now = Date.now();
                                    tracker = this.routeTracker.get(sender.telegramId);
                                    if (!tracker || (now - tracker.firstSeen) > this.ROUTE_TRACKER_TTL) {
                                        tracker = { routes: new Set(), froms: new Set(), firstSeen: now };
                                        this.routeTracker.set(sender.telegramId, tracker);
                                    }
                                    tracker.routes.add(routeKey);
                                    tracker.froms.add(from);
                                    // Bloklash sharti: 2+ yo'nalish VA 2+ xil A nuqta (barcha A nuqtalar farqli)
                                    // Ya'ni hech bir A nuqta takrorlanmagan — demak bu har xil joylardan yuk yuborayotgan odam
                                    if (tracker.routes.size >= 2 && tracker.froms.size >= 2) {
                                        routesArr = Array.from(tracker.routes);
                                        allFroms = routesArr.map(function (r) { return r.split('→')[0]; });
                                        allTos = routesArr.map(function (r) { return r.split('→')[1]; });
                                        uniqueFroms = new Set(allFroms);
                                        uniqueTos = new Set(allTos);
                                        // A nuqtalar 2+ xil VA B nuqtalar 2+ xil → bloklash
                                        if (uniqueFroms.size >= 2 && uniqueTos.size >= 2) {
                                            return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.FAKE_MULTI_ROUTE, 14, "Soxta ko'p yo'nalish: ".concat(routesArr.join(', '), " (A va B nuqtalar farqli)"))];
                                        }
                                    }
                                    // ===== RULE 15: 6+ butunlay boshqa yo'nalish (dispetcher soxtaligi) =====
                                    // Basada 6 ta xar xil yo'nalishda e'lon = aniq soxta dispetcher
                                    if (tracker.routes.size >= 6) {
                                        routesArr = Array.from(tracker.routes);
                                        return [2 /*return*/, this.persistBlock(ctx, client_1.BlockReason.FAKE_MULTI_ROUTE, 15, "Dispetcher soxtaligi: ".concat(tracker.routes.size, " xil yo'nalish (").concat(routesArr.slice(0, 4).join(', '), "...)"))];
                                    }
                                }
                            }
                            // Hammasi o'tdi — track qilish
                            return [2 /*return*/, { blocked: false }];
                    }
                });
            });
        };
        /**
         * Bloklashni DB ga saqlash va WS orqali emit
         */
        MessageFilterService_1.prototype.persistBlock = function (ctx, reason, ruleNumber, description) {
            return __awaiter(this, void 0, void 0, function () {
                var sanitize, safeText, safeGroupTitle, safeSenderName, safeSenderUsername, safePhone, safeTelegramId, safeGroupTelegramId, blocked, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            sanitize = function (s) { return s
                                .replace(/\x00/g, '') // null bytes
                                .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control characters
                                .replace(/\\x[0-9a-fA-F]*/g, '') // any hex escape sequences
                                .replace(/\\u[0-9a-fA-F]*/g, '') // unicode escapes
                                .replace(/\\/g, '/'); } // remaining backslashes
                            ;
                            safeText = sanitize(ctx.messageText.substring(0, 500));
                            safeGroupTitle = sanitize(ctx.groupTitle || '');
                            safeSenderName = sanitize([ctx.sender.firstName, ctx.sender.lastName].filter(Boolean).join(' ') || '');
                            safeSenderUsername = ctx.sender.username ? sanitize(ctx.sender.username) : null;
                            safePhone = ctx.phone ? sanitize(ctx.phone) : null;
                            safeTelegramId = sanitize(ctx.sender.telegramId || '');
                            safeGroupTelegramId = sanitize(ctx.groupTelegramId || '');
                            return [4 /*yield*/, this.prisma.blockedUser.create({
                                    data: {
                                        userId: ctx.userId,
                                        senderTelegramId: safeTelegramId,
                                        senderName: safeSenderName || null,
                                        senderUsername: safeSenderUsername,
                                        reason: reason,
                                        ruleNumber: ruleNumber,
                                        messageText: safeText,
                                        groupTitle: safeGroupTitle,
                                        groupTelegramId: safeGroupTelegramId,
                                        phone: safePhone,
                                        monitorSessionId: ctx.monitorSessionId,
                                        isActive: true,
                                    },
                                })];
                        case 1:
                            blocked = _a.sent();
                            // Update monitor session stats
                            return [4 /*yield*/, this.prisma.monitorSession.update({
                                    where: { id: ctx.monitorSessionId },
                                    data: { blocksFound: { increment: 1 } },
                                }).catch(function () { })];
                        case 2:
                            // Update monitor session stats
                            _a.sent();
                            // WS emit
                            this.gateway.sendToUser(ctx.userId, 'block:new', {
                                id: blocked.id,
                                senderTelegramId: ctx.sender.telegramId,
                                senderName: blocked.senderName,
                                reason: reason,
                                ruleNumber: ruleNumber,
                                groupTitle: ctx.groupTitle,
                                phone: ctx.phone,
                                description: description,
                                createdAt: blocked.createdAt,
                            });
                            // Cache invalidate — yangi blok qo'shildi
                            this.invalidateBlockedCache();
                            // Auto-SMS: bloklangan foydalanuvchiga avtomatik SMS
                            this.smsService.onNewBlockedUser({
                                phone: ctx.phone,
                                senderName: blocked.senderName,
                                reason: String(reason),
                            }).catch(function () { });
                            // Auto-TG SMS: Telegram orqali DM yuborish
                            this.telegramSmsService.onNewBlockedUser({
                                senderTelegramId: ctx.sender.telegramId,
                                senderName: blocked.senderName,
                                senderUsername: ctx.sender.username,
                                phone: ctx.phone,
                                reason: String(reason),
                                monitorSessionId: ctx.monitorSessionId,
                                sourceGroupId: ctx.groupTelegramId,
                                sourceMessageId: ctx.messageId,
                                senderAccessHash: ctx.senderAccessHash,
                            }).catch(function () { });
                            this.logger.log("BLOCKED [Rule ".concat(ruleNumber, "] ").concat(reason, ": ").concat(description, " (user: ").concat(ctx.sender.telegramId, ")"));
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error("Block saqlashda xatolik: ".concat(error_1.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/, { blocked: true, reason: reason, ruleNumber: ruleNumber, description: description }];
                    }
                });
            });
        };
        // ============================================================
        // IN-MEMORY TRACKERS
        // ============================================================
        MessageFilterService_1.prototype.trackUserGroup = function (telegramId, groupId) {
            var key = "ug_".concat(telegramId);
            var entry = this.userGroupTracker.get(key);
            var now = Date.now();
            if (!entry || now - entry.firstSeen > 5 * 60000) {
                entry = { groups: new Set(), count: 0, firstSeen: now };
                this.userGroupTracker.set(key, entry);
            }
            entry.groups.add(groupId);
            entry.count++;
            return entry;
        };
        MessageFilterService_1.prototype.trackUserMessage = function (telegramId) {
            var key = "um_".concat(telegramId);
            var entry = this.userMessageTracker.get(key);
            var now = Date.now();
            if (!entry || now - entry.firstSeen > 5 * 60000) {
                entry = { groups: new Set(), count: 0, firstSeen: now };
                this.userMessageTracker.set(key, entry);
            }
            entry.count++;
            return entry;
        };
        MessageFilterService_1.prototype.trackPhoneGroup = function (phone, groupId, minutesTtl) {
            var key = "pg_".concat(phone);
            var entry = this.phoneGroupTracker.get(key);
            var now = Date.now();
            if (!entry || now - entry.firstSeen > minutesTtl * 60000) {
                entry = { groups: new Set(), count: 0, firstSeen: now };
                this.phoneGroupTracker.set(key, entry);
            }
            entry.groups.add(groupId);
            entry.count++;
            return entry;
        };
        MessageFilterService_1.prototype.cleanupTrackers = function () {
            var now = Date.now();
            var cleanMap = function (map, ttlMs) {
                for (var _i = 0, map_1 = map; _i < map_1.length; _i++) {
                    var _a = map_1[_i], key = _a[0], entry = _a[1];
                    if (now - entry.firstSeen > ttlMs) {
                        map.delete(key);
                    }
                }
            };
            cleanMap(this.userGroupTracker, 5 * 60000);
            cleanMap(this.userMessageTracker, 5 * 60000);
            cleanMap(this.phoneGroupTracker, 30 * 60000);
            // Route tracker — 24 soat TTL
            for (var _i = 0, _a = this.routeTracker; _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], entry = _b[1];
                if (now - entry.firstSeen > this.ROUTE_TRACKER_TTL) {
                    this.routeTracker.delete(key);
                }
            }
        };
        // ============================================================
        // WHITELIST
        // ============================================================
        MessageFilterService_1.prototype.getWhitelist = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, raw, list, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            now = Date.now();
                            if (this.whitelistCache && now - this.whitelistCacheTime < this.WHITELIST_CACHE_TTL) {
                                return [2 /*return*/, this.whitelistCache];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.systemConfig.get('blocked_users_whitelist')];
                        case 2:
                            raw = _b.sent();
                            if (raw) {
                                list = JSON.parse(raw);
                                this.whitelistCache = new Set(list);
                            }
                            else {
                                this.whitelistCache = new Set();
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            this.whitelistCache = new Set();
                            return [3 /*break*/, 4];
                        case 4:
                            this.whitelistCacheTime = now;
                            return [2 /*return*/, this.whitelistCache];
                    }
                });
            });
        };
        /**
         * Whitelist invalidate (yangilanganda chaqiriladi)
         */
        MessageFilterService_1.prototype.invalidateWhitelistCache = function () {
            this.whitelistCache = null;
            this.whitelistCacheTime = 0;
        };
        /**
         * Blocked users in-memory cache — DB query o'rniga Set<string> tekshiruv
         */
        MessageFilterService_1.prototype.getBlockedCache = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, blocked, _i, blocked_1, b, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            now = Date.now();
                            if (this.blockedIdsCache && this.blockedPhonesCache && now - this.blockedCacheTime < this.BLOCKED_CACHE_TTL) {
                                return [2 /*return*/, { blockedIds: this.blockedIdsCache, blockedPhones: this.blockedPhonesCache }];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.prisma.blockedUser.findMany({
                                    where: { isActive: true },
                                    select: { senderTelegramId: true, phone: true },
                                })];
                        case 2:
                            blocked = _b.sent();
                            this.blockedIdsCache = new Set();
                            this.blockedPhonesCache = new Set();
                            for (_i = 0, blocked_1 = blocked; _i < blocked_1.length; _i++) {
                                b = blocked_1[_i];
                                if (b.senderTelegramId)
                                    this.blockedIdsCache.add(b.senderTelegramId);
                                if (b.phone)
                                    this.blockedPhonesCache.add(b.phone);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            this.blockedIdsCache = new Set();
                            this.blockedPhonesCache = new Set();
                            return [3 /*break*/, 4];
                        case 4:
                            this.blockedCacheTime = now;
                            return [2 /*return*/, { blockedIds: this.blockedIdsCache, blockedPhones: this.blockedPhonesCache }];
                    }
                });
            });
        };
        /**
         * Blocked cache invalidate (yangi blok yoki unblock qilinganda)
         */
        MessageFilterService_1.prototype.invalidateBlockedCache = function () {
            this.blockedIdsCache = null;
            this.blockedPhonesCache = null;
            this.blockedCacheTime = 0;
        };
        // ============================================================
        // BLOCKED USERS CRUD (Controller dan chaqiriladi)
        // ============================================================
        MessageFilterService_1.prototype.getBlockedUsers = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, _a, page, _b, limit, search, reason, skip, where, _c, items, total;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            userId = params.userId, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 20 : _b, search = params.search, reason = params.reason;
                            skip = (page - 1) * limit;
                            where = { isActive: true };
                            if (userId)
                                where.userId = userId;
                            if (reason)
                                where.reason = reason;
                            if (search) {
                                where.OR = [
                                    { senderName: { contains: search, mode: 'insensitive' } },
                                    { senderUsername: { contains: search, mode: 'insensitive' } },
                                    { phone: { contains: search } },
                                    { senderTelegramId: { contains: search } },
                                    { groupTitle: { contains: search, mode: 'insensitive' } },
                                ];
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.blockedUser.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.blockedUser.count({ where: where }),
                                ])];
                        case 1:
                            _c = _d.sent(), items = _c[0], total = _c[1];
                            return [2 /*return*/, { items: items, total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) }];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.getBlockStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var baseWhere, _a, total, byReason, today, thisWeek, reasonStats;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            baseWhere = { isActive: true };
                            if (userId)
                                baseWhere.userId = userId;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.blockedUser.count({ where: baseWhere }),
                                    this.prisma.blockedUser.groupBy({
                                        by: ['reason'],
                                        where: baseWhere,
                                        _count: true,
                                    }),
                                    this.prisma.blockedUser.count({
                                        where: __assign(__assign({}, baseWhere), { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
                                    }),
                                    this.prisma.blockedUser.count({
                                        where: __assign(__assign({}, baseWhere), { createdAt: {
                                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                            } }),
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), total = _a[0], byReason = _a[1], today = _a[2], thisWeek = _a[3];
                            reasonStats = {};
                            byReason.forEach(function (r) {
                                reasonStats[r.reason] = r._count;
                            });
                            return [2 /*return*/, { total: total, today: today, thisWeek: thisWeek, byReason: reasonStats }];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.manualBlock = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var telegramId, phone, blockWhere, existing, sanitize, blocked;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            telegramId = ((_a = data.senderTelegramId) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                            phone = ((_b = data.phone) === null || _b === void 0 ? void 0 : _b.trim()) || null;
                            if (!telegramId && !phone) {
                                throw new Error('Bloklash uchun Telegram ID yoki telefon raqam kerak');
                            }
                            blockWhere = [];
                            if (telegramId)
                                blockWhere.push({ senderTelegramId: telegramId, isActive: true });
                            if (phone)
                                blockWhere.push({ phone: phone, isActive: true });
                            return [4 /*yield*/, this.prisma.blockedUser.findFirst({
                                    where: { OR: blockWhere },
                                })];
                        case 1:
                            existing = _c.sent();
                            if (existing) {
                                this.logger.log("MANUAL BLOCK: already blocked \u2014 ".concat(telegramId || phone));
                                return [2 /*return*/, existing];
                            }
                            sanitize = function (s) { return s
                                .replace(/\x00/g, '')
                                .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                                .replace(/\\x[0-9a-fA-F]*/g, '')
                                .replace(/\\u[0-9a-fA-F]*/g, '')
                                .replace(/\\/g, ''); };
                            return [4 /*yield*/, this.prisma.blockedUser.create({
                                    data: {
                                        userId: data.userId,
                                        senderTelegramId: sanitize(telegramId || "phone_".concat(phone)),
                                        senderName: data.senderName ? sanitize(data.senderName) : null,
                                        senderUsername: data.senderUsername ? sanitize(data.senderUsername) : null,
                                        reason: 'MANUAL_BLOCK',
                                        ruleNumber: 0,
                                        messageText: sanitize(data.messageText.substring(0, 500)),
                                        groupTitle: sanitize(data.groupTitle),
                                        groupTelegramId: sanitize(data.groupTelegramId || ''),
                                        phone: phone ? sanitize(phone) : null,
                                        isActive: true,
                                    },
                                })];
                        case 2:
                            blocked = _c.sent();
                            // Cache invalidate
                            this.invalidateBlockedCache();
                            // Auto-SMS: bloklangan foydalanuvchiga avtomatik SMS
                            this.smsService.onNewBlockedUser({
                                phone: phone,
                                senderName: blocked.senderName,
                                reason: 'MANUAL_BLOCK',
                            }).catch(function () { });
                            // Auto-TG SMS: Telegram orqali DM yuborish
                            if (telegramId && !telegramId.startsWith('phone_')) {
                                this.telegramSmsService.onNewBlockedUser({
                                    senderTelegramId: telegramId,
                                    senderName: data.senderName,
                                    senderUsername: data.senderUsername,
                                    phone: phone,
                                    reason: 'MANUAL_BLOCK',
                                }).catch(function () { });
                            }
                            this.logger.log("MANUAL BLOCK: ".concat(data.senderName || telegramId || phone, " (phone: ").concat(phone || 'no phone', ", id: ").concat(telegramId || 'no id', ")"));
                            // WS emit
                            try {
                                this.gateway.sendToUser(data.userId, 'block:new', {
                                    id: blocked.id,
                                    senderTelegramId: blocked.senderTelegramId,
                                    senderName: blocked.senderName,
                                    reason: 'MANUAL_BLOCK',
                                    ruleNumber: 0,
                                    phone: phone,
                                });
                            }
                            catch (_d) { }
                            return [2 /*return*/, blocked];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.unblockUser = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.blockedUser.update({
                                where: { id: id },
                                data: { isActive: false, unblockedAt: new Date() },
                            })];
                        case 1:
                            result = _a.sent();
                            this.invalidateBlockedCache();
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.getWhitelistEntries = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var raw;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.systemConfig.get('blocked_users_whitelist')];
                        case 1:
                            raw = _a.sent();
                            if (!raw)
                                return [2 /*return*/, []];
                            try {
                                return [2 /*return*/, JSON.parse(raw)];
                            }
                            catch (_b) {
                                return [2 /*return*/, []];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.addToWhitelist = function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                var list;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getWhitelistEntries('')];
                        case 1:
                            list = _a.sent();
                            if (!!list.includes(entry)) return [3 /*break*/, 3];
                            list.push(entry);
                            return [4 /*yield*/, this.systemConfig.set('blocked_users_whitelist', JSON.stringify(list), 'JSON', 'Bloklash oq ro\'yxati')];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            this.invalidateWhitelistCache();
                            return [2 /*return*/, list];
                    }
                });
            });
        };
        MessageFilterService_1.prototype.removeFromWhitelist = function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                var list, filtered;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getWhitelistEntries('')];
                        case 1:
                            list = _a.sent();
                            filtered = list.filter(function (e) { return e !== entry; });
                            return [4 /*yield*/, this.systemConfig.set('blocked_users_whitelist', JSON.stringify(filtered), 'JSON', 'Bloklash oq ro\'yxati')];
                        case 2:
                            _a.sent();
                            this.invalidateWhitelistCache();
                            return [2 /*return*/, filtered];
                    }
                });
            });
        };
        return MessageFilterService_1;
    }());
    __setFunctionName(_classThis, "MessageFilterService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MessageFilterService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MessageFilterService = _classThis;
}();
exports.MessageFilterService = MessageFilterService;
