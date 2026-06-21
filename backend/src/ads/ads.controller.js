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
exports.AdsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var swagger_1 = require("@nestjs/swagger");
var AdsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Ads'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('ads'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _getDashboardStats_decorators;
    var _getClosedAds_decorators;
    var _createManualClosed_decorators;
    var _findOne_decorators;
    var _getStatistics_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _publish_decorators;
    var _pause_decorators;
    var _close_decorators;
    var _duplicate_decorators;
    var AdsController = _classThis = /** @class */ (function () {
        function AdsController_1(adsService) {
            this.adsService = (__runInitializers(this, _instanceExtraInitializers), adsService);
        }
        AdsController_1.prototype.create = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.create(req.user.userId, body)];
                });
            });
        };
        AdsController_1.prototype.findAll = function (req, skip, take, status, search, isPriority) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.findAll(req.user.userId, {
                            skip: skip,
                            take: take,
                            status: status,
                            search: search,
                            isPriority: isPriority === 'true' ? true : isPriority === 'false' ? false : undefined,
                        })];
                });
            });
        };
        AdsController_1.prototype.getDashboardStats = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.getDashboardStats(req.user.userId)];
                });
            });
        };
        AdsController_1.prototype.getClosedAds = function (req, skip, take, search, cargoType, startDate, endDate) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.findClosed({ skip: skip, take: take, search: search, cargoType: cargoType, startDate: startDate, endDate: endDate })];
                });
            });
        };
        AdsController_1.prototype.createManualClosed = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.createManualClosed(req.user.userId, body)];
                });
            });
        };
        AdsController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.findOne(id)];
                });
            });
        };
        AdsController_1.prototype.getStatistics = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.getStatistics(id)];
                });
            });
        };
        AdsController_1.prototype.update = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.update(id, req.user.userId, body)];
                });
            });
        };
        AdsController_1.prototype.remove = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.remove(id, req.user.userId)];
                });
            });
        };
        AdsController_1.prototype.publish = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.publish(id, req.user.userId)];
                });
            });
        };
        AdsController_1.prototype.pause = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.pause(id, req.user.userId)];
                });
            });
        };
        AdsController_1.prototype.close = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.close(id, req.user.userId, body)];
                });
            });
        };
        AdsController_1.prototype.duplicate = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.adsService.duplicate(id, req.user.userId)];
                });
            });
        };
        return AdsController_1;
    }());
    __setFunctionName(_classThis, "AdsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Create new ad' })];
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get ads list with pagination' })];
        _getDashboardStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'Get dashboard stats' })];
        _getClosedAds_decorators = [(0, common_1.Get)('closed/list'), (0, swagger_1.ApiOperation)({ summary: 'Yopilgan yuklar ro\'yxati' })];
        _createManualClosed_decorators = [(0, common_1.Post)('closed/manual'), (0, swagger_1.ApiOperation)({ summary: 'Qo\'lda yopilgan yuk kiritish' })];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Get single ad' })];
        _getStatistics_decorators = [(0, common_1.Get)(':id/statistics'), (0, swagger_1.ApiOperation)({ summary: 'Get ad statistics' })];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Update ad' })];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Delete ad (archive)' })];
        _publish_decorators = [(0, common_1.Post)(':id/publish'), (0, swagger_1.ApiOperation)({ summary: 'Publish ad' })];
        _pause_decorators = [(0, common_1.Post)(':id/pause'), (0, swagger_1.ApiOperation)({ summary: 'Pause ad' })];
        _close_decorators = [(0, common_1.Post)(':id/close'), (0, swagger_1.ApiOperation)({ summary: 'Close ad' })];
        _duplicate_decorators = [(0, common_1.Post)(':id/duplicate'), (0, swagger_1.ApiOperation)({ summary: 'Duplicate ad' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDashboardStats_decorators, { kind: "method", name: "getDashboardStats", static: false, private: false, access: { has: function (obj) { return "getDashboardStats" in obj; }, get: function (obj) { return obj.getDashboardStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getClosedAds_decorators, { kind: "method", name: "getClosedAds", static: false, private: false, access: { has: function (obj) { return "getClosedAds" in obj; }, get: function (obj) { return obj.getClosedAds; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createManualClosed_decorators, { kind: "method", name: "createManualClosed", static: false, private: false, access: { has: function (obj) { return "createManualClosed" in obj; }, get: function (obj) { return obj.createManualClosed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatistics_decorators, { kind: "method", name: "getStatistics", static: false, private: false, access: { has: function (obj) { return "getStatistics" in obj; }, get: function (obj) { return obj.getStatistics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publish_decorators, { kind: "method", name: "publish", static: false, private: false, access: { has: function (obj) { return "publish" in obj; }, get: function (obj) { return obj.publish; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _pause_decorators, { kind: "method", name: "pause", static: false, private: false, access: { has: function (obj) { return "pause" in obj; }, get: function (obj) { return obj.pause; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: function (obj) { return "close" in obj; }, get: function (obj) { return obj.close; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _duplicate_decorators, { kind: "method", name: "duplicate", static: false, private: false, access: { has: function (obj) { return "duplicate" in obj; }, get: function (obj) { return obj.duplicate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdsController = _classThis;
}();
exports.AdsController = AdsController;
