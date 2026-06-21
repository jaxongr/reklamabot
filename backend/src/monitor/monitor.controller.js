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
exports.MonitorController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var swagger_1 = require("@nestjs/swagger");
var MonitorController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Monitor'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('monitor'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getSessions_decorators;
    var _getSession_decorators;
    var _sendCode_decorators;
    var _signIn_decorators;
    var _deleteSession_decorators;
    var _getStats_decorators;
    var _getSessionStatus_decorators;
    var _syncGroups_decorators;
    var _getPriorityGroups_decorators;
    var _addPriorityGroup_decorators;
    var _removePriorityGroup_decorators;
    var MonitorController = _classThis = /** @class */ (function () {
        function MonitorController_1(monitorService) {
            this.monitorService = (__runInitializers(this, _instanceExtraInitializers), monitorService);
        }
        MonitorController_1.prototype.getSessions = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.getSessions(req.user.userId)];
                });
            });
        };
        MonitorController_1.prototype.getSession = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.getSession(id)];
                });
            });
        };
        MonitorController_1.prototype.sendCode = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.sendCode(req.user.userId, body.phone, body.name)];
                });
            });
        };
        MonitorController_1.prototype.signIn = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.signIn(id, body.code, body.password)];
                });
            });
        };
        MonitorController_1.prototype.deleteSession = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.deleteSession(id)];
                });
            });
        };
        MonitorController_1.prototype.getStats = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.getStats(req.user.userId)];
                });
            });
        };
        MonitorController_1.prototype.getSessionStatus = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            connected: this.monitorService.isConnected(id),
                            hasPendingAuth: this.monitorService.hasPendingAuth(id),
                        }];
                });
            });
        };
        MonitorController_1.prototype.syncGroups = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.manualSyncGroups(id)];
                });
            });
        };
        // ===== PRIORITY GURUHLAR =====
        MonitorController_1.prototype.getPriorityGroups = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.getPriorityGroupsList()];
                });
            });
        };
        MonitorController_1.prototype.addPriorityGroup = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.addPriorityGroup(body.groupTelegramId)];
                });
            });
        };
        MonitorController_1.prototype.removePriorityGroup = function (groupTelegramId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.monitorService.removePriorityGroup(groupTelegramId)];
                });
            });
        };
        return MonitorController_1;
    }());
    __setFunctionName(_classThis, "MonitorController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getSessions_decorators = [(0, common_1.Get)('sessions'), (0, swagger_1.ApiOperation)({ summary: 'Kuzatuv sessionlarini olish' })];
        _getSession_decorators = [(0, common_1.Get)('sessions/:id'), (0, swagger_1.ApiOperation)({ summary: 'Bitta kuzatuv sessionini olish' })];
        _sendCode_decorators = [(0, common_1.Post)('sessions/send-code'), (0, swagger_1.ApiOperation)({ summary: 'Kuzatuv session uchun kod yuborish' })];
        _signIn_decorators = [(0, common_1.Post)('sessions/:id/sign-in'), (0, swagger_1.ApiOperation)({ summary: 'Kuzatuv session sign in' })];
        _deleteSession_decorators = [(0, common_1.Delete)('sessions/:id'), (0, swagger_1.ApiOperation)({ summary: "Kuzatuv sessionni o'chirish" })];
        _getStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'Kuzatuv statistikasi' })];
        _getSessionStatus_decorators = [(0, common_1.Get)('sessions/:id/status'), (0, swagger_1.ApiOperation)({ summary: 'Session ulanish holati' })];
        _syncGroups_decorators = [(0, common_1.Post)('sessions/:id/sync-groups'), (0, swagger_1.ApiOperation)({ summary: "Guruhlarni qo'lda sinxronlash" })];
        _getPriorityGroups_decorators = [(0, common_1.Get)('priority-groups'), (0, swagger_1.ApiOperation)({ summary: 'Asosiy guruhlar ro\'yxati' })];
        _addPriorityGroup_decorators = [(0, common_1.Post)('priority-groups'), (0, swagger_1.ApiOperation)({ summary: 'Asosiy guruhga qo\'shish' })];
        _removePriorityGroup_decorators = [(0, common_1.Delete)('priority-groups/:groupTelegramId'), (0, swagger_1.ApiOperation)({ summary: 'Asosiy guruhdan o\'chirish' })];
        __esDecorate(_classThis, null, _getSessions_decorators, { kind: "method", name: "getSessions", static: false, private: false, access: { has: function (obj) { return "getSessions" in obj; }, get: function (obj) { return obj.getSessions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSession_decorators, { kind: "method", name: "getSession", static: false, private: false, access: { has: function (obj) { return "getSession" in obj; }, get: function (obj) { return obj.getSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendCode_decorators, { kind: "method", name: "sendCode", static: false, private: false, access: { has: function (obj) { return "sendCode" in obj; }, get: function (obj) { return obj.sendCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _signIn_decorators, { kind: "method", name: "signIn", static: false, private: false, access: { has: function (obj) { return "signIn" in obj; }, get: function (obj) { return obj.signIn; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteSession_decorators, { kind: "method", name: "deleteSession", static: false, private: false, access: { has: function (obj) { return "deleteSession" in obj; }, get: function (obj) { return obj.deleteSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSessionStatus_decorators, { kind: "method", name: "getSessionStatus", static: false, private: false, access: { has: function (obj) { return "getSessionStatus" in obj; }, get: function (obj) { return obj.getSessionStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _syncGroups_decorators, { kind: "method", name: "syncGroups", static: false, private: false, access: { has: function (obj) { return "syncGroups" in obj; }, get: function (obj) { return obj.syncGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPriorityGroups_decorators, { kind: "method", name: "getPriorityGroups", static: false, private: false, access: { has: function (obj) { return "getPriorityGroups" in obj; }, get: function (obj) { return obj.getPriorityGroups; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addPriorityGroup_decorators, { kind: "method", name: "addPriorityGroup", static: false, private: false, access: { has: function (obj) { return "addPriorityGroup" in obj; }, get: function (obj) { return obj.addPriorityGroup; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _removePriorityGroup_decorators, { kind: "method", name: "removePriorityGroup", static: false, private: false, access: { has: function (obj) { return "removePriorityGroup" in obj; }, get: function (obj) { return obj.removePriorityGroup; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MonitorController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MonitorController = _classThis;
}();
exports.MonitorController = MonitorController;
