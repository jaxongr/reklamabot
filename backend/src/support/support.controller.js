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
exports.SupportController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var SupportController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Support'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('support'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createTicket_decorators;
    var _getUserTickets_decorators;
    var _getAllTickets_decorators;
    var _getTicketWithMessages_decorators;
    var _addMessage_decorators;
    var _updateTicketStatus_decorators;
    var SupportController = _classThis = /** @class */ (function () {
        function SupportController_1(supportService) {
            this.supportService = (__runInitializers(this, _instanceExtraInitializers), supportService);
        }
        SupportController_1.prototype.createTicket = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.supportService.createTicket(req.user.userId, body.subject, body.message)];
                });
            });
        };
        SupportController_1.prototype.getUserTickets = function (req, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.supportService.getUserTickets(req.user.userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        SupportController_1.prototype.getAllTickets = function (status, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.supportService.getAllTickets(status, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        SupportController_1.prototype.getTicketWithMessages = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.supportService.getTicketWithMessages(id)];
                });
            });
        };
        SupportController_1.prototype.addMessage = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                var role, isStaff;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    isStaff = role === 'ADMIN' || role === 'SUPER_ADMIN';
                    return [2 /*return*/, this.supportService.addMessage(id, req.user.userId, body.message, isStaff)];
                });
            });
        };
        SupportController_1.prototype.updateTicketStatus = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.supportService.updateTicketStatus(id, body.status)];
                });
            });
        };
        return SupportController_1;
    }());
    __setFunctionName(_classThis, "SupportController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createTicket_decorators = [(0, common_1.Post)('tickets'), (0, swagger_1.ApiOperation)({ summary: 'Tiket yaratish' })];
        _getUserTickets_decorators = [(0, common_1.Get)('tickets'), (0, swagger_1.ApiOperation)({ summary: 'Mening tiketlarim' })];
        _getAllTickets_decorators = [(0, common_1.Get)('tickets/all'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Barcha tiketlar (admin)' })];
        _getTicketWithMessages_decorators = [(0, common_1.Get)('tickets/:id'), (0, swagger_1.ApiOperation)({ summary: 'Tiket tafsilotlari' })];
        _addMessage_decorators = [(0, common_1.Post)('tickets/:id/messages'), (0, swagger_1.ApiOperation)({ summary: 'Tiketga javob' })];
        _updateTicketStatus_decorators = [(0, common_1.Patch)('tickets/:id/status'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Tiket statusini o\'zgartirish' })];
        __esDecorate(_classThis, null, _createTicket_decorators, { kind: "method", name: "createTicket", static: false, private: false, access: { has: function (obj) { return "createTicket" in obj; }, get: function (obj) { return obj.createTicket; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserTickets_decorators, { kind: "method", name: "getUserTickets", static: false, private: false, access: { has: function (obj) { return "getUserTickets" in obj; }, get: function (obj) { return obj.getUserTickets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllTickets_decorators, { kind: "method", name: "getAllTickets", static: false, private: false, access: { has: function (obj) { return "getAllTickets" in obj; }, get: function (obj) { return obj.getAllTickets; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTicketWithMessages_decorators, { kind: "method", name: "getTicketWithMessages", static: false, private: false, access: { has: function (obj) { return "getTicketWithMessages" in obj; }, get: function (obj) { return obj.getTicketWithMessages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addMessage_decorators, { kind: "method", name: "addMessage", static: false, private: false, access: { has: function (obj) { return "addMessage" in obj; }, get: function (obj) { return obj.addMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTicketStatus_decorators, { kind: "method", name: "updateTicketStatus", static: false, private: false, access: { has: function (obj) { return "updateTicketStatus" in obj; }, get: function (obj) { return obj.updateTicketStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SupportController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SupportController = _classThis;
}();
exports.SupportController = SupportController;
