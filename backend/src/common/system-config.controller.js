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
exports.SystemConfigController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var public_decorator_1 = require("../auth/decorators/public.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var SystemConfigController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Config'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('config'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getPaymentCards_decorators;
    var _updatePaymentCards_decorators;
    var _getSubscriptionPlans_decorators;
    var _updateSubscriptionPlans_decorators;
    var _getFilterRules_decorators;
    var _setFilterRules_decorators;
    var _getGlobalFilterRules_decorators;
    var _setGlobalFilterRules_decorators;
    var _getConfig_decorators;
    var _setConfig_decorators;
    var SystemConfigController = _classThis = /** @class */ (function () {
        function SystemConfigController_1(configService) {
            this.configService = (__runInitializers(this, _instanceExtraInitializers), configService);
        }
        SystemConfigController_1.prototype.getPaymentCards = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.configService.getPaymentCards()];
                });
            });
        };
        SystemConfigController_1.prototype.updatePaymentCards = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.setPaymentCards(body.cards)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.getSubscriptionPlans = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.configService.getSubscriptionPlans()];
                });
            });
        };
        SystemConfigController_1.prototype.updateSubscriptionPlans = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.setSubscriptionPlans(body.plans)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.getFilterRules = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var userRules, globalRules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.getFilterRules(req.user.userId)];
                        case 1:
                            userRules = _a.sent();
                            if (userRules)
                                return [2 /*return*/, userRules];
                            return [4 /*yield*/, this.configService.getFilterRules()];
                        case 2:
                            globalRules = _a.sent();
                            return [2 /*return*/, globalRules || {
                                    keywords: [],
                                    excludeKeywords: [],
                                    enabled: false,
                                }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.setFilterRules = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.setFilterRules(body, req.user.userId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.getGlobalFilterRules = function () {
            return __awaiter(this, void 0, void 0, function () {
                var rules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.getFilterRules()];
                        case 1:
                            rules = _a.sent();
                            return [2 /*return*/, rules || {
                                    keywords: [],
                                    excludeKeywords: [],
                                    enabled: false,
                                }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.setGlobalFilterRules = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.setFilterRules(body)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { success: true }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.getConfig = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.configService.get(key)];
                        case 1:
                            value = _a.sent();
                            return [2 /*return*/, { key: key, value: value }];
                    }
                });
            });
        };
        SystemConfigController_1.prototype.setConfig = function (key, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.configService.set(key, body.value, body.type, body.description)];
                });
            });
        };
        return SystemConfigController_1;
    }());
    __setFunctionName(_classThis, "SystemConfigController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getPaymentCards_decorators = [(0, common_1.Get)('payment-cards'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: "To'lov kartalarini olish" })];
        _updatePaymentCards_decorators = [(0, common_1.Put)('payment-cards'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: "To'lov kartalarini yangilash (admin)" })];
        _getSubscriptionPlans_decorators = [(0, common_1.Get)('subscription-plans'), (0, public_decorator_1.Public)(), (0, swagger_1.ApiOperation)({ summary: 'Obuna tariflarini olish' })];
        _updateSubscriptionPlans_decorators = [(0, common_1.Put)('subscription-plans'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Obuna tariflarini yangilash (admin)' })];
        _getFilterRules_decorators = [(0, common_1.Get)('filter-rules'), (0, swagger_1.ApiOperation)({ summary: 'Filtr qoidalarini olish' })];
        _setFilterRules_decorators = [(0, common_1.Put)('filter-rules'), (0, swagger_1.ApiOperation)({ summary: 'Filtr qoidalarini saqlash' })];
        _getGlobalFilterRules_decorators = [(0, common_1.Get)('filter-rules/global'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Global filtr qoidalarini olish (admin)' })];
        _setGlobalFilterRules_decorators = [(0, common_1.Put)('filter-rules/global'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Global filtr qoidalarini saqlash (admin)' })];
        _getConfig_decorators = [(0, common_1.Get)(':key'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Config olish (admin)' })];
        _setConfig_decorators = [(0, common_1.Put)(':key'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Config saqlash (admin)' })];
        __esDecorate(_classThis, null, _getPaymentCards_decorators, { kind: "method", name: "getPaymentCards", static: false, private: false, access: { has: function (obj) { return "getPaymentCards" in obj; }, get: function (obj) { return obj.getPaymentCards; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePaymentCards_decorators, { kind: "method", name: "updatePaymentCards", static: false, private: false, access: { has: function (obj) { return "updatePaymentCards" in obj; }, get: function (obj) { return obj.updatePaymentCards; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscriptionPlans_decorators, { kind: "method", name: "getSubscriptionPlans", static: false, private: false, access: { has: function (obj) { return "getSubscriptionPlans" in obj; }, get: function (obj) { return obj.getSubscriptionPlans; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateSubscriptionPlans_decorators, { kind: "method", name: "updateSubscriptionPlans", static: false, private: false, access: { has: function (obj) { return "updateSubscriptionPlans" in obj; }, get: function (obj) { return obj.updateSubscriptionPlans; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFilterRules_decorators, { kind: "method", name: "getFilterRules", static: false, private: false, access: { has: function (obj) { return "getFilterRules" in obj; }, get: function (obj) { return obj.getFilterRules; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setFilterRules_decorators, { kind: "method", name: "setFilterRules", static: false, private: false, access: { has: function (obj) { return "setFilterRules" in obj; }, get: function (obj) { return obj.setFilterRules; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getGlobalFilterRules_decorators, { kind: "method", name: "getGlobalFilterRules", static: false, private: false, access: { has: function (obj) { return "getGlobalFilterRules" in obj; }, get: function (obj) { return obj.getGlobalFilterRules; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setGlobalFilterRules_decorators, { kind: "method", name: "setGlobalFilterRules", static: false, private: false, access: { has: function (obj) { return "setGlobalFilterRules" in obj; }, get: function (obj) { return obj.setGlobalFilterRules; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConfig_decorators, { kind: "method", name: "getConfig", static: false, private: false, access: { has: function (obj) { return "getConfig" in obj; }, get: function (obj) { return obj.getConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setConfig_decorators, { kind: "method", name: "setConfig", static: false, private: false, access: { has: function (obj) { return "setConfig" in obj; }, get: function (obj) { return obj.setConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SystemConfigController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SystemConfigController = _classThis;
}();
exports.SystemConfigController = SystemConfigController;
