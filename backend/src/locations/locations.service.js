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
exports.LocationsService = void 0;
var common_1 = require("@nestjs/common");
// Farg'ona vodiysi viloyatlari — Kamchik dovoni orqali yo'naltirish uchun
var FERGANA_VALLEY = ["Farg'ona viloyati", 'Andijon viloyati', 'Namangan viloyati'];
// Kamchik dovoni waypoint (M39 trassa)
var KAMCHIK_PASS = { lat: 41.02, lng: 70.10 };
var LocationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LocationsService = _classThis = /** @class */ (function () {
        function LocationsService_1(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
            this.logger = new common_1.Logger(LocationsService.name);
        }
        // ==========================================
        // SEARCH
        // ==========================================
        LocationsService_1.prototype.search = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var normalized;
                return __generator(this, function (_a) {
                    normalized = this.normalize(query);
                    return [2 /*return*/, this.prisma.location.findMany({
                            where: {
                                OR: [
                                    { name: { contains: query, mode: 'insensitive' } },
                                    { keywords: { contains: normalized, mode: 'insensitive' } },
                                ],
                            },
                            take: 15,
                            orderBy: [{ type: 'asc' }, { name: 'asc' }],
                        })];
                });
            });
        };
        LocationsService_1.prototype.findAll = function (region) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.location.findMany({
                            where: region ? { region: { contains: region, mode: 'insensitive' } } : undefined,
                            orderBy: [{ region: 'asc' }, { type: 'asc' }, { name: 'asc' }],
                        })];
                });
            });
        };
        LocationsService_1.prototype.create = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var keywords;
                return __generator(this, function (_a) {
                    keywords = this.autoGenerateKeywords(data.name);
                    return [2 /*return*/, this.prisma.location.create({
                            data: {
                                name: data.name,
                                region: data.region,
                                type: data.type || 'CITY',
                                lat: data.lat,
                                lng: data.lng,
                                keywords: keywords,
                            },
                        })];
                });
            });
        };
        LocationsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.location.delete({ where: { id: id } })];
                });
            });
        };
        // ==========================================
        // FUZZY MATCHING — bot dan xato kiritilganda
        // ==========================================
        LocationsService_1.prototype.matchLocation = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var trimmed, normalized, exact, keywordMatch, _i, keywordMatch_1, loc, kws, startsWith, contains, prefix, partial, best, lev;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            trimmed = input.trim();
                            if (!trimmed)
                                return [2 /*return*/, null];
                            normalized = this.normalize(trimmed);
                            return [4 /*yield*/, this.prisma.location.findFirst({
                                    where: { name: { equals: trimmed, mode: 'insensitive' } },
                                    select: { name: true, region: true },
                                })];
                        case 1:
                            exact = _a.sent();
                            if (exact)
                                return [2 /*return*/, exact];
                            return [4 /*yield*/, this.prisma.location.findMany({
                                    where: {
                                        keywords: { contains: normalized, mode: 'insensitive' },
                                    },
                                    select: { name: true, region: true, keywords: true },
                                    take: 10,
                                })];
                        case 2:
                            keywordMatch = _a.sent();
                            if (keywordMatch.length > 0) {
                                // Eng aniq matchni topish — keyword ichida to'liq so'z borligini tekshirish
                                for (_i = 0, keywordMatch_1 = keywordMatch; _i < keywordMatch_1.length; _i++) {
                                    loc = keywordMatch_1[_i];
                                    kws = (loc.keywords || '').toLowerCase().split(',').map(function (k) { return k.trim(); });
                                    if (kws.includes(normalized))
                                        return [2 /*return*/, { name: loc.name, region: loc.region }];
                                }
                                // Partial match — eng qisqa nomli
                                return [2 /*return*/, { name: keywordMatch[0].name, region: keywordMatch[0].region }];
                            }
                            return [4 /*yield*/, this.prisma.location.findFirst({
                                    where: { name: { startsWith: trimmed, mode: 'insensitive' } },
                                    select: { name: true, region: true },
                                })];
                        case 3:
                            startsWith = _a.sent();
                            if (startsWith)
                                return [2 /*return*/, startsWith];
                            return [4 /*yield*/, this.prisma.location.findMany({
                                    where: { name: { contains: trimmed, mode: 'insensitive' } },
                                    select: { name: true, region: true },
                                    take: 5,
                                })];
                        case 4:
                            contains = _a.sent();
                            if (contains.length > 0) {
                                return [2 /*return*/, contains.sort(function (a, b) { return a.name.length - b.name.length; })[0]];
                            }
                            if (!(normalized.length >= 3)) return [3 /*break*/, 6];
                            prefix = normalized.substring(0, 3);
                            return [4 /*yield*/, this.prisma.location.findMany({
                                    where: {
                                        OR: [
                                            { name: { startsWith: prefix, mode: 'insensitive' } },
                                            { keywords: { contains: prefix, mode: 'insensitive' } },
                                        ],
                                    },
                                    select: { name: true, region: true },
                                    take: 10,
                                })];
                        case 5:
                            partial = _a.sent();
                            if (partial.length > 0) {
                                best = partial.sort(function (a, b) {
                                    return _this.levenshtein(_this.normalize(a.name), normalized) -
                                        _this.levenshtein(_this.normalize(b.name), normalized);
                                })[0];
                                lev = this.levenshtein(this.normalize(best.name), normalized);
                                if (lev <= Math.max(2, Math.floor(normalized.length * 0.4))) {
                                    return [2 /*return*/, best];
                                }
                            }
                            _a.label = 6;
                        case 6: return [2 /*return*/, null];
                    }
                });
            });
        };
        // ==========================================
        // OSRM — aniq yo'l masofasi (O'zbekiston ichida)
        // ==========================================
        LocationsService_1.prototype.calculateDistance = function (fromName, toName) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, fromLoc, toLoc, fromInFergana, toInFergana, url, response, data, distanceKm, result, err_1;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "dist:".concat(fromName.toLowerCase(), ":").concat(toName.toLowerCase());
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 1:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.location.findFirst({
                                        where: { name: { equals: fromName, mode: 'insensitive' } },
                                    }),
                                    this.prisma.location.findFirst({
                                        where: { name: { equals: toName, mode: 'insensitive' } },
                                    }),
                                ])];
                        case 2:
                            _a = _c.sent(), fromLoc = _a[0], toLoc = _a[1];
                            if (!(fromLoc === null || fromLoc === void 0 ? void 0 : fromLoc.lat) || !(fromLoc === null || fromLoc === void 0 ? void 0 : fromLoc.lng) || !(toLoc === null || toLoc === void 0 ? void 0 : toLoc.lat) || !(toLoc === null || toLoc === void 0 ? void 0 : toLoc.lng)) {
                                return [2 /*return*/, { distance: null, message: 'Lokatsiya koordinatalari topilmadi' }];
                            }
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 8, , 9]);
                            fromInFergana = FERGANA_VALLEY.includes(fromLoc.region);
                            toInFergana = FERGANA_VALLEY.includes(toLoc.region);
                            url = void 0;
                            if (fromInFergana !== toInFergana) {
                                // Bir tomon vodiyda, bir tomon tashqarida — Kamchik orqali
                                url = "https://router.project-osrm.org/route/v1/driving/".concat(fromLoc.lng, ",").concat(fromLoc.lat, ";").concat(KAMCHIK_PASS.lng, ",").concat(KAMCHIK_PASS.lat, ";").concat(toLoc.lng, ",").concat(toLoc.lat, "?overview=false");
                            }
                            else {
                                url = "https://router.project-osrm.org/route/v1/driving/".concat(fromLoc.lng, ",").concat(fromLoc.lat, ";").concat(toLoc.lng, ",").concat(toLoc.lat, "?overview=false");
                            }
                            return [4 /*yield*/, fetch(url, { signal: AbortSignal.timeout(8000) })];
                        case 4:
                            response = _c.sent();
                            return [4 /*yield*/, response.json()];
                        case 5:
                            data = _c.sent();
                            if (!(data.code === 'Ok' && ((_b = data.routes) === null || _b === void 0 ? void 0 : _b[0]))) return [3 /*break*/, 7];
                            distanceKm = Math.round(data.routes[0].distance / 1000);
                            result = {
                                distance: distanceKm,
                                from: fromLoc.name,
                                to: toLoc.name,
                                fromRegion: fromLoc.region,
                                toRegion: toLoc.region,
                            };
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 86400)];
                        case 6:
                            _c.sent();
                            return [2 /*return*/, result];
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            err_1 = _c.sent();
                            this.logger.warn("OSRM xatolik: ".concat(err_1));
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, { distance: null, message: 'Masofani hisoblashda xatolik' }];
                    }
                });
            });
        };
        // ==========================================
        // HELPERS
        // ==========================================
        LocationsService_1.prototype.normalize = function (text) {
            return text
                .toLowerCase()
                .replace(/[''`ʻʼ]/g, '')
                .replace(/[_\-\s]+/g, '')
                .replace(/ў/g, 'o')
                .replace(/қ/g, 'q')
                .replace(/ғ/g, 'g')
                .replace(/ҳ/g, 'h')
                .replace(/ш/g, 'sh')
                .replace(/ч/g, 'ch')
                .trim();
        };
        LocationsService_1.prototype.levenshtein = function (a, b) {
            var m = a.length;
            var n = b.length;
            var dp = Array.from({ length: m + 1 }, function () { return Array(n + 1).fill(0); });
            for (var i = 0; i <= m; i++)
                dp[i][0] = i;
            for (var j = 0; j <= n; j++)
                dp[0][j] = j;
            for (var i = 1; i <= m; i++) {
                for (var j = 1; j <= n; j++) {
                    dp[i][j] = a[i - 1] === b[j - 1]
                        ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                }
            }
            return dp[m][n];
        };
        LocationsService_1.prototype.autoGenerateKeywords = function (name) {
            var _a;
            var kws = new Set();
            var lower = name.toLowerCase();
            var noApostrophe = lower.replace(/[''`ʻʼ]/g, '');
            var noSpace = lower.replace(/\s+/g, '');
            var clean = noApostrophe.replace(/\s+/g, '');
            // 1. Asl nom variantlari
            kws.add(lower);
            kws.add(noApostrophe);
            kws.add(noSpace);
            kws.add(clean);
            // 2. Prefikslar (3,4,5,6 harf)
            for (var i = 3; i <= Math.min(6, clean.length); i++) {
                kws.add(clean.substring(0, i));
                kws.add(noApostrophe.substring(0, i));
            }
            // 3. O'zbek → Rus fonetik almashtirishlar
            var cyrillicMap = [
                [/sh/g, 'ш'], [/ch/g, 'ч'], [/yo/g, 'ё'], [/ya/g, 'я'],
                [/yu/g, 'ю'], [/ye/g, 'е'], [/ts/g, 'ц'], [/ng/g, 'нг'],
            ];
            var charMap = {
                a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ж',
                k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с',
                t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з',
            };
            var cyrillic = clean;
            for (var _i = 0, cyrillicMap_1 = cyrillicMap; _i < cyrillicMap_1.length; _i++) {
                var _b = cyrillicMap_1[_i], rx = _b[0], rep = _b[1];
                cyrillic = cyrillic.replace(rx, rep);
            }
            cyrillic = cyrillic.split('').map(function (c) { return charMap[c] || c; }).join('');
            if (cyrillic !== clean)
                kws.add(cyrillic);
            // 4. Fonetik almashtirish variantlari (o'zbek xatolar)
            var swaps = [
                ["o'", 'o'], ["o'", 'u'], ["o'", 'ў'],
                ["g'", 'g'], ["g'", 'ғ'], ["g'", 'gh'],
                ['q', 'k'], ['q', 'қ'],
                ['x', 'h'], ['x', 'kh'], ['x', 'х'],
                ['sh', 's'], ['sh', 'ш'],
                ['ch', 'c'], ['ch', 'ч'],
                ['j', 'dj'], ['j', 'zh'], ['j', 'ж'],
                ['yo', 'yu'], ['yo', 'ё'],
                ['e', 'э'], ['i', 'iy'],
                ['t', 'd'], ['d', 't'], // oxirgi harf xatolari
                ['k', 'g'], ['g', 'k'],
                ['n', 'm'], // oxirgi harf xatolari
                ['b', 'p'], ['p', 'b'],
            ];
            for (var _c = 0, swaps_1 = swaps; _c < swaps_1.length; _c++) {
                var _d = swaps_1[_c], from = _d[0], to = _d[1];
                if (clean.includes(from)) {
                    kws.add(clean.replace(from, to));
                    kws.add(clean.replace(new RegExp(from, 'g'), to));
                }
            }
            // 5. Oxirgi harfni o'zgartirish xatolari
            if (clean.length >= 4) {
                var base = clean.slice(0, -1);
                for (var _e = 0, _f = ['', 'a', 'o', 'i', 'e', 'n', 'd', 't', 'k', 'q']; _e < _f.length; _e++) {
                    var end = _f[_e];
                    kws.add(base + end);
                }
            }
            // 6. Harf tashlab ketish (har bir pozitsiyadan 1 harf)
            if (clean.length >= 5) {
                for (var i = 1; i < clean.length - 1; i++) {
                    kws.add(clean.slice(0, i) + clean.slice(i + 1));
                }
            }
            // 7. Qo'shni harflar almashishi (typo)
            if (clean.length >= 4) {
                for (var i = 0; i < clean.length - 1; i++) {
                    var arr = clean.split('');
                    _a = [arr[i + 1], arr[i]], arr[i] = _a[0], arr[i + 1] = _a[1];
                    kws.add(arr.join(''));
                }
            }
            // 8. Harf ikkilanishi
            if (clean.length >= 4) {
                for (var i = 0; i < clean.length; i++) {
                    kws.add(clean.slice(0, i + 1) + clean[i] + clean.slice(i + 1));
                }
            }
            // 9. "tumani" qo'shimchasi bilan/siz
            if (clean.endsWith('tumani')) {
                kws.add(clean.replace('tumani', '').trim());
                kws.add(clean.replace('tumani', 'tuman'));
                kws.add(clean.replace('tumani', 't'));
            }
            else {
                kws.add(clean + 'tumani');
                kws.add(clean + 'tuman');
            }
            // 10. "shahar" qo'shimchasi
            if (!clean.includes('tumani') && !clean.includes('viloyat')) {
                kws.add(clean + 'shahar');
                kws.add(clean + 'sh');
                kws.add(clean + 'shahari');
            }
            // 11. International variantlar (umumiy)
            var intlSwaps = [
                ['q', 'k'], ['x', 'kh'], ["g'", 'gh'], ["o'", 'u'],
                ['sh', 'sh'], ['j', 'dzh'], ['tosh', 'tash'], ['sam', 'sam'],
            ];
            var intl = noApostrophe;
            for (var _g = 0, intlSwaps_1 = intlSwaps; _g < intlSwaps_1.length; _g++) {
                var _h = intlSwaps_1[_g], f = _h[0], t = _h[1];
                if (intl.includes(f))
                    intl = intl.replace(f, t);
            }
            if (intl !== noApostrophe)
                kws.add(intl);
            // 12. Unli harfsiz (qisqa yozish)
            var noVowels = clean.replace(/[aeiou]/g, '');
            if (noVowels.length >= 2)
                kws.add(noVowels);
            // 13. Birinchi + oxirgi qism (qisqartma)
            if (clean.length >= 6) {
                kws.add(clean.substring(0, 3) + clean.substring(clean.length - 2));
            }
            // 14. Unli harf almashtirishlar (a↔o, i↔e, u↔o)
            var vowelSwaps = [
                ['a', 'o'], ['o', 'a'], ['i', 'e'], ['e', 'i'],
                ['u', 'o'], ['o', 'u'], ['a', 'e'], ['e', 'a'],
                ['i', 'y'], ['y', 'i'],
            ];
            for (var _j = 0, vowelSwaps_1 = vowelSwaps; _j < vowelSwaps_1.length; _j++) {
                var _k = vowelSwaps_1[_j], vf = _k[0], vt = _k[1];
                if (clean.includes(vf)) {
                    // Birinchi topilgan joyda
                    kws.add(clean.replace(vf, vt));
                    // Barcha joylarda
                    kws.add(clean.replace(new RegExp(vf, 'g'), vt));
                }
            }
            // 15. Ikki harf qo'shish/olib tashlash (dublikat undosh)
            var consonants = 'bcdfghjklmnpqrstvxyz';
            for (var i = 0; i < clean.length; i++) {
                if (consonants.includes(clean[i])) {
                    // Dublikat
                    kws.add(clean.slice(0, i + 1) + clean[i] + clean.slice(i + 1));
                    // Agar dublikat bor — olib tashlash
                    if (i < clean.length - 1 && clean[i] === clean[i + 1]) {
                        kws.add(clean.slice(0, i) + clean.slice(i + 1));
                    }
                }
            }
            // 16. Qo'shimcha fonetik variantlar
            var extraSwaps = [
                ['yo', 'o'], ['yo', 'ya'],
                ['iy', 'i'], ['iy', 'y'],
                ['ov', 'av'], ['av', 'ov'],
                ['on', 'an'], ['an', 'on'],
                ['or', 'ar'], ['ar', 'or'],
                ['ir', 'er'], ['er', 'ir'],
                ['in', 'en'], ['en', 'in'],
                ['ob', 'ab'], ['ab', 'ob'],
                ['ot', 'at'], ['at', 'ot'],
                ['ok', 'ak'], ['ak', 'ok'],
                ['oz', 'az'], ['az', 'oz'],
                ['iz', 'ez'], ['ez', 'iz'],
                ['ik', 'ek'], ['ek', 'ik'],
            ];
            for (var _l = 0, extraSwaps_1 = extraSwaps; _l < extraSwaps_1.length; _l++) {
                var _m = extraSwaps_1[_l], ef = _m[0], et = _m[1];
                if (clean.includes(ef)) {
                    kws.add(clean.replace(ef, et));
                }
            }
            // 17. 2-harf prefikslar + suffiks
            if (clean.length >= 3) {
                for (var end = clean.length; end >= clean.length - 2 && end >= 3; end--) {
                    kws.add(clean.substring(0, end));
                }
            }
            // 18. Noto'g'ri klaviatura (eng keng tarqalgan)
            var kbSwaps = [
                ['s', 'ы'], ['d', 'в'], ['f', 'а'], ['g', 'п'],
                ['h', 'р'], ['j', 'о'], ['k', 'л'], ['l', 'д'],
            ];
            var kbVersion = clean;
            for (var _o = 0, kbSwaps_1 = kbSwaps; _o < kbSwaps_1.length; _o++) {
                var _p = kbSwaps_1[_o], lf = _p[0], lt = _p[1];
                if (kbVersion.includes(lf))
                    kbVersion = kbVersion.replace(new RegExp(lf, 'g'), lt);
            }
            if (kbVersion !== clean && kbVersion.length >= 2)
                kws.add(kbVersion);
            // 19. Qisqa nomlar uchun maxsus variantlar
            if (clean.length <= 5) {
                // Barcha undosh almashtirish
                for (var _q = 0, _r = [['b', 'p'], ['p', 'b'], ['d', 't'], ['t', 'd'], ['g', 'k'], ['k', 'g'], ['z', 's'], ['s', 'z'], ['v', 'w'], ['w', 'v'], ['j', 'zh'], ['zh', 'j']]; _q < _r.length; _q++) {
                    var _s = _r[_q], cf = _s[0], ct = _s[1];
                    if (clean.includes(cf))
                        kws.add(clean.replace(cf, ct));
                }
                // Harf qo'shish (har pozitsiyaga)
                for (var _t = 0, _u = 'aeioubdgklmnrstv'; _t < _u.length; _t++) {
                    var c = _u[_t];
                    kws.add(clean + c);
                    kws.add(c + clean);
                    if (clean.length >= 3)
                        kws.add(clean.slice(0, 2) + c + clean.slice(2));
                }
                // Katta-kichik harf variantlari
                kws.add(clean.toUpperCase());
                kws.add(clean[0].toUpperCase() + clean.slice(1));
                // Takroriy harf
                for (var i = 0; i < clean.length; i++) {
                    kws.add(clean.slice(0, i) + clean[i] + clean[i] + clean.slice(i + 1));
                }
                // Qo'shimchalar
                for (var _v = 0, _w = ['tumani', 'tuman', 'shahar', 'sh', 'shahr', 'sha', 'i', 'ni', 'da', 'ga', 'dan']; _v < _w.length; _v++) {
                    var suf = _w[_v];
                    kws.add(clean + suf);
                    kws.add(clean + ' ' + suf);
                }
            }
            // 20. Barcha nomlar uchun qo'shimcha suffiks variantlar
            for (var _x = 0, _y = ['i', 'ni', 'da', 'ga', 'dan', 'ning', 'lar', 'dagi']; _x < _y.length; _x++) {
                var suf = _y[_x];
                kws.add(clean + suf);
            }
            // 21. Oldingi/keyingi harf xatolari (keyboard proximity)
            var adjacent = {
                q: ['w', 'a'], w: ['q', 'e', 's'], e: ['w', 'r', 'd'], r: ['e', 't', 'f'], t: ['r', 'y', 'g'],
                y: ['t', 'u', 'h'], u: ['y', 'i', 'j'], i: ['u', 'o', 'k'], o: ['i', 'p', 'l'], p: ['o', 'l'],
                a: ['q', 's', 'z'], s: ['a', 'd', 'w', 'x'], d: ['s', 'f', 'e', 'c'], f: ['d', 'g', 'r', 'v'],
                g: ['f', 'h', 't', 'b'], h: ['g', 'j', 'y', 'n'], j: ['h', 'k', 'u', 'm'], k: ['j', 'l', 'i'],
                l: ['k', 'o', 'p'], z: ['a', 'x', 's'], x: ['z', 'c', 's', 'd'], c: ['x', 'v', 'd', 'f'],
                v: ['c', 'b', 'f', 'g'], b: ['v', 'n', 'g', 'h'], n: ['b', 'm', 'h', 'j'], m: ['n', 'j', 'k'],
            };
            for (var i = 0; i < clean.length; i++) {
                var ch = clean[i];
                if (adjacent[ch]) {
                    for (var _z = 0, _0 = adjacent[ch]; _z < _0.length; _z++) {
                        var adj = _0[_z];
                        kws.add(clean.slice(0, i) + adj + clean.slice(i + 1));
                    }
                }
            }
            return __spreadArray([], kws, true).filter(function (k) { return k.length >= 2; }).join(',');
        };
        // ==========================================
        // SEED — 14 viloyat + barcha tuman/shaharlar + kalit so'zlar
        // ==========================================
        LocationsService_1.prototype.seed = function () {
            return __awaiter(this, void 0, void 0, function () {
                var locations;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.location.deleteMany()];
                        case 1:
                            _a.sent();
                            locations = this.getSeedData();
                            return [4 /*yield*/, this.prisma.location.createMany({ data: locations })];
                        case 2:
                            _a.sent();
                            this.logger.log("".concat(locations.length, " ta lokatsiya qo'shildi"));
                            // Cache tozalash
                            return [4 /*yield*/, this.redis.delPattern('dist:*')];
                        case 3:
                            // Cache tozalash
                            _a.sent();
                            return [2 /*return*/, { message: "".concat(locations.length, " ta lokatsiya muvaffaqiyatli qo'shildi") }];
                    }
                });
            });
        };
        LocationsService_1.prototype.getSeedData = function () {
            var data = [];
            // ==========================================
            // KALIT SO'ZLAR XARITASI (50+ varianti)
            // ==========================================
            var KEYWORDS = {
                // ======= TOSHKENT SHAHRI =======
                'Toshkent': 'toshkent,toshkend,tashkent,tashkend,ташкент,тошкент,ташкен,тошкен,tosh,toshken,toshknt,tashknt,tosken,toskend,toshk,tashk,тош,таш,tashken,ташкент,toshkent shahri,toshkentshahri',
                'Bektemir': 'bektemir,bektimir,bektemer,bektamir,bektemir tumani,bektemr,bktemir,bektemir tuman,бектемир',
                'Chilonzor': 'chilonzor,chilanzor,chilanzar,chilonzar,chillonzor,chilanzr,chil,chilonzr,чиланзор,чилонзор,chilonzor tumani',
                'Yakkasaroy': 'yakkasaroy,yakkasaray,yakasaroy,yakkasaroi,яккасарой,яккасарай,yakasaray,ykksaroy,yakkasaro',
                'Mirobod': 'mirobod,mirabod,mirabad,mirоbоd,мирабад,миробод,mirobad,mirobid,mirоbad,mirobоd',
                "Mirzo Ulug'bek": "mirzo ulugbek,mirzo ulug'bek,ulugbek,ulughbek,ulugbk,mirzo,mirzoulugbek,мирзо улугбек,улугбек,mirzoulughbek,mirzo ulg,m.ulugbek",
                'Sergeli': 'sergeli,sergili,sirgali,sirgeli,серегли,сергели,sergali,srgeli,srgali',
                'Shayxontohur': "shayxontohur,shayxontoxur,shayxantoxur,shayxontahur,shayxontahur,шайхонтохур,шайхантахур,shayxon,shayx,shayxontoh,shayxontour,shayxontoxr",
                'Olmazor': 'olmazor,almazor,olmazar,almazar,olmazr,алмазор,олмазор,almazar tumani,olmazor tuman',
                'Uchtepa': 'uchtepa,uchteppa,uchtipa,учтепа,учтеппа,uchtepe,uchtpa,uchtep',
                'Yashnobod': 'yashnobod,yashnabad,yashnabot,yashnobot,яшнабад,яшнободd,yashnobad,yashnobd,yashnbd',
                'Yunusobod': 'yunusobod,yunusabad,yunusabot,yunusobot,юнусабад,юнусобод,yunusabd,yunusobd,yunsabad,yunsobod,yunusоbоd',
                // ======= TOSHKENT VILOYATI =======
                'Nurafshon': 'nurafshon,nurafshan,nurafson,нурафшон,нурафшан,nurafshon shahar,nurfshon,nurafsh,nurafshоn',
                'Olmaliq': "olmaliq,almaliq,olmalik,almalik,олмалик,олмалиқ,almalyk,olmalyk,olmaliq shahar,olmalq,almalq,almalk",
                'Angren': 'angren,angiren,angrin,ongren,ангрен,angran,angrn,angre,ongren,angiren',
                'Chirchiq': 'chirchiq,chirchik,chirchik shahar,чирчик,чирчиқ,chirchq,chrchiq,chirchk,chrchik',
                'Bekobod': 'bekobod,bekabad,bekabod,bekabot,бекабад,бекобод,bekabad shahar,bekоbоd,bekobоd,bekbd,bekabоd',
                'Ohangaron': 'ohangaron,ahangaron,oxangaron,ohongoron,оханагарон,ohangaran,оhangaron,ohngaron,ahngaron',
                "Yangiyo'l": "yangiyl,yangiyol,yangiyul,yangiyo'l,yangyol,янгиюл,янгийўл,yngiyol,yangiyol shahar,yangiyl shahar,yangiyol sh",
                "Bo'ka": "boka,buka,bo'ka,бука,бўка,buka tumani",
                "Bo'stonliq": "bostonliq,bustonliq,bo'stonliq,bostanliq,bustanliq,бўстонлик,бостанлик,bostonlq,bstonliq",
                'Chinoz': 'chinoz,chinaz,chinoztumani,чиноз,чиназ,chinoz tumani,chnoz',
                'Qibray': 'qibray,kibray,qibrai,кибрай,қибрай,qibrai tumani,qibry',
                'Parkent': 'parkent,parkend,паркент,parknt,prkent,parkend tumani',
                'Piskent': 'piskent,piskend,пискент,pisknt,pskent,piskend tumani',
                'Zangiota': 'zangiota,zangiata,зангиата,зангиота,zangota,zangiota tumani,zangiоta',
                // ======= SAMARQAND =======
                'Samarqand': "samarqand,samarkand,samarkant,samarqant,самарканд,самарқанд,samar,samark,smrqnd,samarqnd,samarknd,samarkan,sam,samarqand shahar,samarqand sh",
                "Kattaqo'rg'on": "kattaqorgon,kattakurgan,kattakurgon,kattaqurgan,kattaqorgon,каттақўрғон,каттакурган,kattaqorgon shahar,kattaqrgon,kattaqurgon,kattakurgan shahar,kttqorgon",
                "Bulung'ur": "bulungur,bulungor,bulung'ur,булунғур,булунгур,bulngur,blungur",
                'Ishtixon': 'ishtixon,ishtihon,ishtikhan,иштихон,иштихан,ishtxon,ishtihоn',
                'Jomboy': 'jomboy,jambay,jombay,jomboi,жомбой,жомбай,jomby,jmbay',
                'Urgut': 'urgut,urgud,urgat,ургут,ургуд,urgut tumani,urguttumani,urgtt',
                // ======= BUXORO =======
                'Buxoro': "buxoro,bukhara,buhara,buhoro,бухоро,бухара,bux,buxara,bukhoro,buxоrо,buхоrо,buhara shahar,buxoro shahar,bukhara shahar",
                'Kogon': 'kogon,kagan,kagon,каган,когон,kogon shahar,kgon,kagn',
                "G'ijduvon": "gijduvon,g'ijduvon,gijduvan,gijdivon,гиждувон,гиждуван,gijdvon,gjduvon,gijduvоn,gijduvon shahar",
                'Romitan': 'romitan,romitоn,ромитан,romtian,romitn,romtan',
                'Shofirkon': 'shofirkon,shafirkan,shofirkan,шофиркан,шофиркон,shafirkon,shfrkon,shofirkn',
                'Vobkent': 'vobkent,vabkent,vоbkent,вобкент,вабкент,vobknt,vbkent',
                "Qorako'l": "qorakol,korakol,qorakul,korakul,қоракўл,коракуль,qorakol tumani,qrkol",
                'Olot': 'olot,alat,alot,олот,алат,olot tumani',
                // ======= FARG'ONA =======
                "Farg'ona": "fargona,fergana,farghona,fargana,фергана,фарғона,fer,ferg,fergona,fargоna,frgona,fargna,fargona shahar,fergana shahar",
                "Marg'ilon": "margilon,marginlon,margelon,margilan,маргилан,маргилон,margilon shahar,mrgilon,margilоn,margiln",
                'Quvasoy': "quvasoy,kuvasoy,quvasay,kuvasay,кувасай,қувасой,quvasoy shahar,quvsoy,kuvsoy,qvsoy",
                "Qo'qon": "qoqon,kokand,kokon,quqon,koqon,коканд,қўқон,kokond,qqon,qoqon shahar,kokand shahar,qoqn,qqn,koknd",
                'Rishton': 'rishton,rishtan,rishtоn,риштон,риштан,rshton,rishtn,rishton tumani',
                "So'x": "sox,soh,sux,so'x,сох,сўх,sox tumani",
                'Quva': 'quva,kuva,қува,кува,quva tumani,qva,kva',
                'Oltiariq': 'oltiariq,altiariq,oltyariq,oltiоriq,олтиарик,oltariq,oltiarq',
                'Beshariq': 'beshariq,beshоriq,бешарик,бешарик,beshriq,besharq',
                // ======= ANDIJON =======
                'Andijon': "andijon,andijan,andizhan,andizan,андижан,андижон,and,andjn,andijоn,andijоn shahar,andijan shahar,andijon shahar",
                'Asaka': 'asaka,assaka,osoka,asoka,асака,asaka shahar,asak,аsака',
                'Xonobod': 'xonobod,xonabad,khonabad,xonobоd,хонабад,хонобод,xnobod,xonbd,xonоbоd,xonabad shahar',
                'Shahrixon': 'shahrixon,shaxrixon,shahrixan,shahrikhan,шахрихон,шахрихан,shahrixn,shxrixon,shahrixоn',
                'Marhamat': 'marhamat,marxamat,marhamt,мархамат,marhmat,mrhamat',
                // ======= NAMANGAN =======
                'Namangan': "namangan,наманган,namangon,namngan,nam,namangn,namоngan,namangan shahar",
                'Chust': "chust,chust tumani,чуст,chst,chust shahar",
                'Pop': 'pop,pap,поп,пап,pop tumani',
                'Kosonsoy': 'kosonsoy,kasansay,kosоnsоy,косонсой,касансай,kosnsoy,ksonsoy',
                "Uchqo'rg'on": "uchqorgon,uchkurgan,uchqurgan,учқўрғон,учкурган,uchqrgon,uchkurgon,uchqurgn",
                // ======= NAVOIY =======
                'Navoiy': 'navoiy,navoi,navoyi,навоий,навои,naviy,nvoiy,navoiy shahar,navoi shahar',
                'Zarafshon': 'zarafshon,zarafshan,зарафшон,зарафшан,zarafshоn,zarfshon,zrfshon,zarafshon shahar',
                'Uchquduq': 'uchquduq,uchkuduk,учқудуқ,учкудук,uchquduq shahar,uchqudq',
                'Nurota': 'nurota,nurata,нурата,нурота,nurоta,nrota',
                // ======= QASHQADARYO =======
                'Qarshi': 'qarshi,karshi,karsi,қарши,карши,qrshi,qarsh,karsh,qarshi shahar,karshi shahar',
                'Shahrisabz': "shahrisabz,shakhrisabz,shahrisabs,шахрисабз,shahrisabz shahar,shakhrisabs,shahrsabz,shrisabz,shahrisbs,shakhrisabz shahar",
                'Kitob': 'kitob,kitab,китаб,китоб,kitоb,ktob,kitob shahar',
                "G'uzor": "guzor,g'uzor,ghuzor,гузор,ғузор,guzar,ghuzor tumani,gzor",
                'Muborak': 'muborak,mubarek,мубарак,муборак,mubarak,mborak,mubоrak',
                'Koson': 'koson,kasan,касан,косон,kosоn,kson',
                // ======= SURXONDARYO =======
                'Termiz': 'termiz,termez,tirmiz,tirmez,термез,термиз,termiz shahar,termez shahar,trmiz,trmez,termz',
                'Denov': 'denov,denau,denоv,денау,денов,denv,dnov,denov tumani,denau tumani',
                'Boysun': 'boysun,baysun,бойсун,байсун,boysn,bysun',
                'Sherobod': 'sherobod,sherabad,sherоbоd,шерабад,шеробод,sherоbad,sherabd,shrobod',
                // ======= JIZZAX =======
                'Jizzax': 'jizzax,jizzakh,djizak,jizax,жиззах,джизак,jizzah,jzzax,jizzax shahar,jizzakh shahar,jizak',
                'Zomin': 'zomin,zamin,зомин,замин,zоmin,zmn,zomin tumani',
                'Paxtakor': 'paxtakor,pahtakor,пахтакор,пахтакўр,paxtakr,pxtakor',
                // ======= SIRDARYO =======
                'Guliston': 'guliston,gulistan,гулистон,гулистан,gulstan,gulistоn,gulstn,guliston shahar,gulistan shahar',
                'Yangiyer': 'yangiyer,yangier,янгиер,янгиер,yangiyr,yngiyer,yangiyer shahar',
                'Shirin': 'shirin,shirin shahar,ширин,shrn,shirn',
                'Boyovut': 'boyovut,bayavut,boyaut,бойовут,баявут,boyоvut,byvut,boyovt',
                // ======= XORAZM =======
                'Urganch': 'urganch,urgench,ургенч,урганч,urgnch,urgench shahar,urganch shahar,urgench sh',
                'Xiva': 'xiva,khiva,хива,хива shahar,xva,khva,xiva shahar,khiva shahar',
                'Gurlan': 'gurlan,гурлан,gurln,grlan,gurlan tumani',
                'Hazorasp': 'hazorasp,hazarasp,хазарасп,хазорасп,hzorasp,hazrasp',
                "Tuproqqal'a": "tuproqqala,tuprokkala,tuproqala,тупроққала,тупроккала,tuproqala tumani,tuprqqala",
                // ======= QORAQALPOG'ISTON =======
                'Nukus': 'nukus,нукус,nuks,nukus shahar,nkus,nukuss',
                "Mo'ynoq": "moynoq,moynaq,muinak,muynoq,мўйноқ,муйнак,moynoq shahar,mynоq,moynq",
                'Kungrad': 'kungrad,kungirot,қунғирот,кунград,kungrad tumani,kngrat,kungrоt',
                "To'rtko'l": "tortkol,turtkul,to'rtko'l,тўрткўл,турткул,tortkul,tortkоl",
                "Xo'jayli": "xojayli,hojayli,xojaili,хўжайли,ходжейли,xojaily,hojayli tumani,xjyli",
                'Chimboy': 'chimboy,chimbay,чимбай,чимбой,chimby,chmbay',
                'Beruniy': 'beruniy,beruniy tumani,берунийй,beruny,brniy',
                // ======= VILOYATLAR =======
                'Toshkent shahri': 'toshkent shahri,ташкент,тошкент,tashkent city,toshkent shahar,toshkent sh',
                'Toshkent viloyati': 'toshkent viloyati,toshkent v,tashkent region,тошкент вилояти',
                'Samarqand viloyati': 'samarqand viloyati,samarqand v,самарканд,samarkand region',
                'Buxoro viloyati': 'buxoro viloyati,buxoro v,бухоро,bukhara region',
                "Farg'ona viloyati": "fargona viloyati,fargona v,фаргона,fergana region,fargona vil",
                'Andijon viloyati': 'andijon viloyati,andijon v,андижон,andijan region',
                'Namangan viloyati': 'namangan viloyati,namangan v,наманган вилояти',
                'Navoiy viloyati': 'navoiy viloyati,navoiy v,навоий вилояти',
                'Qashqadaryo viloyati': "qashqadaryo viloyati,qashqadaryo v,kashkadarya,кашкадарья,қашқадарё,kashkadaryo",
                'Surxondaryo viloyati': 'surxondaryo viloyati,surxondaryo v,surkhandarya,сурхондарё,сурхандарья,surhandaryo',
                'Jizzax viloyati': 'jizzax viloyati,jizzax v,jizzakh,джизак вилояти',
                'Sirdaryo viloyati': 'sirdaryo viloyati,sirdaryo v,сырдарья,sirdarya',
                'Xorazm viloyati': 'xorazm viloyati,xorazm v,khorezm,хоразм,хорезм',
                "Qoraqalpog'iston Respublikasi": "qoraqalpogiston,karakalpakstan,каракалпакстан,қорақалпоғистон,qoraqalpogiston respublikasi,qqr",
            };
            var regions = {
                'Toshkent shahri': {
                    lat: 41.2995, lng: 69.2401,
                    cities: [['Toshkent', 41.2995, 69.2401]],
                    districts: [
                        ['Bektemir', 41.2167, 69.3333], ['Chilonzor', 41.2736, 69.1858],
                        ['Yakkasaroy', 41.2881, 69.2761], ['Mirobod', 41.3150, 69.2769],
                        ["Mirzo Ulug'bek", 41.3400, 69.3300], ['Sergeli', 41.2283, 69.2739],
                        ['Shayxontohur', 41.3225, 69.2228], ['Olmazor', 41.3333, 69.1833],
                        ['Uchtepa', 41.2833, 69.1667], ['Yashnobod', 41.3419, 69.3028],
                        ['Yunusobod', 41.3650, 69.2875],
                    ],
                },
                'Toshkent viloyati': {
                    lat: 41.3167, lng: 69.5000,
                    cities: [
                        ['Nurafshon', 41.0389, 69.3275], ['Olmaliq', 40.8453, 69.5983],
                        ['Angren', 41.0167, 70.1439], ['Chirchiq', 41.4689, 69.5822],
                        ['Bekobod', 40.2208, 69.2706], ['Ohangaron', 41.0667, 69.6333],
                        ["Yangiyo'l", 41.1117, 69.0500],
                    ],
                    districts: [
                        ['Bekobod tumani', 40.2300, 69.2800], ["Bo'ka", 40.9500, 69.2167],
                        ["Bo'stonliq", 41.6000, 70.2167], ['Chinoz', 40.9333, 68.7667],
                        ['Qibray', 41.3667, 69.4833], ['Ohangaron tumani', 41.0500, 69.6500],
                        ["Oqqo'rg'on", 40.9333, 69.6833], ['Parkent', 41.2950, 69.6767],
                        ['Piskent', 40.8833, 69.3500], ['Quyi Chirchiq', 41.0667, 69.0833],
                        ["O'rta Chirchiq", 41.2167, 69.5000], ["Yangiyo'l tumani", 41.1100, 69.0600],
                        ['Yuqori Chirchiq', 41.5333, 69.7500], ['Zangiota', 41.1833, 69.1833],
                        ['Toshkent tumani', 41.3333, 69.3833],
                    ],
                },
                'Samarqand viloyati': {
                    lat: 39.6542, lng: 66.9597,
                    cities: [['Samarqand', 39.6542, 66.9597], ["Kattaqo'rg'on", 39.8989, 66.2561]],
                    districts: [
                        ["Bulung'ur", 39.7667, 67.2667], ['Ishtixon', 39.9667, 66.5167],
                        ['Jomboy', 39.7167, 67.1833], ["Kattaqo'rg'on tumani", 39.9000, 66.2500],
                        ['Narpay', 39.9167, 66.5500], ['Nurobod', 39.5667, 67.2833],
                        ['Oqdaryo', 39.6167, 67.0167], ["Past darg'om", 39.5833, 66.9167],
                        ['Payariq', 39.7833, 67.0833], ['Paxtachi', 39.4833, 66.5833],
                        ['Samarqand tumani', 39.6400, 66.9400], ['Toyloq', 39.4667, 67.2833],
                        ['Urgut', 39.4000, 67.2500],
                    ],
                },
                'Buxoro viloyati': {
                    lat: 39.7747, lng: 64.4286,
                    cities: [['Buxoro', 39.7747, 64.4286], ['Kogon', 39.7225, 64.5464], ["G'ijduvon", 40.1000, 64.6833]],
                    districts: [
                        ['Buxoro tumani', 39.7800, 64.4300], ["G'ijduvon tumani", 40.1000, 64.6800],
                        ['Jondor', 39.9833, 64.1667], ['Kogon tumani', 39.7200, 64.5500],
                        ['Olot', 39.7500, 63.5833], ['Peshku', 39.3833, 64.7167],
                        ["Qorako'l", 39.5000, 63.8500], ['Qorovulbozor', 39.5167, 64.7000],
                        ['Romitan', 39.9333, 64.3833], ['Shofirkon', 40.1333, 64.5000],
                        ['Vobkent', 40.0167, 64.5167],
                    ],
                },
                "Farg'ona viloyati": {
                    lat: 40.3734, lng: 71.7893,
                    cities: [
                        ["Farg'ona", 40.3734, 71.7893], ["Marg'ilon", 40.4703, 71.7140],
                        ['Quvasoy', 40.5342, 71.9800], ["Qo'qon", 40.5286, 70.9425],
                    ],
                    districts: [
                        ["Bag'dod", 40.3833, 71.2333], ['Beshariq', 40.4167, 70.5833],
                        ['Buvayda', 40.4167, 71.0167], ["Dang'ara", 40.5667, 70.9333],
                        ["Farg'ona tumani", 40.3700, 71.7800], ['Furqat', 40.2833, 71.4167],
                        ['Oltiariq', 40.5167, 71.4333], ["O'zbekiston", 40.3500, 71.6167],
                        ['Quva', 40.5167, 71.9500], ['Rishton', 40.3500, 71.2667],
                        ["So'x", 39.9667, 71.1333], ['Toshloq', 40.5333, 71.7667],
                        ["Uchko'prik", 40.5500, 71.0333], ['Yozyovon', 40.2000, 71.6333],
                    ],
                },
                'Andijon viloyati': {
                    lat: 40.7821, lng: 72.3442,
                    cities: [['Andijon', 40.7821, 72.3442], ['Asaka', 40.6400, 72.2400], ['Xonobod', 40.8000, 72.0000]],
                    districts: [
                        ['Andijon tumani', 40.7800, 72.3400], ['Asaka tumani', 40.6400, 72.2400],
                        ['Baliqchi', 40.9333, 72.2667], ["Bo'z", 40.6833, 72.1667],
                        ['Buloqboshi', 40.6333, 72.4333], ['Izboskan', 40.9000, 72.1667],
                        ['Jalolquduq', 40.7500, 72.5500], ['Marhamat', 40.5000, 72.3167],
                        ["Oltinko'l", 40.8333, 72.3000], ['Paxtaobod', 40.7500, 72.1333],
                        ["Qo'rg'ontepa", 40.7333, 72.0833], ['Shahrixon', 40.7167, 72.0500],
                        ["Ulug'nor", 40.7833, 72.2667], ["Xo'jaobod", 40.6500, 72.5833],
                    ],
                },
                'Namangan viloyati': {
                    lat: 40.9983, lng: 71.6726,
                    cities: [['Namangan', 40.9983, 71.6726], ['Chust', 41.0000, 71.2333]],
                    districts: [
                        ['Chortoq', 41.0667, 71.9833], ['Chust tumani', 41.0000, 71.2300],
                        ['Kosonsoy', 41.2500, 71.5500], ['Mingbuloq', 40.7833, 71.1500],
                        ['Namangan tumani', 41.0000, 71.6700], ['Norin', 41.0833, 71.3333],
                        ['Pop', 41.0833, 70.8167], ["To'raqo'rg'on", 40.9833, 71.5167],
                        ["Uchqo'rg'on", 41.1167, 71.0333], ['Uychi', 41.0833, 71.8000],
                        ["Yangiqo'rg'on", 41.2000, 71.7167],
                    ],
                },
                'Navoiy viloyati': {
                    lat: 40.1033, lng: 65.3793,
                    cities: [['Navoiy', 40.1033, 65.3793], ['Zarafshon', 41.5756, 64.1853], ['Uchquduq', 42.1567, 63.5550]],
                    districts: [
                        ['Karmana', 40.1333, 65.3667], ['Konimex', 40.2833, 65.0000],
                        ['Navbahor', 40.4500, 65.1333], ['Navoiy tumani', 40.1000, 65.3800],
                        ['Nurota', 40.5667, 65.6833], ['Qiziltepa', 39.8833, 65.4000],
                        ['Tomdi', 42.0000, 64.9000], ['Xatirchi', 40.2333, 65.9333],
                    ],
                },
                'Qashqadaryo viloyati': {
                    lat: 38.8606, lng: 65.7986,
                    cities: [['Qarshi', 38.8606, 65.7986], ['Shahrisabz', 39.0517, 66.8303], ['Kitob', 39.1325, 66.8567]],
                    districts: [
                        ['Chiroqchi', 38.8833, 66.5833], ['Dehqonobod', 38.3500, 66.4833],
                        ["G'uzor", 38.6167, 66.2333], ['Kasbi', 38.9333, 65.4500],
                        ['Kitob tumani', 39.1300, 66.8600], ['Koson', 38.7667, 65.5167],
                        ['Mirishkor', 38.8500, 65.1667], ['Muborak', 39.1833, 65.2500],
                        ['Nishon', 38.5333, 65.5333], ['Qarshi tumani', 38.8600, 65.8000],
                        ['Shahrisabz tumani', 39.0500, 66.8300], ["Yakkabog'", 38.9500, 66.6833],
                    ],
                },
                'Surxondaryo viloyati': {
                    lat: 37.2241, lng: 67.2783,
                    cities: [['Termiz', 37.2241, 67.2783], ['Denov', 38.2667, 67.8833]],
                    districts: [
                        ['Angor', 38.4833, 67.5333], ['Bandixon', 38.3000, 68.0000],
                        ['Boysun', 38.2000, 67.2000], ['Denov tumani', 38.2700, 67.8800],
                        ["Jarqo'rg'on", 37.5167, 67.4167], ['Muzrabot', 37.4333, 67.9500],
                        ['Oltinsoy', 38.0333, 67.5333], ['Qiziriq', 37.8833, 67.5833],
                        ["Qumqo'rg'on", 37.7833, 67.7833], ['Sariosiyo', 38.4000, 67.9833],
                        ['Sherobod', 37.6500, 67.0000], ["Sho'rchi", 37.9833, 67.7833],
                        ['Termiz tumani', 37.2200, 67.2800], ['Uzun', 38.1000, 67.9000],
                    ],
                },
                'Jizzax viloyati': {
                    lat: 40.1158, lng: 67.8422,
                    cities: [['Jizzax', 40.1158, 67.8422]],
                    districts: [
                        ['Arnasoy', 40.5833, 68.0333], ['Baxmal', 39.9667, 68.2500],
                        ["Do'stlik", 40.5333, 67.9500], ['Forish', 40.3667, 68.5500],
                        ["G'allaorol", 40.0833, 67.6000], ['Jizzax tumani', 40.1200, 67.8400],
                        ["Mirzacho'l", 40.5667, 68.2667], ['Paxtakor', 40.2833, 67.4833],
                        ['Sharof Rashidov', 40.2667, 68.4500], ['Yangiobod', 39.8500, 68.0333],
                        ['Zafarobod', 40.5500, 68.3167], ['Zomin', 39.9500, 68.4000],
                    ],
                },
                'Sirdaryo viloyati': {
                    lat: 40.4897, lng: 68.7842,
                    cities: [
                        ['Guliston', 40.4897, 68.7842], ['Yangiyer', 40.3300, 68.8400],
                        ['Shirin', 40.2300, 68.8500], ['Boyovut', 40.1200, 68.3000],
                    ],
                    districts: [
                        ['Boyovut tumani', 40.1200, 68.3000], ['Guliston tumani', 40.4900, 68.7800],
                        ['Mirzaobod', 40.4000, 68.5333], ['Oqoltin', 40.4000, 68.9000],
                        ['Sardoba', 40.3833, 68.6667], ['Sayxunobod', 40.2167, 68.8000],
                        ['Sirdaryo tumani', 40.4667, 68.6667], ['Xovos', 40.5833, 68.8833],
                    ],
                },
                'Xorazm viloyati': {
                    lat: 41.5500, lng: 60.6333,
                    cities: [['Urganch', 41.5500, 60.6333], ['Xiva', 41.3775, 60.3619]],
                    districts: [
                        ["Bog'ot", 41.6167, 60.7833], ['Gurlan', 41.7333, 60.6167],
                        ['Hazorasp', 41.3167, 60.9333], ["Qo'shko'pir", 41.2500, 60.3167],
                        ['Shovot', 41.6667, 60.5000], ['Urganch tumani', 41.5500, 60.6300],
                        ['Xiva tumani', 41.3800, 60.3600], ['Xonqa', 41.5000, 60.8167],
                        ['Yangiariq', 41.4000, 60.5500], ['Yangibozor', 41.7333, 60.7500],
                        ["Tuproqqal'a", 41.5833, 60.2500],
                    ],
                },
                "Qoraqalpog'iston Respublikasi": {
                    lat: 42.4628, lng: 59.6036,
                    cities: [['Nukus', 42.4628, 59.6036], ["Mo'ynoq", 43.7633, 58.6894]],
                    districts: [
                        ['Amudaryo', 41.9667, 60.0333], ['Beruniy', 41.6833, 60.7500],
                        ['Chimboy', 42.9333, 59.7833], ["Ellikqal'a", 41.7500, 60.7167],
                        ['Kegeyli', 42.7833, 58.6833], ['Kungrad', 43.0000, 58.7000],
                        ["Mo'ynoq tumani", 43.7600, 58.6900], ['Nukus tumani', 42.4600, 59.6000],
                        ["Qanliko'l", 42.0500, 59.5000], ["Qo'ng'irot", 42.9833, 58.6667],
                        ["Qorao'zak", 42.6333, 59.6167], ['Shumanay', 42.4500, 59.3833],
                        ["Taxtako'pir", 42.5000, 58.1500], ["To'rtko'l", 41.5500, 60.8000],
                        ["Xo'jayli", 42.4000, 59.4500],
                    ],
                },
            };
            for (var _i = 0, _a = Object.entries(regions); _i < _a.length; _i++) {
                var _b = _a[_i], regionName = _b[0], _c = _b[1], rLat = _c.lat, rLng = _c.lng, cities = _c.cities, districts = _c.districts;
                var autoRegKw = this.autoGenerateKeywords(regionName);
                var manualRegKw = KEYWORDS[regionName] || '';
                var regionKw = manualRegKw ? "".concat(manualRegKw, ",").concat(autoRegKw) : autoRegKw;
                data.push({ name: regionName, region: regionName, type: 'REGION', lat: rLat, lng: rLng, keywords: regionKw });
                for (var _d = 0, cities_1 = cities; _d < cities_1.length; _d++) {
                    var _e = cities_1[_d], name_1 = _e[0], lat = _e[1], lng = _e[2];
                    var autoKw = this.autoGenerateKeywords(name_1);
                    var manualKw = KEYWORDS[name_1] || '';
                    var kw = manualKw ? "".concat(manualKw, ",").concat(autoKw) : autoKw;
                    data.push({ name: name_1, region: regionName, type: 'CITY', lat: lat, lng: lng, keywords: kw });
                }
                for (var _f = 0, districts_1 = districts; _f < districts_1.length; _f++) {
                    var _g = districts_1[_f], name_2 = _g[0], lat = _g[1], lng = _g[2];
                    var autoKw = this.autoGenerateKeywords(name_2);
                    var manualKw = KEYWORDS[name_2] || '';
                    var kw = manualKw ? "".concat(manualKw, ",").concat(autoKw) : autoKw;
                    data.push({ name: name_2, region: regionName, type: 'DISTRICT', lat: lat, lng: lng, keywords: kw });
                }
            }
            return data;
        };
        return LocationsService_1;
    }());
    __setFunctionName(_classThis, "LocationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LocationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LocationsService = _classThis;
}();
exports.LocationsService = LocationsService;
