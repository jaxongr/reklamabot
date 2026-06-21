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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var DriversController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Drivers'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, common_1.Controller)('drivers')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getProfile_decorators;
    var _updateProfile_decorators;
    var _setOnlineStatus_decorators;
    var _updateLocation_decorators;
    var _getMyAcceptedOrders_decorators;
    var _getOrders_decorators;
    var _acceptTelegramOrder_decorators;
    var _updateTrackingStatus_decorators;
    var _getOrderById_decorators;
    var _createOffer_decorators;
    var _getOffers_decorators;
    var _getMyOffers_decorators;
    var _cancelOffer_decorators;
    var _getSubscriptionPlans_decorators;
    var _getMySubscription_decorators;
    var _purchaseSubscription_decorators;
    var _getAvailablePrivateOrders_decorators;
    var _acceptPrivateOrder_decorators;
    var _rejectPrivateOrder_decorators;
    var _getAllDrivers_decorators;
    var _getAvailableDrivers_decorators;
    var _getDriverStats_decorators;
    var _getOnlineDriversForMap_decorators;
    var _getAllPrivateOrders_decorators;
    var _createPrivateOrder_decorators;
    var _linkDriverToOrder_decorators;
    var _getDriverById_decorators;
    var _verifyDriver_decorators;
    var _updateBalance_decorators;
    var _toggleSubscription_decorators;
    var _adminUpdateProfile_decorators;
    var _generateReferralCode_decorators;
    var _processInvite_decorators;
    var _getInviteStats_decorators;
    var _uploadVehiclePhoto_decorators;
    var _getVehiclePhotos_decorators;
    var _getPendingPhotos_decorators;
    var _approvePhoto_decorators;
    var _rejectPhoto_decorators;
    var DriversController = _classThis = /** @class */ (function () {
        function DriversController_1(driversService) {
            this.driversService = (__runInitializers(this, _instanceExtraInitializers), driversService);
            this.logger = new common_1.Logger(DriversController.name);
        }
        // ============================================================
        // HAYDOVCHI O'Z PROFILI
        // ============================================================
        DriversController_1.prototype.getProfile = function (req) {
            return this.driversService.getProfile(req.user.userId);
        };
        DriversController_1.prototype.updateProfile = function (req, body) {
            return this.driversService.updateProfile(req.user.userId, body);
        };
        DriversController_1.prototype.setOnlineStatus = function (req, body) {
            return this.driversService.setOnlineStatus(req.user.userId, body.isOnline);
        };
        DriversController_1.prototype.updateLocation = function (req, body) {
            return this.driversService.updateLocation(req.user.userId, body.lat, body.lng);
        };
        // ============================================================
        // BUYURTMALAR (Telegram yuklar)
        // ============================================================
        DriversController_1.prototype.getMyAcceptedOrders = function (req, status) {
            return this.driversService.getMyAcceptedOrders(req.user.userId, status);
        };
        DriversController_1.prototype.getOrders = function (req, type, cargoFrom, cargoTo, page, limit, nearMe) {
            return this.driversService.getOrders(req.user.userId, {
                type: type,
                cargoFrom: cargoFrom,
                cargoTo: cargoTo,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                nearMe: nearMe === 'true',
            });
        };
        DriversController_1.prototype.acceptTelegramOrder = function (req, id) {
            return this.driversService.acceptTelegramOrder(req.user.userId, id);
        };
        DriversController_1.prototype.updateTrackingStatus = function (req, id, body) {
            return this.driversService.updateTrackingStatus(req.user.userId, id, body.status);
        };
        DriversController_1.prototype.getOrderById = function (id) {
            return this.driversService.getOrderById(id);
        };
        // ============================================================
        // TAKLIFLAR
        // ============================================================
        DriversController_1.prototype.createOffer = function (req, body) {
            return this.driversService.createOffer(req.user.userId, body);
        };
        DriversController_1.prototype.getOffers = function (status, fromCity, toCity, page, limit) {
            return this.driversService.getOffers({
                status: status,
                fromCity: fromCity,
                toCity: toCity,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
        };
        DriversController_1.prototype.getMyOffers = function (req) {
            return this.driversService.getMyOffers(req.user.userId);
        };
        DriversController_1.prototype.cancelOffer = function (req, id) {
            return this.driversService.cancelOffer(req.user.userId, id);
        };
        // ============================================================
        // OBUNA TIZIMI
        // ============================================================
        DriversController_1.prototype.getSubscriptionPlans = function () {
            return this.driversService.getDriverSubscriptionPlans();
        };
        DriversController_1.prototype.getMySubscription = function (req) {
            return this.driversService.getMySubscription(req.user.userId);
        };
        DriversController_1.prototype.purchaseSubscription = function (req, body) {
            return this.driversService.purchaseSubscription(req.user.userId, body.planType);
        };
        // ============================================================
        // MAXSUS BUYURTMALAR
        // ============================================================
        DriversController_1.prototype.getAvailablePrivateOrders = function (req) {
            return this.driversService.getAvailablePrivateOrders(req.user.userId);
        };
        DriversController_1.prototype.acceptPrivateOrder = function (req, id) {
            return this.driversService.acceptPrivateOrder(req.user.userId, id);
        };
        DriversController_1.prototype.rejectPrivateOrder = function (req, id) {
            return this.driversService.rejectPrivateOrder(req.user.userId, id);
        };
        // ============================================================
        // ADMIN ENDPOINTLAR — STATIC routes MUST come before :id
        // ============================================================
        DriversController_1.prototype.getAllDrivers = function (search, isOnline, isVerified, page, limit) {
            return this.driversService.getAllDrivers({
                search: search,
                isOnline: isOnline !== undefined ? isOnline === 'true' : undefined,
                isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
        };
        DriversController_1.prototype.getAvailableDrivers = function (cargoFrom) {
            return this.driversService.getAvailableDrivers(cargoFrom);
        };
        DriversController_1.prototype.getDriverStats = function () {
            return this.driversService.getDriverStats();
        };
        DriversController_1.prototype.getOnlineDriversForMap = function () {
            return this.driversService.getOnlineDriversForMap();
        };
        DriversController_1.prototype.getAllPrivateOrders = function (status, page, limit) {
            return this.driversService.getAllPrivateOrders({
                status: status,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
        };
        DriversController_1.prototype.createPrivateOrder = function (req, body) {
            return this.driversService.createPrivateOrder(__assign(__assign({}, body), { createdById: req.user.userId }));
        };
        DriversController_1.prototype.linkDriverToOrder = function (body) {
            return this.driversService.linkDriverToOrder(body.orderId, body.driverProfileId);
        };
        // ── Parameterized routes MUST come AFTER all static routes ──
        DriversController_1.prototype.getDriverById = function (id) {
            return this.driversService.getDriverById(id);
        };
        DriversController_1.prototype.verifyDriver = function (req, id) {
            return this.driversService.verifyDriver(id, req.user.userId);
        };
        DriversController_1.prototype.updateBalance = function (id, body) {
            return this.driversService.updateDriverBalance(id, body.amount, body.description);
        };
        DriversController_1.prototype.toggleSubscription = function (id, body) {
            return this.driversService.toggleSubscription(id, body.active, body.days);
        };
        DriversController_1.prototype.adminUpdateProfile = function (id, body) {
            return this.driversService.adminUpdateProfile(id, body);
        };
        // ============================================================
        // Task 9: TAKLIF TIZIMI
        // ============================================================
        DriversController_1.prototype.generateReferralCode = function (req) {
            return this.driversService.generateReferralCode(req.user.userId);
        };
        DriversController_1.prototype.processInvite = function (req, body) {
            return this.driversService.processInvite(body.code, req.user.userId);
        };
        DriversController_1.prototype.getInviteStats = function (req) {
            return this.driversService.getInviteStats(req.user.userId);
        };
        // ============================================================
        // Task 21: FOTOKONTROL
        // ============================================================
        DriversController_1.prototype.uploadVehiclePhoto = function (req, type, body) {
            return this.driversService.uploadVehiclePhoto(req.user.userId, type, body.url);
        };
        DriversController_1.prototype.getVehiclePhotos = function (req) {
            return this.driversService.getVehiclePhotos(req.user.userId);
        };
        DriversController_1.prototype.getPendingPhotos = function (page, limit) {
            return this.driversService.getPendingPhotos(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
        };
        DriversController_1.prototype.approvePhoto = function (id, req) {
            return this.driversService.approvePhoto(id, req.user.userId);
        };
        DriversController_1.prototype.rejectPhoto = function (id, body) {
            return this.driversService.rejectPhoto(id, body.reason);
        };
        return DriversController_1;
    }());
    __setFunctionName(_classThis, "DriversController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [(0, common_1.Get)('profile'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchi o\'z profilini olish' })];
        _updateProfile_decorators = [(0, common_1.Patch)('profile'), (0, swagger_1.ApiOperation)({ summary: 'Profil yangilash' })];
        _setOnlineStatus_decorators = [(0, common_1.Patch)('online'), (0, swagger_1.ApiOperation)({ summary: 'Online/Offline o\'zgartirish' })];
        _updateLocation_decorators = [(0, common_1.Patch)('location'), (0, swagger_1.ApiOperation)({ summary: 'GPS joylashuv yangilash' })];
        _getMyAcceptedOrders_decorators = [(0, common_1.Get)('orders/accepted'), (0, swagger_1.ApiOperation)({ summary: 'Qabul qilingan zakazlarim' })];
        _getOrders_decorators = [(0, common_1.Get)('orders'), (0, swagger_1.ApiOperation)({ summary: 'Telegram yuklar ro\'yxati' })];
        _acceptTelegramOrder_decorators = [(0, common_1.Post)('orders/:id/accept'), (0, swagger_1.ApiOperation)({ summary: 'Telegram zakazni qabul qilish' })];
        _updateTrackingStatus_decorators = [(0, common_1.Patch)('orders/:id/tracking'), (0, swagger_1.ApiOperation)({ summary: 'Treking status yangilash' })];
        _getOrderById_decorators = [(0, common_1.Get)('orders/:id'), (0, swagger_1.ApiOperation)({ summary: 'Bitta buyurtma' })];
        _createOffer_decorators = [(0, common_1.Post)('offers'), (0, swagger_1.ApiOperation)({ summary: 'Taklif yaratish' })];
        _getOffers_decorators = [(0, common_1.Get)('offers'), (0, swagger_1.ApiOperation)({ summary: 'Barcha takliflar' })];
        _getMyOffers_decorators = [(0, common_1.Get)('offers/my'), (0, swagger_1.ApiOperation)({ summary: 'O\'z takliflari' })];
        _cancelOffer_decorators = [(0, common_1.Delete)('offers/:id'), (0, swagger_1.ApiOperation)({ summary: 'Taklif bekor qilish' })];
        _getSubscriptionPlans_decorators = [(0, common_1.Get)('subscription/plans'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchi obuna rejalari' })];
        _getMySubscription_decorators = [(0, common_1.Get)('subscription/my'), (0, swagger_1.ApiOperation)({ summary: 'Mening obuna holatim' })];
        _purchaseSubscription_decorators = [(0, common_1.Post)('subscription/purchase'), (0, swagger_1.ApiOperation)({ summary: 'Obuna sotib olish' })];
        _getAvailablePrivateOrders_decorators = [(0, common_1.Get)('private-orders'), (0, swagger_1.ApiOperation)({ summary: 'Mavjud maxsus buyurtmalar' })];
        _acceptPrivateOrder_decorators = [(0, common_1.Post)('private-orders/:id/accept'), (0, swagger_1.ApiOperation)({ summary: 'Maxsus buyurtmani qabul qilish' })];
        _rejectPrivateOrder_decorators = [(0, common_1.Post)('private-orders/:id/reject'), (0, swagger_1.ApiOperation)({ summary: 'Maxsus buyurtmani rad etish' })];
        _getAllDrivers_decorators = [(0, common_1.Get)('admin/list'), (0, swagger_1.ApiOperation)({ summary: 'Barcha haydovchilar (admin)' })];
        _getAvailableDrivers_decorators = [(0, common_1.Get)('admin/available'), (0, swagger_1.ApiOperation)({ summary: 'Mavjud haydovchilar' })];
        _getDriverStats_decorators = [(0, common_1.Get)('admin/stats/overview'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchilar statistikasi' })];
        _getOnlineDriversForMap_decorators = [(0, common_1.Get)('admin/map/online'), (0, swagger_1.ApiOperation)({ summary: 'Online haydovchilar xaritada' })];
        _getAllPrivateOrders_decorators = [(0, common_1.Get)('admin/private-orders'), (0, swagger_1.ApiOperation)({ summary: 'Barcha maxsus buyurtmalar (admin)' })];
        _createPrivateOrder_decorators = [(0, common_1.Post)('admin/private-orders'), (0, swagger_1.ApiOperation)({ summary: 'Maxsus buyurtma yaratish (admin)' })];
        _linkDriverToOrder_decorators = [(0, common_1.Post)('admin/link-to-order'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchini buyurtmaga ulash' })];
        _getDriverById_decorators = [(0, common_1.Get)('admin/:id'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchi tafsilotlari (admin)' })];
        _verifyDriver_decorators = [(0, common_1.Post)('admin/:id/verify'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchini tasdiqlash' })];
        _updateBalance_decorators = [(0, common_1.Post)('admin/:id/balance'), (0, swagger_1.ApiOperation)({ summary: 'Balans o\'zgartirish' })];
        _toggleSubscription_decorators = [(0, common_1.Post)('admin/:id/subscription'), (0, swagger_1.ApiOperation)({ summary: 'Obuna berish/o\'chirish' })];
        _adminUpdateProfile_decorators = [(0, common_1.Patch)('admin/:id/profile'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchi profilini tahrirlash (admin)' })];
        _generateReferralCode_decorators = [(0, common_1.Post)('referral/generate'), (0, swagger_1.ApiOperation)({ summary: 'Taklif kodi yaratish' })];
        _processInvite_decorators = [(0, common_1.Post)('referral/use'), (0, swagger_1.ApiOperation)({ summary: 'Taklif kodini ishlatish' })];
        _getInviteStats_decorators = [(0, common_1.Get)('referral/stats'), (0, swagger_1.ApiOperation)({ summary: 'Taklif statistikasi' })];
        _uploadVehiclePhoto_decorators = [(0, common_1.Post)('photos/:type'), (0, swagger_1.ApiOperation)({ summary: 'Mashina fotosini yuklash' })];
        _getVehiclePhotos_decorators = [(0, common_1.Get)('photos'), (0, swagger_1.ApiOperation)({ summary: 'Mening fotolarim' })];
        _getPendingPhotos_decorators = [(0, common_1.Get)('admin/photos/pending'), (0, swagger_1.ApiOperation)({ summary: 'Tasdiqlanmagan fotolar (admin)' })];
        _approvePhoto_decorators = [(0, common_1.Patch)('admin/photos/:id/approve'), (0, swagger_1.ApiOperation)({ summary: 'Fotoni tasdiqlash' })];
        _rejectPhoto_decorators = [(0, common_1.Patch)('admin/photos/:id/reject'), (0, swagger_1.ApiOperation)({ summary: 'Fotoni rad etish' })];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: function (obj) { return "getProfile" in obj; }, get: function (obj) { return obj.getProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: function (obj) { return "updateProfile" in obj; }, get: function (obj) { return obj.updateProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setOnlineStatus_decorators, { kind: "method", name: "setOnlineStatus", static: false, private: false, access: { has: function (obj) { return "setOnlineStatus" in obj; }, get: function (obj) { return obj.setOnlineStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateLocation_decorators, { kind: "method", name: "updateLocation", static: false, private: false, access: { has: function (obj) { return "updateLocation" in obj; }, get: function (obj) { return obj.updateLocation; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyAcceptedOrders_decorators, { kind: "method", name: "getMyAcceptedOrders", static: false, private: false, access: { has: function (obj) { return "getMyAcceptedOrders" in obj; }, get: function (obj) { return obj.getMyAcceptedOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrders_decorators, { kind: "method", name: "getOrders", static: false, private: false, access: { has: function (obj) { return "getOrders" in obj; }, get: function (obj) { return obj.getOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptTelegramOrder_decorators, { kind: "method", name: "acceptTelegramOrder", static: false, private: false, access: { has: function (obj) { return "acceptTelegramOrder" in obj; }, get: function (obj) { return obj.acceptTelegramOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTrackingStatus_decorators, { kind: "method", name: "updateTrackingStatus", static: false, private: false, access: { has: function (obj) { return "updateTrackingStatus" in obj; }, get: function (obj) { return obj.updateTrackingStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderById_decorators, { kind: "method", name: "getOrderById", static: false, private: false, access: { has: function (obj) { return "getOrderById" in obj; }, get: function (obj) { return obj.getOrderById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOffer_decorators, { kind: "method", name: "createOffer", static: false, private: false, access: { has: function (obj) { return "createOffer" in obj; }, get: function (obj) { return obj.createOffer; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOffers_decorators, { kind: "method", name: "getOffers", static: false, private: false, access: { has: function (obj) { return "getOffers" in obj; }, get: function (obj) { return obj.getOffers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyOffers_decorators, { kind: "method", name: "getMyOffers", static: false, private: false, access: { has: function (obj) { return "getMyOffers" in obj; }, get: function (obj) { return obj.getMyOffers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelOffer_decorators, { kind: "method", name: "cancelOffer", static: false, private: false, access: { has: function (obj) { return "cancelOffer" in obj; }, get: function (obj) { return obj.cancelOffer; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscriptionPlans_decorators, { kind: "method", name: "getSubscriptionPlans", static: false, private: false, access: { has: function (obj) { return "getSubscriptionPlans" in obj; }, get: function (obj) { return obj.getSubscriptionPlans; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMySubscription_decorators, { kind: "method", name: "getMySubscription", static: false, private: false, access: { has: function (obj) { return "getMySubscription" in obj; }, get: function (obj) { return obj.getMySubscription; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _purchaseSubscription_decorators, { kind: "method", name: "purchaseSubscription", static: false, private: false, access: { has: function (obj) { return "purchaseSubscription" in obj; }, get: function (obj) { return obj.purchaseSubscription; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAvailablePrivateOrders_decorators, { kind: "method", name: "getAvailablePrivateOrders", static: false, private: false, access: { has: function (obj) { return "getAvailablePrivateOrders" in obj; }, get: function (obj) { return obj.getAvailablePrivateOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptPrivateOrder_decorators, { kind: "method", name: "acceptPrivateOrder", static: false, private: false, access: { has: function (obj) { return "acceptPrivateOrder" in obj; }, get: function (obj) { return obj.acceptPrivateOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rejectPrivateOrder_decorators, { kind: "method", name: "rejectPrivateOrder", static: false, private: false, access: { has: function (obj) { return "rejectPrivateOrder" in obj; }, get: function (obj) { return obj.rejectPrivateOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllDrivers_decorators, { kind: "method", name: "getAllDrivers", static: false, private: false, access: { has: function (obj) { return "getAllDrivers" in obj; }, get: function (obj) { return obj.getAllDrivers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAvailableDrivers_decorators, { kind: "method", name: "getAvailableDrivers", static: false, private: false, access: { has: function (obj) { return "getAvailableDrivers" in obj; }, get: function (obj) { return obj.getAvailableDrivers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDriverStats_decorators, { kind: "method", name: "getDriverStats", static: false, private: false, access: { has: function (obj) { return "getDriverStats" in obj; }, get: function (obj) { return obj.getDriverStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOnlineDriversForMap_decorators, { kind: "method", name: "getOnlineDriversForMap", static: false, private: false, access: { has: function (obj) { return "getOnlineDriversForMap" in obj; }, get: function (obj) { return obj.getOnlineDriversForMap; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllPrivateOrders_decorators, { kind: "method", name: "getAllPrivateOrders", static: false, private: false, access: { has: function (obj) { return "getAllPrivateOrders" in obj; }, get: function (obj) { return obj.getAllPrivateOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPrivateOrder_decorators, { kind: "method", name: "createPrivateOrder", static: false, private: false, access: { has: function (obj) { return "createPrivateOrder" in obj; }, get: function (obj) { return obj.createPrivateOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _linkDriverToOrder_decorators, { kind: "method", name: "linkDriverToOrder", static: false, private: false, access: { has: function (obj) { return "linkDriverToOrder" in obj; }, get: function (obj) { return obj.linkDriverToOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDriverById_decorators, { kind: "method", name: "getDriverById", static: false, private: false, access: { has: function (obj) { return "getDriverById" in obj; }, get: function (obj) { return obj.getDriverById; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyDriver_decorators, { kind: "method", name: "verifyDriver", static: false, private: false, access: { has: function (obj) { return "verifyDriver" in obj; }, get: function (obj) { return obj.verifyDriver; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBalance_decorators, { kind: "method", name: "updateBalance", static: false, private: false, access: { has: function (obj) { return "updateBalance" in obj; }, get: function (obj) { return obj.updateBalance; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleSubscription_decorators, { kind: "method", name: "toggleSubscription", static: false, private: false, access: { has: function (obj) { return "toggleSubscription" in obj; }, get: function (obj) { return obj.toggleSubscription; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _adminUpdateProfile_decorators, { kind: "method", name: "adminUpdateProfile", static: false, private: false, access: { has: function (obj) { return "adminUpdateProfile" in obj; }, get: function (obj) { return obj.adminUpdateProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateReferralCode_decorators, { kind: "method", name: "generateReferralCode", static: false, private: false, access: { has: function (obj) { return "generateReferralCode" in obj; }, get: function (obj) { return obj.generateReferralCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _processInvite_decorators, { kind: "method", name: "processInvite", static: false, private: false, access: { has: function (obj) { return "processInvite" in obj; }, get: function (obj) { return obj.processInvite; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInviteStats_decorators, { kind: "method", name: "getInviteStats", static: false, private: false, access: { has: function (obj) { return "getInviteStats" in obj; }, get: function (obj) { return obj.getInviteStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadVehiclePhoto_decorators, { kind: "method", name: "uploadVehiclePhoto", static: false, private: false, access: { has: function (obj) { return "uploadVehiclePhoto" in obj; }, get: function (obj) { return obj.uploadVehiclePhoto; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getVehiclePhotos_decorators, { kind: "method", name: "getVehiclePhotos", static: false, private: false, access: { has: function (obj) { return "getVehiclePhotos" in obj; }, get: function (obj) { return obj.getVehiclePhotos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPendingPhotos_decorators, { kind: "method", name: "getPendingPhotos", static: false, private: false, access: { has: function (obj) { return "getPendingPhotos" in obj; }, get: function (obj) { return obj.getPendingPhotos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _approvePhoto_decorators, { kind: "method", name: "approvePhoto", static: false, private: false, access: { has: function (obj) { return "approvePhoto" in obj; }, get: function (obj) { return obj.approvePhoto; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rejectPhoto_decorators, { kind: "method", name: "rejectPhoto", static: false, private: false, access: { has: function (obj) { return "rejectPhoto" in obj; }, get: function (obj) { return obj.rejectPhoto; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DriversController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DriversController = _classThis;
}();
exports.DriversController = DriversController;
