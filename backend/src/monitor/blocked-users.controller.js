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
exports.BlockedUsersController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var swagger_1 = require("@nestjs/swagger");
var BlockedUsersController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Blocked Users'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('blocked-users'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getBlockedUsers_decorators;
    var _getStats_decorators;
    var _blockUser_decorators;
    var _unblock_decorators;
    var _getWhitelist_decorators;
    var _addToWhitelist_decorators;
    var _removeFromWhitelist_decorators;
    var BlockedUsersController = _classThis = /** @class */ (function () {
        function BlockedUsersController_1(filterService) {
            this.filterService = (__runInitializers(this, _instanceExtraInitializers), filterService);
        }
        BlockedUsersController_1.prototype.getBlockedUsers = function (req, page, limit, search, reason) {
            return __awaiter(this, void 0, void 0, function () {
                var role, canSeeAll;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
                    return [2 /*return*/, this.filterService.getBlockedUsers({
                            userId: canSeeAll ? undefined : req.user.userId,
                            page: page ? parseInt(page) : 1,
                            limit: limit ? parseInt(limit) : 20,
                            search: search,
                            reason: reason,
                        })];
                });
            });
        };
        BlockedUsersController_1.prototype.getStats = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var role, canSeeAll;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
                    return [2 /*return*/, this.filterService.getBlockStats(canSeeAll ? undefined : req.user.userId)];
                });
            });
        };
        BlockedUsersController_1.prototype.blockUser = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filterService.manualBlock({
                            userId: req.user.userId,
                            senderTelegramId: body.senderTelegramId,
                            senderName: body.senderName,
                            senderUsername: body.senderUsername,
                            phone: body.phone,
                            messageText: body.messageText || '',
                            groupTitle: body.groupTitle || '',
                            groupTelegramId: body.groupTelegramId || '',
                        })];
                });
            });
        };
        BlockedUsersController_1.prototype.unblock = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filterService.unblockUser(id)];
                });
            });
        };
        BlockedUsersController_1.prototype.getWhitelist = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filterService.getWhitelistEntries(req.user.userId)];
                });
            });
        };
        BlockedUsersController_1.prototype.addToWhitelist = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filterService.addToWhitelist(body.entry)];
                });
            });
        };
        BlockedUsersController_1.prototype.removeFromWhitelist = function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.filterService.removeFromWhitelist(entry)];
                });
            });
        };
        return BlockedUsersController_1;
    }());
    __setFunctionName(_classThis, "BlockedUsersController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getBlockedUsers_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan foydalanuvchilar ro\'yxati' })];
        _getStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'Bloklash statistikasi' })];
        _blockUser_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Foydalanuvchini qo\'lda bloklash (orderdan)' })];
        _unblock_decorators = [(0, common_1.Patch)(':id/unblock'), (0, swagger_1.ApiOperation)({ summary: 'Foydalanuvchini blokdan chiqarish' })];
        _getWhitelist_decorators = [(0, common_1.Get)('whitelist'), (0, swagger_1.ApiOperation)({ summary: 'Oq ro\'yxatni olish' })];
        _addToWhitelist_decorators = [(0, common_1.Post)('whitelist'), (0, swagger_1.ApiOperation)({ summary: 'Oq ro\'yxatga qo\'shish' })];
        _removeFromWhitelist_decorators = [(0, common_1.Delete)('whitelist/:entry'), (0, swagger_1.ApiOperation)({ summary: 'Oq ro\'yxatdan o\'chirish' })];
        __esDecorate(_classThis, null, _getBlockedUsers_decorators, { kind: "method", name: "getBlockedUsers", static: false, private: false, access: { has: function (obj) { return "getBlockedUsers" in obj; }, get: function (obj) { return obj.getBlockedUsers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _blockUser_decorators, { kind: "method", name: "blockUser", static: false, private: false, access: { has: function (obj) { return "blockUser" in obj; }, get: function (obj) { return obj.blockUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unblock_decorators, { kind: "method", name: "unblock", static: false, private: false, access: { has: function (obj) { return "unblock" in obj; }, get: function (obj) { return obj.unblock; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWhitelist_decorators, { kind: "method", name: "getWhitelist", static: false, private: false, access: { has: function (obj) { return "getWhitelist" in obj; }, get: function (obj) { return obj.getWhitelist; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addToWhitelist_decorators, { kind: "method", name: "addToWhitelist", static: false, private: false, access: { has: function (obj) { return "addToWhitelist" in obj; }, get: function (obj) { return obj.addToWhitelist; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _removeFromWhitelist_decorators, { kind: "method", name: "removeFromWhitelist", static: false, private: false, access: { has: function (obj) { return "removeFromWhitelist" in obj; }, get: function (obj) { return obj.removeFromWhitelist; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BlockedUsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BlockedUsersController = _classThis;
}();
exports.BlockedUsersController = BlockedUsersController;
