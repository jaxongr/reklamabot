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
exports.FcmService = void 0;
var common_1 = require("@nestjs/common");
var admin = require("firebase-admin");
var fs = require("fs");
var FcmService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FcmService = _classThis = /** @class */ (function () {
        function FcmService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(FcmService.name);
            this.isInitialized = false;
        }
        FcmService_1.prototype.onModuleInit = function () {
            this.initFirebase();
        };
        FcmService_1.prototype.initFirebase = function () {
            try {
                var serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
                if (!serviceAccountPath) {
                    this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH topilmadi — FCM push o\'chirilgan');
                    return;
                }
                if (!fs.existsSync(serviceAccountPath)) {
                    this.logger.warn("Firebase service account fayl topilmadi: ".concat(serviceAccountPath));
                    return;
                }
                var serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                this.isInitialized = true;
                this.logger.log('Firebase Admin SDK muvaffaqiyatli ishga tushirildi');
            }
            catch (error) {
                this.logger.error("Firebase init xatosi: ".concat(error.message));
            }
        };
        /**
         * Bitta foydalanuvchiga push notification yuborish
         */
        FcmService_1.prototype.sendToUser = function (userId, title, body, data) {
            return __awaiter(this, void 0, void 0, function () {
                var user, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isInitialized)
                                return [2 /*return*/, false];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 6]);
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                    select: { fcmToken: true },
                                })];
                        case 2:
                            user = _a.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.fcmToken))
                                return [2 /*return*/, false];
                            return [4 /*yield*/, admin.messaging().send({
                                    token: user.fcmToken,
                                    notification: { title: title, body: body },
                                    data: data || {},
                                    android: {
                                        priority: 'high',
                                        notification: {
                                            sound: 'default',
                                            channelId: 'general',
                                        },
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, true];
                        case 4:
                            error_1 = _a.sent();
                            return [4 /*yield*/, this.handleSendError(error_1, userId)];
                        case 5:
                            _a.sent();
                            return [2 /*return*/, false];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Bir nechta foydalanuvchiga batch push (500 tadan)
         */
        FcmService_1.prototype.sendToUsers = function (userIds, title, body, data) {
            return __awaiter(this, void 0, void 0, function () {
                var users, tokens, totalSuccess, totalFailed, invalidTokenUserIds, batchSize, _loop_1, this_1, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isInitialized || userIds.length === 0) {
                                return [2 /*return*/, { success: 0, failed: 0 }];
                            }
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: { id: { in: userIds }, fcmToken: { not: null } },
                                    select: { id: true, fcmToken: true },
                                })];
                        case 1:
                            users = _a.sent();
                            tokens = users
                                .map(function (u) { return u.fcmToken; })
                                .filter(function (t) { return !!t; });
                            if (tokens.length === 0)
                                return [2 /*return*/, { success: 0, failed: 0 }];
                            totalSuccess = 0;
                            totalFailed = 0;
                            invalidTokenUserIds = [];
                            batchSize = 500;
                            _loop_1 = function (i) {
                                var batch, response, error_2;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            batch = tokens.slice(i, i + batchSize);
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, admin.messaging().sendEachForMulticast({
                                                    tokens: batch,
                                                    notification: { title: title, body: body },
                                                    data: data || {},
                                                    android: {
                                                        priority: 'high',
                                                        notification: {
                                                            sound: 'default',
                                                            channelId: 'general',
                                                        },
                                                    },
                                                })];
                                        case 2:
                                            response = _b.sent();
                                            totalSuccess += response.successCount;
                                            totalFailed += response.failureCount;
                                            // Yaroqsiz tokenlarni aniqlash
                                            response.responses.forEach(function (resp, idx) {
                                                if (resp.error &&
                                                    (resp.error.code === 'messaging/invalid-registration-token' ||
                                                        resp.error.code === 'messaging/registration-token-not-registered')) {
                                                    var tokenIdx_1 = i + idx;
                                                    var user = users.find(function (u) { return u.fcmToken === tokens[tokenIdx_1]; });
                                                    if (user)
                                                        invalidTokenUserIds.push(user.id);
                                                }
                                            });
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_2 = _b.sent();
                                            this_1.logger.error("FCM batch xatosi: ".concat(error_2.message));
                                            totalFailed += batch.length;
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            i = 0;
                            _a.label = 2;
                        case 2:
                            if (!(i < tokens.length)) return [3 /*break*/, 5];
                            return [5 /*yield**/, _loop_1(i)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            i += batchSize;
                            return [3 /*break*/, 2];
                        case 5:
                            if (!(invalidTokenUserIds.length > 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.clearInvalidTokens(invalidTokenUserIds)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            this.logger.log("FCM batch: ".concat(totalSuccess, " muvaffaqiyat, ").concat(totalFailed, " xato (").concat(tokens.length, " tokendan)"));
                            return [2 /*return*/, { success: totalSuccess, failed: totalFailed }];
                    }
                });
            });
        };
        /**
         * WebSocket'ga ulanmagan (offline) foydalanuvchilarga push
         * @param onlyLineActive — true bo'lsa faqat linya yoqiq foydalanuvchilarga (e'lonlar uchun)
         */
        FcmService_1.prototype.sendToOfflineUsers = function (title_1, body_1, data_1, connectedUserIds_1) {
            return __awaiter(this, arguments, void 0, function (title, body, data, connectedUserIds, onlyLineActive) {
                var where, offlineUsers, offlineIds, error_3;
                if (onlyLineActive === void 0) { onlyLineActive = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isInitialized)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            where = {
                                fcmToken: { not: null },
                                isActive: true,
                                id: connectedUserIds.size > 0
                                    ? { notIn: Array.from(connectedUserIds) }
                                    : undefined,
                            };
                            // E'lon bildirishnomasi — faqat linya yoqiq userlarga
                            if (onlyLineActive) {
                                where.isLineActive = true;
                            }
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: where,
                                    select: { id: true, fcmToken: true },
                                })];
                        case 2:
                            offlineUsers = _a.sent();
                            if (offlineUsers.length === 0)
                                return [2 /*return*/];
                            offlineIds = offlineUsers.map(function (u) { return u.id; });
                            return [4 /*yield*/, this.sendToUsers(offlineIds, title, body, data)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            this.logger.error("sendToOfflineUsers xatosi: ".concat(error_3.message));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Xatolikni qayta ishlash — invalid tokenlarni tozalash
         */
        FcmService_1.prototype.handleSendError = function (error, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var code;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            code = (error === null || error === void 0 ? void 0 : error.code) || ((_a = error === null || error === void 0 ? void 0 : error.errorInfo) === null || _a === void 0 ? void 0 : _a.code);
                            if (!(code === 'messaging/invalid-registration-token' ||
                                code === 'messaging/registration-token-not-registered')) return [3 /*break*/, 2];
                            this.logger.warn("Yaroqsiz FCM token tozalandi: userId=".concat(userId));
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { fcmToken: null },
                                })];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            this.logger.error("FCM xatosi (userId=".concat(userId, "): ").concat(error.message || error));
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Yaroqsiz tokenlarni batch tozalash
         */
        FcmService_1.prototype.clearInvalidTokens = function (userIds) {
            return __awaiter(this, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.user.updateMany({
                                    where: { id: { in: userIds } },
                                    data: { fcmToken: null },
                                })];
                        case 1:
                            _a.sent();
                            this.logger.warn("".concat(userIds.length, " ta yaroqsiz FCM token tozalandi"));
                            return [3 /*break*/, 3];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error("Token tozalash xatosi: ".concat(error_4.message));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return FcmService_1;
    }());
    __setFunctionName(_classThis, "FcmService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FcmService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FcmService = _classThis;
}();
exports.FcmService = FcmService;
