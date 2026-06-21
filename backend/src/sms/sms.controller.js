"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.SmsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var SmsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('SMS'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('sms'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _sendSms_decorators;
    var _getDriversForSms_decorators;
    var _sendToDrivers_decorators;
    var _getOrdersForSms_decorators;
    var _sendToOrders_decorators;
    var _getBlockedForSms_decorators;
    var _sendToBlocked_decorators;
    var _getAutoConfig_decorators;
    var _setAutoConfig_decorators;
    var _getAllPhones_decorators;
    var _sendToAll_decorators;
    var _getHistory_decorators;
    var _getStats_decorators;
    var _getDevices_decorators;
    var _getAccountInfo_decorators;
    var SmsController = _classThis = /** @class */ (function () {
        function SmsController_1(smsService) {
            this.smsService = (__runInitializers(this, _instanceExtraInitializers), smsService);
        }
        // ============================================================
        // GENERAL SMS
        // ============================================================
        SmsController_1.prototype.sendSms = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.sendSms(body.phone, body.message, {
                            sentById: req.user.userId,
                            category: body.category,
                            targetName: body.targetName,
                        })];
                });
            });
        };
        // ============================================================
        // DRIVERS SMS
        // ============================================================
        SmsController_1.prototype.getDriversForSms = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getDriversForSms()];
                });
            });
        };
        SmsController_1.prototype.sendToDrivers = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.sendToDrivers(body.message, req.user.userId, body.driverIds)];
                });
            });
        };
        // ============================================================
        // ORDERS SMS
        // ============================================================
        SmsController_1.prototype.getOrdersForSms = function (type, limit, search) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getOrdersForSms({
                            type: type,
                            limit: limit ? parseInt(limit) : 100,
                            search: search,
                        })];
                });
            });
        };
        SmsController_1.prototype.sendToOrders = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.sendToOrders(body.message, req.user.userId, body.orderIds)];
                });
            });
        };
        // ============================================================
        // BLOCKED ADS SMS
        // ============================================================
        SmsController_1.prototype.getBlockedForSms = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getBlockedUsersForSms()];
                });
            });
        };
        SmsController_1.prototype.sendToBlocked = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.sendToBlockedAds(body.message, req.user.userId, body.blockedUserIds)];
                });
            });
        };
        // ============================================================
        // AUTO-SMS CONFIG
        // ============================================================
        SmsController_1.prototype.getAutoConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getAutoSmsConfig()];
                });
            });
        };
        SmsController_1.prototype.setAutoConfig = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.setAutoSmsConfig(body)];
                });
            });
        };
        // ============================================================
        // HAMMAGA SMS
        // ============================================================
        SmsController_1.prototype.getAllPhones = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getAllPhones()];
                });
            });
        };
        SmsController_1.prototype.sendToAll = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.sendToAll(body.message, req.user.userId)];
                });
            });
        };
        // ============================================================
        // HISTORY & STATS
        // ============================================================
        SmsController_1.prototype.getHistory = function (page, limit, category, status, search) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getHistory({
                            page: page ? parseInt(page) : 1,
                            limit: limit ? parseInt(limit) : 50,
                            category: category,
                            status: status,
                            search: search,
                        })];
                });
            });
        };
        SmsController_1.prototype.getStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getStats()];
                });
            });
        };
        // ============================================================
        // SEMYSMS SETTINGS
        // ============================================================
        SmsController_1.prototype.getDevices = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getDevices()];
                });
            });
        };
        SmsController_1.prototype.getAccountInfo = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.smsService.getAccountInfo()];
                });
            });
        };
        return SmsController_1;
    }());
    __setFunctionName(_classThis, "SmsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _sendSms_decorators = [(0, common_1.Post)('send'), (0, swagger_1.ApiOperation)({ summary: 'Bitta SMS yuborish' })];
        _getDriversForSms_decorators = [(0, common_1.Get)('drivers/list'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchilar ro\'yxati (SMS uchun)' })];
        _sendToDrivers_decorators = [(0, common_1.Post)('drivers/send'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchilarga SMS yuborish' })];
        _getOrdersForSms_decorators = [(0, common_1.Get)('orders/list'), (0, swagger_1.ApiOperation)({ summary: 'Orderlar ro\'yxati (SMS uchun)' })];
        _sendToOrders_decorators = [(0, common_1.Post)('orders/send'), (0, swagger_1.ApiOperation)({ summary: 'Order telefon raqamlariga SMS yuborish' })];
        _getBlockedForSms_decorators = [(0, common_1.Get)('blocked/list'), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan foydalanuvchilar (SMS uchun)' })];
        _sendToBlocked_decorators = [(0, common_1.Post)('blocked/send'), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan foydalanuvchilarga SMS yuborish' })];
        _getAutoConfig_decorators = [(0, common_1.Get)('auto-config'), (0, swagger_1.ApiOperation)({ summary: 'Avto-SMS konfiguratsiya olish' })];
        _setAutoConfig_decorators = [(0, common_1.Post)('auto-config'), (0, swagger_1.ApiOperation)({ summary: 'Avto-SMS konfiguratsiya saqlash' })];
        _getAllPhones_decorators = [(0, common_1.Get)('all/list'), (0, swagger_1.ApiOperation)({ summary: 'Barcha noyob telefon raqamlari' })];
        _sendToAll_decorators = [(0, common_1.Post)('all/send'), (0, swagger_1.ApiOperation)({ summary: 'Barcha raqamlarga SMS yuborish' })];
        _getHistory_decorators = [(0, common_1.Get)('history'), (0, swagger_1.ApiOperation)({ summary: 'SMS tarixi' })];
        _getStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'SMS statistikasi' })];
        _getDevices_decorators = [(0, common_1.Get)('devices'), (0, swagger_1.ApiOperation)({ summary: 'SemySMS qurilmalar ro\'yxati' })];
        _getAccountInfo_decorators = [(0, common_1.Get)('account'), (0, swagger_1.ApiOperation)({ summary: 'SemySMS hisob ma\'lumotlari' })];
        __esDecorate(_classThis, null, _sendSms_decorators, { kind: "method", name: "sendSms", static: false, private: false, access: { has: function (obj) { return "sendSms" in obj; }, get: function (obj) { return obj.sendSms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDriversForSms_decorators, { kind: "method", name: "getDriversForSms", static: false, private: false, access: { has: function (obj) { return "getDriversForSms" in obj; }, get: function (obj) { return obj.getDriversForSms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToDrivers_decorators, { kind: "method", name: "sendToDrivers", static: false, private: false, access: { has: function (obj) { return "sendToDrivers" in obj; }, get: function (obj) { return obj.sendToDrivers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrdersForSms_decorators, { kind: "method", name: "getOrdersForSms", static: false, private: false, access: { has: function (obj) { return "getOrdersForSms" in obj; }, get: function (obj) { return obj.getOrdersForSms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToOrders_decorators, { kind: "method", name: "sendToOrders", static: false, private: false, access: { has: function (obj) { return "sendToOrders" in obj; }, get: function (obj) { return obj.sendToOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlockedForSms_decorators, { kind: "method", name: "getBlockedForSms", static: false, private: false, access: { has: function (obj) { return "getBlockedForSms" in obj; }, get: function (obj) { return obj.getBlockedForSms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToBlocked_decorators, { kind: "method", name: "sendToBlocked", static: false, private: false, access: { has: function (obj) { return "sendToBlocked" in obj; }, get: function (obj) { return obj.sendToBlocked; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAutoConfig_decorators, { kind: "method", name: "getAutoConfig", static: false, private: false, access: { has: function (obj) { return "getAutoConfig" in obj; }, get: function (obj) { return obj.getAutoConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setAutoConfig_decorators, { kind: "method", name: "setAutoConfig", static: false, private: false, access: { has: function (obj) { return "setAutoConfig" in obj; }, get: function (obj) { return obj.setAutoConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllPhones_decorators, { kind: "method", name: "getAllPhones", static: false, private: false, access: { has: function (obj) { return "getAllPhones" in obj; }, get: function (obj) { return obj.getAllPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToAll_decorators, { kind: "method", name: "sendToAll", static: false, private: false, access: { has: function (obj) { return "sendToAll" in obj; }, get: function (obj) { return obj.sendToAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: function (obj) { return "getHistory" in obj; }, get: function (obj) { return obj.getHistory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDevices_decorators, { kind: "method", name: "getDevices", static: false, private: false, access: { has: function (obj) { return "getDevices" in obj; }, get: function (obj) { return obj.getDevices; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAccountInfo_decorators, { kind: "method", name: "getAccountInfo", static: false, private: false, access: { has: function (obj) { return "getAccountInfo" in obj; }, get: function (obj) { return obj.getAccountInfo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SmsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SmsController = _classThis;
}();
exports.SmsController = SmsController;
