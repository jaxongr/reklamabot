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
exports.AnalyticsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var AnalyticsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Analytics'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('analytics'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getDashboardStats_decorators;
    var _getUserStats_decorators;
    var _getAdStats_decorators;
    var _getPostStats_decorators;
    var _getRevenueStats_decorators;
    var _getTopRoutes_decorators;
    var _getVehicleTypeStats_decorators;
    var _getDayRouteAnalytics_decorators;
    var _getTopGroups_decorators;
    var _getGroupCalendar_decorators;
    var _getTopPhones_decorators;
    var _getSessionStats_decorators;
    var _getSenderRetention_decorators;
    var _getSpamPhones_decorators;
    var _getGroupEfficiency_decorators;
    var _estimatePrice_decorators;
    var _getSurgeRoutes_decorators;
    var _checkSurge_decorators;
    var _exportData_decorators;
    var AnalyticsController = _classThis = /** @class */ (function () {
        function AnalyticsController_1(analyticsService, routeAnalyticsService, priceEstimationService, surgePricingService, exportService) {
            this.analyticsService = (__runInitializers(this, _instanceExtraInitializers), analyticsService);
            this.routeAnalyticsService = routeAnalyticsService;
            this.priceEstimationService = priceEstimationService;
            this.surgePricingService = surgePricingService;
            this.exportService = exportService;
        }
        AnalyticsController_1.prototype.getDashboardStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, dashboard, trends;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.analyticsService.getDashboardStats(),
                                this.analyticsService.getGrowthTrends(startDate, endDate),
                            ])];
                        case 1:
                            _a = _b.sent(), dashboard = _a[0], trends = _a[1];
                            return [2 /*return*/, __assign(__assign({}, dashboard), { trends: trends })];
                    }
                });
            });
        };
        AnalyticsController_1.prototype.getUserStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.analyticsService.getUserStats(startDate, endDate)];
                });
            });
        };
        AnalyticsController_1.prototype.getAdStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.analyticsService.getAdStats(startDate, endDate)];
                });
            });
        };
        AnalyticsController_1.prototype.getPostStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.analyticsService.getPostStats(startDate, endDate)];
                });
            });
        };
        AnalyticsController_1.prototype.getRevenueStats = function (startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.analyticsService.getRevenueStats(startDate, endDate)];
                });
            });
        };
        // Task 3: Yo'nalish analitikasi
        AnalyticsController_1.prototype.getTopRoutes = function (dateFrom, dateTo, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getTopRoutes(dateFrom, dateTo, limit ? parseInt(limit) : 20)];
                });
            });
        };
        // Task 6: Mashina turi statistikasi
        AnalyticsController_1.prototype.getVehicleTypeStats = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getVehicleTypeStats(dateFrom, dateTo)];
                });
            });
        };
        // Task 7: Kun-yo'nalish analitikasi (heatmap)
        AnalyticsController_1.prototype.getDayRouteAnalytics = function (dateFrom, dateTo, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getDayRouteAnalytics(dateFrom, dateTo, limit ? parseInt(limit) : 15)];
                });
            });
        };
        // Top guruhlar
        AnalyticsController_1.prototype.getTopGroups = function (dateFrom, dateTo, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getTopGroups(dateFrom, dateTo, limit ? parseInt(limit) : 30)];
                });
            });
        };
        // Guruh kalendar
        AnalyticsController_1.prototype.getGroupCalendar = function (groupTelegramId, dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getGroupCalendar(groupTelegramId, dateFrom, dateTo)];
                });
            });
        };
        // Top telefon raqamlar
        AnalyticsController_1.prototype.getTopPhones = function (dateFrom, dateTo, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getTopPhones(dateFrom, dateTo, limit ? parseInt(limit) : 30)];
                });
            });
        };
        // Session samaradorligi
        AnalyticsController_1.prototype.getSessionStats = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getSessionStats(dateFrom, dateTo)];
                });
            });
        };
        // Yangi vs qaytgan
        AnalyticsController_1.prototype.getSenderRetention = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getSenderRetention(dateFrom, dateTo)];
                });
            });
        };
        // Spam deteksiya
        AnalyticsController_1.prototype.getSpamPhones = function (dateFrom, dateTo, minOrders) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getSpamPhones(dateFrom, dateTo, minOrders ? parseInt(minOrders) : 5)];
                });
            });
        };
        // Guruh qiymati/samaradorligi
        AnalyticsController_1.prototype.getGroupEfficiency = function (dateFrom, dateTo, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.routeAnalyticsService.getGroupEfficiency(dateFrom, dateTo, limit ? parseInt(limit) : 50)];
                });
            });
        };
        // Task 11: Narx taxmini
        AnalyticsController_1.prototype.estimatePrice = function (fromCity, toCity, vehicleType) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.priceEstimationService.estimatePrice(fromCity, toCity, vehicleType)];
                });
            });
        };
        // Task 12: Surge yo'nalishlar
        AnalyticsController_1.prototype.getSurgeRoutes = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.surgePricingService.getSurgeRoutes()];
                });
            });
        };
        AnalyticsController_1.prototype.checkSurge = function (fromCity, toCity) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.surgePricingService.checkSurge(fromCity, toCity)];
                });
            });
        };
        // Task 8: Eksport
        AnalyticsController_1.prototype.exportData = function (entity, dateFrom, dateTo, res) {
            return __awaiter(this, void 0, void 0, function () {
                var data, filename, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = entity;
                            switch (_a) {
                                case 'orders': return [3 /*break*/, 1];
                                case 'drivers': return [3 /*break*/, 3];
                                case 'offers': return [3 /*break*/, 5];
                                case 'payments': return [3 /*break*/, 7];
                            }
                            return [3 /*break*/, 9];
                        case 1: return [4 /*yield*/, this.exportService.exportOrders(dateFrom, dateTo)];
                        case 2:
                            data = _b.sent();
                            filename = 'buyurtmalar';
                            return [3 /*break*/, 10];
                        case 3: return [4 /*yield*/, this.exportService.exportDrivers(dateFrom, dateTo)];
                        case 4:
                            data = _b.sent();
                            filename = 'haydovchilar';
                            return [3 /*break*/, 10];
                        case 5: return [4 /*yield*/, this.exportService.exportOffers(dateFrom, dateTo)];
                        case 6:
                            data = _b.sent();
                            filename = 'takliflar';
                            return [3 /*break*/, 10];
                        case 7: return [4 /*yield*/, this.exportService.exportPayments(dateFrom, dateTo)];
                        case 8:
                            data = _b.sent();
                            filename = 'tolovlar';
                            return [3 /*break*/, 10];
                        case 9:
                            data = [];
                            filename = 'data';
                            _b.label = 10;
                        case 10:
                            // JSON qaytarish — frontend CSV/XLSX ga konvert qiladi
                            res.setHeader('Content-Type', 'application/json');
                            res.setHeader('Content-Disposition', "attachment; filename=".concat(filename, ".json"));
                            return [2 /*return*/, res.json(data)];
                    }
                });
            });
        };
        return AnalyticsController_1;
    }());
    __setFunctionName(_classThis, "AnalyticsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getDashboardStats_decorators = [(0, common_1.Get)('dashboard'), (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' })];
        _getUserStats_decorators = [(0, common_1.Get)('users'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Get user analytics' })];
        _getAdStats_decorators = [(0, common_1.Get)('ads'), (0, swagger_1.ApiOperation)({ summary: 'Get ad analytics' })];
        _getPostStats_decorators = [(0, common_1.Get)('posts'), (0, swagger_1.ApiOperation)({ summary: 'Get post analytics' })];
        _getRevenueStats_decorators = [(0, common_1.Get)('revenue'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Get revenue analytics' })];
        _getTopRoutes_decorators = [(0, common_1.Get)('routes'), (0, swagger_1.ApiOperation)({ summary: "Top yo'nalishlar" })];
        _getVehicleTypeStats_decorators = [(0, common_1.Get)('vehicle-types'), (0, swagger_1.ApiOperation)({ summary: 'Mashina turi statistikasi' })];
        _getDayRouteAnalytics_decorators = [(0, common_1.Get)('day-routes'), (0, swagger_1.ApiOperation)({ summary: "Kun-yo'nalish analitikasi" })];
        _getTopGroups_decorators = [(0, common_1.Get)('top-groups'), (0, swagger_1.ApiOperation)({ summary: 'Top guruhlar statistikasi' })];
        _getGroupCalendar_decorators = [(0, common_1.Get)('group-calendar'), (0, swagger_1.ApiOperation)({ summary: 'Guruh orderlari kalendar bo\'yicha' })];
        _getTopPhones_decorators = [(0, common_1.Get)('top-phones'), (0, swagger_1.ApiOperation)({ summary: 'Top telefon raqamlar' })];
        _getSessionStats_decorators = [(0, common_1.Get)('session-stats'), (0, swagger_1.ApiOperation)({ summary: 'Kuzatuv session statistikasi' })];
        _getSenderRetention_decorators = [(0, common_1.Get)('sender-retention'), (0, swagger_1.ApiOperation)({ summary: 'Yangi vs qaytgan yuboruvchilar' })];
        _getSpamPhones_decorators = [(0, common_1.Get)('spam-phones'), (0, swagger_1.ApiOperation)({ summary: 'Spam raqamlar' })];
        _getGroupEfficiency_decorators = [(0, common_1.Get)('group-efficiency'), (0, swagger_1.ApiOperation)({ summary: 'Guruh samaradorligi' })];
        _estimatePrice_decorators = [(0, common_1.Get)('price-estimate'), (0, swagger_1.ApiOperation)({ summary: 'Narx taxmini' })];
        _getSurgeRoutes_decorators = [(0, common_1.Get)('surge'), (0, swagger_1.ApiOperation)({ summary: "Surge yo'nalishlar" })];
        _checkSurge_decorators = [(0, common_1.Get)('surge/check'), (0, swagger_1.ApiOperation)({ summary: "Surge tekshirish" })];
        _exportData_decorators = [(0, common_1.Get)('export/:entity'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: "Ma'lumot eksport" })];
        __esDecorate(_classThis, null, _getDashboardStats_decorators, { kind: "method", name: "getDashboardStats", static: false, private: false, access: { has: function (obj) { return "getDashboardStats" in obj; }, get: function (obj) { return obj.getDashboardStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserStats_decorators, { kind: "method", name: "getUserStats", static: false, private: false, access: { has: function (obj) { return "getUserStats" in obj; }, get: function (obj) { return obj.getUserStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAdStats_decorators, { kind: "method", name: "getAdStats", static: false, private: false, access: { has: function (obj) { return "getAdStats" in obj; }, get: function (obj) { return obj.getAdStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPostStats_decorators, { kind: "method", name: "getPostStats", static: false, private: false, access: { has: function (obj) { return "getPostStats" in obj; }, get: function (obj) { return obj.getPostStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRevenueStats_decorators, { kind: "method", name: "getRevenueStats", static: false, private: false, access: { has: function (obj) { return "getRevenueStats" in obj; }, get: function (obj) { return obj.getRevenueStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTopRoutes_decorators, { kind: "method", name: "getTopRoutes", static: false, private: false, access: { has: function (obj) { return "getTopRoutes" in obj; }, get: function (obj) { return obj.getTopRoutes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVehicleTypeStats_decorators, { kind: "method", name: "getVehicleTypeStats", static: false, private: false, access: { has: function (obj) { return "getVehicleTypeStats" in obj; }, get: function (obj) { return obj.getVehicleTypeStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDayRouteAnalytics_decorators, { kind: "method", name: "getDayRouteAnalytics", static: false, private: false, access: { has: function (obj) { return "getDayRouteAnalytics" in obj; }, get: function (obj) { return obj.getDayRouteAnalytics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTopGroups_decorators, { kind: "method", name: "getTopGroups", static: false, private: false, access: { has: function (obj) { return "getTopGroups" in obj; }, get: function (obj) { return obj.getTopGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getGroupCalendar_decorators, { kind: "method", name: "getGroupCalendar", static: false, private: false, access: { has: function (obj) { return "getGroupCalendar" in obj; }, get: function (obj) { return obj.getGroupCalendar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTopPhones_decorators, { kind: "method", name: "getTopPhones", static: false, private: false, access: { has: function (obj) { return "getTopPhones" in obj; }, get: function (obj) { return obj.getTopPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSessionStats_decorators, { kind: "method", name: "getSessionStats", static: false, private: false, access: { has: function (obj) { return "getSessionStats" in obj; }, get: function (obj) { return obj.getSessionStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSenderRetention_decorators, { kind: "method", name: "getSenderRetention", static: false, private: false, access: { has: function (obj) { return "getSenderRetention" in obj; }, get: function (obj) { return obj.getSenderRetention; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSpamPhones_decorators, { kind: "method", name: "getSpamPhones", static: false, private: false, access: { has: function (obj) { return "getSpamPhones" in obj; }, get: function (obj) { return obj.getSpamPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getGroupEfficiency_decorators, { kind: "method", name: "getGroupEfficiency", static: false, private: false, access: { has: function (obj) { return "getGroupEfficiency" in obj; }, get: function (obj) { return obj.getGroupEfficiency; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _estimatePrice_decorators, { kind: "method", name: "estimatePrice", static: false, private: false, access: { has: function (obj) { return "estimatePrice" in obj; }, get: function (obj) { return obj.estimatePrice; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSurgeRoutes_decorators, { kind: "method", name: "getSurgeRoutes", static: false, private: false, access: { has: function (obj) { return "getSurgeRoutes" in obj; }, get: function (obj) { return obj.getSurgeRoutes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkSurge_decorators, { kind: "method", name: "checkSurge", static: false, private: false, access: { has: function (obj) { return "checkSurge" in obj; }, get: function (obj) { return obj.checkSurge; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportData_decorators, { kind: "method", name: "exportData", static: false, private: false, access: { has: function (obj) { return "exportData" in obj; }, get: function (obj) { return obj.exportData; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsController = _classThis;
}();
exports.AnalyticsController = AnalyticsController;
