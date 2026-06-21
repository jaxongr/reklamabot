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
exports.ChatController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var ChatController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Chat'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('chat'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getUserRooms_decorators;
    var _getAllRooms_decorators;
    var _createRoom_decorators;
    var _getOrCreateSupportRoom_decorators;
    var _getRoomMessages_decorators;
    var _sendMessage_decorators;
    var ChatController = _classThis = /** @class */ (function () {
        function ChatController_1(chatService) {
            this.chatService = (__runInitializers(this, _instanceExtraInitializers), chatService);
        }
        ChatController_1.prototype.getUserRooms = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.getUserRooms(req.user.userId)];
                });
            });
        };
        ChatController_1.prototype.getAllRooms = function (type, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.getAllRooms(type, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        ChatController_1.prototype.createRoom = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.createRoom(body.name, body.type, body.participantIds)];
                });
            });
        };
        ChatController_1.prototype.getOrCreateSupportRoom = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.getOrCreateSupportRoom(req.user.userId, body.type)];
                });
            });
        };
        ChatController_1.prototype.getRoomMessages = function (id, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.getRoomMessages(id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50)];
                });
            });
        };
        ChatController_1.prototype.sendMessage = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.chatService.sendMessage(id, req.user.userId, body.message)];
                });
            });
        };
        return ChatController_1;
    }());
    __setFunctionName(_classThis, "ChatController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getUserRooms_decorators = [(0, common_1.Get)('rooms'), (0, swagger_1.ApiOperation)({ summary: 'Mening xonalarim' })];
        _getAllRooms_decorators = [(0, common_1.Get)('rooms/all'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), (0, swagger_1.ApiOperation)({ summary: 'Barcha xonalar (admin)' })];
        _createRoom_decorators = [(0, common_1.Post)('rooms'), (0, swagger_1.ApiOperation)({ summary: 'Xona yaratish' })];
        _getOrCreateSupportRoom_decorators = [(0, common_1.Post)('rooms/support'), (0, swagger_1.ApiOperation)({ summary: 'Support xonasi olish/yaratish' })];
        _getRoomMessages_decorators = [(0, common_1.Get)('rooms/:id/messages'), (0, swagger_1.ApiOperation)({ summary: 'Xona xabarlari' })];
        _sendMessage_decorators = [(0, common_1.Post)('rooms/:id/messages'), (0, swagger_1.ApiOperation)({ summary: 'Xabar yuborish' })];
        __esDecorate(_classThis, null, _getUserRooms_decorators, { kind: "method", name: "getUserRooms", static: false, private: false, access: { has: function (obj) { return "getUserRooms" in obj; }, get: function (obj) { return obj.getUserRooms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllRooms_decorators, { kind: "method", name: "getAllRooms", static: false, private: false, access: { has: function (obj) { return "getAllRooms" in obj; }, get: function (obj) { return obj.getAllRooms; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createRoom_decorators, { kind: "method", name: "createRoom", static: false, private: false, access: { has: function (obj) { return "createRoom" in obj; }, get: function (obj) { return obj.createRoom; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOrCreateSupportRoom_decorators, { kind: "method", name: "getOrCreateSupportRoom", static: false, private: false, access: { has: function (obj) { return "getOrCreateSupportRoom" in obj; }, get: function (obj) { return obj.getOrCreateSupportRoom; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRoomMessages_decorators, { kind: "method", name: "getRoomMessages", static: false, private: false, access: { has: function (obj) { return "getRoomMessages" in obj; }, get: function (obj) { return obj.getRoomMessages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendMessage_decorators, { kind: "method", name: "sendMessage", static: false, private: false, access: { has: function (obj) { return "sendMessage" in obj; }, get: function (obj) { return obj.sendMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChatController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChatController = _classThis;
}();
exports.ChatController = ChatController;
