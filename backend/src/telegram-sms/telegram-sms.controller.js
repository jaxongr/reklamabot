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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramSmsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var TelegramSmsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Telegram SMS'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('telegram-sms'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getSessions_decorators;
    var _sendCode_decorators;
    var _signIn_decorators;
    var _toggleSession_decorators;
    var _reconnectSession_decorators;
    var _checkSpam_decorators;
    var _deleteSession_decorators;
    var _getDriverTargets_decorators;
    var _getOrderTargets_decorators;
    var _getBlockedTargets_decorators;
    var _getAllTargets_decorators;
    var _sendToAll_decorators;
    var _sendDm_decorators;
    var _sendToDrivers_decorators;
    var _sendToOrders_decorators;
    var _sendToBlocked_decorators;
    var _getHistory_decorators;
    var _getStats_decorators;
    var _getAutoConfig_decorators;
    var _setAutoConfig_decorators;
    var TelegramSmsController = _classThis = /** @class */ (function () {
        function TelegramSmsController_1(tgSmsService) {
            this.tgSmsService = (__runInitializers(this, _instanceExtraInitializers), tgSmsService);
        }
        // ============================================================
        // SESSION MANAGEMENT
        // ============================================================
        TelegramSmsController_1.prototype.getSessions = function () {
            return this.tgSmsService.getSessions();
        };
        TelegramSmsController_1.prototype.sendCode = function (body) {
            return this.tgSmsService.sendCode(body.phone, body.name);
        };
        TelegramSmsController_1.prototype.signIn = function (id, body) {
            return this.tgSmsService.signIn(id, body.code, body.password);
        };
        TelegramSmsController_1.prototype.toggleSession = function (id, body) {
            return this.tgSmsService.toggleSession(id, body.enabled);
        };
        TelegramSmsController_1.prototype.reconnectSession = function (id) {
            return this.tgSmsService.reconnectSession(id);
        };
        TelegramSmsController_1.prototype.checkSpam = function (id) {
            return this.tgSmsService.checkSpamStatus(id);
        };
        TelegramSmsController_1.prototype.deleteSession = function (id) {
            return this.tgSmsService.deleteSession(id);
        };
        // ============================================================
        // TARGET LISTS (ro'yxatlar — SMS uchun)
        // ============================================================
        TelegramSmsController_1.prototype.getDriverTargets = function () {
            return this.tgSmsService.getDriverTargets();
        };
        TelegramSmsController_1.prototype.getOrderTargets = function (type, search, limit) {
            return this.tgSmsService.getOrderTargets({ type: type, search: search, limit: limit ? parseInt(limit) : 100 });
        };
        TelegramSmsController_1.prototype.getBlockedTargets = function () {
            return this.tgSmsService.getBlockedTargets();
        };
        TelegramSmsController_1.prototype.getAllTargets = function () {
            return this.tgSmsService.getAllTargets();
        };
        // ============================================================
        // SENDING MESSAGES
        // ============================================================
        TelegramSmsController_1.prototype.sendToAll = function (req, body) {
            return this.tgSmsService.sendToAll(body.message, req.user.userId);
        };
        TelegramSmsController_1.prototype.sendDm = function (req, body) {
            return this.tgSmsService.sendDm(body.targetTelegramId, body.message, {
                category: body.category,
                sentById: req.user.userId,
                targetName: body.targetName,
                targetPhone: body.targetPhone,
                targetUsername: body.targetUsername,
            });
        };
        TelegramSmsController_1.prototype.sendToDrivers = function (req, body) {
            return this.tgSmsService.sendToDrivers(body.message, req.user.userId, body.driverIds);
        };
        TelegramSmsController_1.prototype.sendToOrders = function (req, body) {
            return this.tgSmsService.sendToOrders(body.message, req.user.userId, body.orderIds);
        };
        TelegramSmsController_1.prototype.sendToBlocked = function (req, body) {
            return this.tgSmsService.sendToBlocked(body.message, req.user.userId, body.blockedIds);
        };
        // ============================================================
        // HISTORY & STATS
        // ============================================================
        TelegramSmsController_1.prototype.getHistory = function (page, limit, category, status, sessionId, search) {
            return this.tgSmsService.getHistory({
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 50,
                category: category,
                status: status,
                sessionId: sessionId,
                search: search,
            });
        };
        TelegramSmsController_1.prototype.getStats = function () {
            return this.tgSmsService.getStats();
        };
        // ============================================================
        // AUTO CONFIG
        // ============================================================
        TelegramSmsController_1.prototype.getAutoConfig = function () {
            return this.tgSmsService.getAutoConfig();
        };
        TelegramSmsController_1.prototype.setAutoConfig = function (body) {
            return this.tgSmsService.setAutoConfig(body);
        };
        return TelegramSmsController_1;
    }());
    __setFunctionName(_classThis, "TelegramSmsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getSessions_decorators = [(0, common_1.Get)('sessions'), (0, swagger_1.ApiOperation)({ summary: 'TG SMS sessionlar ro\'yxati' })];
        _sendCode_decorators = [(0, common_1.Post)('sessions/send-code'), (0, swagger_1.ApiOperation)({ summary: 'Yangi session uchun kod yuborish' })];
        _signIn_decorators = [(0, common_1.Post)('sessions/:id/sign-in'), (0, swagger_1.ApiOperation)({ summary: 'Session kod bilan kirish' })];
        _toggleSession_decorators = [(0, common_1.Patch)('sessions/:id/toggle'), (0, swagger_1.ApiOperation)({ summary: 'Sessionni yoqish/o\'chirish' })];
        _reconnectSession_decorators = [(0, common_1.Post)('sessions/:id/reconnect'), (0, swagger_1.ApiOperation)({ summary: 'Sessionni qayta ulash' })];
        _checkSpam_decorators = [(0, common_1.Post)('sessions/:id/check-spam'), (0, swagger_1.ApiOperation)({ summary: 'SpamBot tekshirish' })];
        _deleteSession_decorators = [(0, common_1.Delete)('sessions/:id'), (0, swagger_1.ApiOperation)({ summary: 'Sessionni o\'chirish' })];
        _getDriverTargets_decorators = [(0, common_1.Get)('targets/drivers'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchilar ro\'yxati (TG SMS uchun)' })];
        _getOrderTargets_decorators = [(0, common_1.Get)('targets/orders'), (0, swagger_1.ApiOperation)({ summary: 'Orderlar ro\'yxati (TG SMS uchun)' })];
        _getBlockedTargets_decorators = [(0, common_1.Get)('targets/blocked'), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan foydalanuvchilar (TG SMS uchun)' })];
        _getAllTargets_decorators = [(0, common_1.Get)('targets/all'), (0, swagger_1.ApiOperation)({ summary: 'Barcha TG foydalanuvchilar' })];
        _sendToAll_decorators = [(0, common_1.Post)('send/all'), (0, swagger_1.ApiOperation)({ summary: 'Barchaga TG xabar' })];
        _sendDm_decorators = [(0, common_1.Post)('send'), (0, swagger_1.ApiOperation)({ summary: 'Bitta xabar yuborish' })];
        _sendToDrivers_decorators = [(0, common_1.Post)('send/drivers'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchilarga TG xabar' })];
        _sendToOrders_decorators = [(0, common_1.Post)('send/orders'), (0, swagger_1.ApiOperation)({ summary: 'Order egalariga TG xabar' })];
        _sendToBlocked_decorators = [(0, common_1.Post)('send/blocked'), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan foydalanuvchilarga TG xabar' })];
        _getHistory_decorators = [(0, common_1.Get)('history'), (0, swagger_1.ApiOperation)({ summary: 'Xabar tarixi' })];
        _getStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'TG SMS statistikasi' })];
        _getAutoConfig_decorators = [(0, common_1.Get)('auto-config'), (0, swagger_1.ApiOperation)({ summary: 'Avto TG SMS konfiguratsiya' })];
        _setAutoConfig_decorators = [(0, common_1.Post)('auto-config'), (0, swagger_1.ApiOperation)({ summary: 'Avto TG SMS konfiguratsiya saqlash' })];
        __esDecorate(_classThis, null, _getSessions_decorators, { kind: "method", name: "getSessions", static: false, private: false, access: { has: function (obj) { return "getSessions" in obj; }, get: function (obj) { return obj.getSessions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendCode_decorators, { kind: "method", name: "sendCode", static: false, private: false, access: { has: function (obj) { return "sendCode" in obj; }, get: function (obj) { return obj.sendCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _signIn_decorators, { kind: "method", name: "signIn", static: false, private: false, access: { has: function (obj) { return "signIn" in obj; }, get: function (obj) { return obj.signIn; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleSession_decorators, { kind: "method", name: "toggleSession", static: false, private: false, access: { has: function (obj) { return "toggleSession" in obj; }, get: function (obj) { return obj.toggleSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _reconnectSession_decorators, { kind: "method", name: "reconnectSession", static: false, private: false, access: { has: function (obj) { return "reconnectSession" in obj; }, get: function (obj) { return obj.reconnectSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _checkSpam_decorators, { kind: "method", name: "checkSpam", static: false, private: false, access: { has: function (obj) { return "checkSpam" in obj; }, get: function (obj) { return obj.checkSpam; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteSession_decorators, { kind: "method", name: "deleteSession", static: false, private: false, access: { has: function (obj) { return "deleteSession" in obj; }, get: function (obj) { return obj.deleteSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDriverTargets_decorators, { kind: "method", name: "getDriverTargets", static: false, private: false, access: { has: function (obj) { return "getDriverTargets" in obj; }, get: function (obj) { return obj.getDriverTargets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrderTargets_decorators, { kind: "method", name: "getOrderTargets", static: false, private: false, access: { has: function (obj) { return "getOrderTargets" in obj; }, get: function (obj) { return obj.getOrderTargets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlockedTargets_decorators, { kind: "method", name: "getBlockedTargets", static: false, private: false, access: { has: function (obj) { return "getBlockedTargets" in obj; }, get: function (obj) { return obj.getBlockedTargets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllTargets_decorators, { kind: "method", name: "getAllTargets", static: false, private: false, access: { has: function (obj) { return "getAllTargets" in obj; }, get: function (obj) { return obj.getAllTargets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToAll_decorators, { kind: "method", name: "sendToAll", static: false, private: false, access: { has: function (obj) { return "sendToAll" in obj; }, get: function (obj) { return obj.sendToAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendDm_decorators, { kind: "method", name: "sendDm", static: false, private: false, access: { has: function (obj) { return "sendDm" in obj; }, get: function (obj) { return obj.sendDm; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToDrivers_decorators, { kind: "method", name: "sendToDrivers", static: false, private: false, access: { has: function (obj) { return "sendToDrivers" in obj; }, get: function (obj) { return obj.sendToDrivers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToOrders_decorators, { kind: "method", name: "sendToOrders", static: false, private: false, access: { has: function (obj) { return "sendToOrders" in obj; }, get: function (obj) { return obj.sendToOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendToBlocked_decorators, { kind: "method", name: "sendToBlocked", static: false, private: false, access: { has: function (obj) { return "sendToBlocked" in obj; }, get: function (obj) { return obj.sendToBlocked; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHistory_decorators, { kind: "method", name: "getHistory", static: false, private: false, access: { has: function (obj) { return "getHistory" in obj; }, get: function (obj) { return obj.getHistory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAutoConfig_decorators, { kind: "method", name: "getAutoConfig", static: false, private: false, access: { has: function (obj) { return "getAutoConfig" in obj; }, get: function (obj) { return obj.getAutoConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setAutoConfig_decorators, { kind: "method", name: "setAutoConfig", static: false, private: false, access: { has: function (obj) { return "setAutoConfig" in obj; }, get: function (obj) { return obj.setAutoConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TelegramSmsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TelegramSmsController = _classThis;
}();
exports.TelegramSmsController = TelegramSmsController;
