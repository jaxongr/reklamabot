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
exports.SessionsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var swagger_1 = require("@nestjs/swagger");
var public_decorator_1 = require("../auth/decorators/public.decorator");
var SessionsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Sessions'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('sessions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _getConnectionStatus_decorators;
    var _findOne_decorators;
    var _create_decorators;
    var _sendCode_decorators;
    var _signIn_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _syncGroups_decorators;
    var _freeze_decorators;
    var _unfreeze_decorators;
    var _getGroups_decorators;
    var _getPriorityGroups_decorators;
    var _addGroup_decorators;
    var _batchAddGroups_decorators;
    var _getStatistics_decorators;
    var SessionsController = _classThis = /** @class */ (function () {
        function SessionsController_1(sessionsService, telegramService) {
            this.sessionsService = (__runInitializers(this, _instanceExtraInitializers), sessionsService);
            this.telegramService = telegramService;
        }
        SessionsController_1.prototype.findAll = function (req, status, includeFrozen) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.findAll(req.user.userId, {
                            status: status,
                            includeFrozen: includeFrozen === 'true' ? true : includeFrozen === 'false' ? false : undefined,
                        })];
                });
            });
        };
        SessionsController_1.prototype.getConnectionStatus = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var sessions, sessionData, sessionIds;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sessionsService.findAll(req.user.userId, {})];
                        case 1:
                            sessions = _a.sent();
                            sessionData = Array.isArray(sessions) ? sessions : sessions.data || [];
                            sessionIds = sessionData.map(function (s) { return s.id; });
                            return [2 /*return*/, this.telegramService.checkAllSessionConnections(sessionIds)];
                    }
                });
            });
        };
        SessionsController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.findOne(id)];
                });
            });
        };
        SessionsController_1.prototype.create = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.create(__assign(__assign({}, body), { user: { connect: { id: req.user.userId } } }))];
                });
            });
        };
        // ============================================================
        // SESSION AUTH (Telegram auth flow)
        // ============================================================
        SessionsController_1.prototype.sendCode = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.telegramService.sendCode(req.user.userId, body.phone, body.name)];
                });
            });
        };
        SessionsController_1.prototype.signIn = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.telegramService.signIn(id, body.code || '', body.password)];
                });
            });
        };
        SessionsController_1.prototype.update = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.update(id, body)];
                });
            });
        };
        SessionsController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.remove(id)];
                });
            });
        };
        SessionsController_1.prototype.syncGroups = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var session, count;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sessionsService.findOne(id)];
                        case 1:
                            session = _a.sent();
                            if (session.isFrozen) {
                                throw new common_1.BadRequestException('Sessiya muzlatilgan. Avval eritib oling.');
                            }
                            if (!!this.telegramService.isClientConnected(id)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.telegramService.connectSession(id)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.telegramService.syncGroups(id)];
                        case 4:
                            count = _a.sent();
                            return [2 /*return*/, { success: true, totalGroups: count }];
                    }
                });
            });
        };
        SessionsController_1.prototype.freeze = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            if (!this.telegramService.isClientConnected(id)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.telegramService.disconnectSession(id)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4: 
                        // DB da muzlatish
                        return [2 /*return*/, this.sessionsService.markFrozen(id, body.unfreezeAt ? new Date(body.unfreezeAt) : undefined)];
                    }
                });
            });
        };
        SessionsController_1.prototype.unfreeze = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.unfreeze(id)];
                });
            });
        };
        SessionsController_1.prototype.getGroups = function (id, active, priority, skip) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.getGroups(id, {
                            active: active === 'true' ? true : active === 'false' ? false : undefined,
                            priority: priority === 'true' ? true : priority === 'false' ? false : undefined,
                            skip: skip === 'true' ? true : skip === 'false' ? false : undefined,
                        })];
                });
            });
        };
        SessionsController_1.prototype.getPriorityGroups = function (id, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.getPriorityGroups(id, limit ? parseInt(limit) : 50)];
                });
            });
        };
        SessionsController_1.prototype.addGroup = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.addGroup(__assign(__assign({}, body), { session: { connect: { id: id } } }))];
                });
            });
        };
        SessionsController_1.prototype.batchAddGroups = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.batchAddGroups(id, body.groups)];
                });
            });
        };
        SessionsController_1.prototype.getStatistics = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.sessionsService.getStatistics(id)];
                });
            });
        };
        return SessionsController_1;
    }());
    __setFunctionName(_classThis, "SessionsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get user sessions' })];
        _getConnectionStatus_decorators = [(0, common_1.Get)('connection-status'), (0, swagger_1.ApiOperation)({ summary: 'Check all sessions connection status' })];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Get single session' })];
        _create_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Create new session' })];
        _sendCode_decorators = [(0, common_1.Post)('send-code'), (0, swagger_1.ApiOperation)({ summary: 'Send Telegram auth code for new session' })];
        _signIn_decorators = [(0, common_1.Post)(':id/sign-in'), (0, swagger_1.ApiOperation)({ summary: 'Sign in to Telegram session with code/password' })];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Update session' })];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Delete session' })];
        _syncGroups_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)(':id/sync'), (0, swagger_1.ApiOperation)({ summary: 'Sync session groups from Telegram' })];
        _freeze_decorators = [(0, common_1.Post)(':id/freeze'), (0, swagger_1.ApiOperation)({ summary: 'Freeze session' })];
        _unfreeze_decorators = [(0, common_1.Post)(':id/unfreeze'), (0, swagger_1.ApiOperation)({ summary: 'Unfreeze session' })];
        _getGroups_decorators = [(0, common_1.Get)(':id/groups'), (0, swagger_1.ApiOperation)({ summary: 'Get session groups' })];
        _getPriorityGroups_decorators = [(0, common_1.Get)(':id/groups/priority'), (0, swagger_1.ApiOperation)({ summary: 'Get priority groups' })];
        _addGroup_decorators = [(0, common_1.Post)(':id/groups'), (0, swagger_1.ApiOperation)({ summary: 'Add group to session' })];
        _batchAddGroups_decorators = [(0, common_1.Post)(':id/groups/batch'), (0, swagger_1.ApiOperation)({ summary: 'Batch add groups' })];
        _getStatistics_decorators = [(0, common_1.Get)(':id/statistics'), (0, swagger_1.ApiOperation)({ summary: 'Get session statistics' })];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConnectionStatus_decorators, { kind: "method", name: "getConnectionStatus", static: false, private: false, access: { has: function (obj) { return "getConnectionStatus" in obj; }, get: function (obj) { return obj.getConnectionStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendCode_decorators, { kind: "method", name: "sendCode", static: false, private: false, access: { has: function (obj) { return "sendCode" in obj; }, get: function (obj) { return obj.sendCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _signIn_decorators, { kind: "method", name: "signIn", static: false, private: false, access: { has: function (obj) { return "signIn" in obj; }, get: function (obj) { return obj.signIn; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _syncGroups_decorators, { kind: "method", name: "syncGroups", static: false, private: false, access: { has: function (obj) { return "syncGroups" in obj; }, get: function (obj) { return obj.syncGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _freeze_decorators, { kind: "method", name: "freeze", static: false, private: false, access: { has: function (obj) { return "freeze" in obj; }, get: function (obj) { return obj.freeze; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unfreeze_decorators, { kind: "method", name: "unfreeze", static: false, private: false, access: { has: function (obj) { return "unfreeze" in obj; }, get: function (obj) { return obj.unfreeze; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getGroups_decorators, { kind: "method", name: "getGroups", static: false, private: false, access: { has: function (obj) { return "getGroups" in obj; }, get: function (obj) { return obj.getGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPriorityGroups_decorators, { kind: "method", name: "getPriorityGroups", static: false, private: false, access: { has: function (obj) { return "getPriorityGroups" in obj; }, get: function (obj) { return obj.getPriorityGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addGroup_decorators, { kind: "method", name: "addGroup", static: false, private: false, access: { has: function (obj) { return "addGroup" in obj; }, get: function (obj) { return obj.addGroup; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _batchAddGroups_decorators, { kind: "method", name: "batchAddGroups", static: false, private: false, access: { has: function (obj) { return "batchAddGroups" in obj; }, get: function (obj) { return obj.batchAddGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatistics_decorators, { kind: "method", name: "getStatistics", static: false, private: false, access: { has: function (obj) { return "getStatistics" in obj; }, get: function (obj) { return obj.getStatistics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SessionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SessionsController = _classThis;
}();
exports.SessionsController = SessionsController;
