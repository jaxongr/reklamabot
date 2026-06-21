"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.PermissionsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var PermissionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PermissionsService = _classThis = /** @class */ (function () {
        function PermissionsService_1(prisma, redis) {
            this.prisma = prisma;
            this.redis = redis;
            this.logger = new common_1.Logger(PermissionsService.name);
        }
        /**
         * Task 24: Ruxsatlarni olish
         */
        PermissionsService_1.prototype.getPermissions = function (role) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, where, permissions, matrix, _i, permissions_1, p, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cacheKey = "permissions:".concat(role || 'all');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            where = {};
                            if (role)
                                where.role = role;
                            return [4 /*yield*/, this.prisma.rolePermission.findMany({
                                    where: where,
                                    orderBy: [{ role: 'asc' }, { section: 'asc' }, { action: 'asc' }],
                                })];
                        case 5:
                            permissions = _c.sent();
                            matrix = {};
                            for (_i = 0, permissions_1 = permissions; _i < permissions_1.length; _i++) {
                                p = permissions_1[_i];
                                if (!matrix[p.role])
                                    matrix[p.role] = {};
                                if (!matrix[p.role][p.section])
                                    matrix[p.role][p.section] = [];
                                matrix[p.role][p.section].push(p.action);
                            }
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, matrix, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, matrix];
                    }
                });
            });
        };
        /**
         * Ruxsat tekshirish
         */
        PermissionsService_1.prototype.hasPermission = function (role, section, action) {
            return __awaiter(this, void 0, void 0, function () {
                var cacheKey, cached, _a, perm, result, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            // SUPER_ADMIN va ADMIN hamma narsaga ruxsat
                            if (role === 'SUPER_ADMIN' || role === 'ADMIN')
                                return [2 /*return*/, true];
                            cacheKey = "perm:".concat(role, ":").concat(section, ":").concat(action);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.redis.get(cacheKey)];
                        case 2:
                            cached = _c.sent();
                            if (cached !== null && cached !== undefined)
                                return [2 /*return*/, cached];
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _c.sent();
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this.prisma.rolePermission.findUnique({
                                where: { role_section_action: { role: role, section: section, action: action } },
                            })];
                        case 5:
                            perm = _c.sent();
                            result = !!perm;
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, this.redis.set(cacheKey, result, 300)];
                        case 7:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            _b = _c.sent();
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/, result];
                    }
                });
            });
        };
        /**
         * Ruxsatlarni yangilash
         */
        PermissionsService_1.prototype.updatePermissions = function (role, permissions) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, permissions_2, perm, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, permissions_2 = permissions;
                            _b.label = 1;
                        case 1:
                            if (!(_i < permissions_2.length)) return [3 /*break*/, 6];
                            perm = permissions_2[_i];
                            if (!perm.enabled) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.rolePermission.upsert({
                                    where: {
                                        role_section_action: { role: role, section: perm.section, action: perm.action },
                                    },
                                    update: {},
                                    create: { role: role, section: perm.section, action: perm.action },
                                })];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.prisma.rolePermission.deleteMany({
                                where: { role: role, section: perm.section, action: perm.action },
                            })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            _b.trys.push([6, 9, , 10]);
                            return [4 /*yield*/, this.redis.del("permissions:".concat(role))];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, this.redis.del("permissions:all")];
                        case 8:
                            _b.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            _a = _b.sent();
                            return [3 /*break*/, 10];
                        case 10:
                            this.logger.log("Ruxsatlar yangilandi: ".concat(role));
                            return [2 /*return*/, this.getPermissions(role)];
                    }
                });
            });
        };
        /**
         * Default ruxsatlarni o'rnatish
         */
        PermissionsService_1.prototype.seedDefaultPermissions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sections, allActions, dispatcherPerms, _i, dispatcherPerms_1, perm, _a, _b, action, driverPerms, _c, driverPerms_1, perm, _d, _e, action;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            sections = ['orders', 'drivers', 'analytics', 'settings', 'users', 'ads', 'sessions', 'payments', 'monitor', 'support', 'chat', 'notifications'];
                            allActions = Object.values(client_1.PermissionAction);
                            dispatcherPerms = [
                                { section: 'orders', actions: ['VIEW', 'CREATE', 'EDIT'] },
                                { section: 'drivers', actions: ['VIEW'] },
                                { section: 'analytics', actions: ['VIEW'] },
                                { section: 'ads', actions: ['VIEW', 'CREATE', 'EDIT'] },
                                { section: 'sessions', actions: ['VIEW'] },
                                { section: 'chat', actions: ['VIEW', 'CREATE'] },
                                { section: 'support', actions: ['VIEW', 'CREATE'] },
                                { section: 'notifications', actions: ['VIEW'] },
                            ];
                            _i = 0, dispatcherPerms_1 = dispatcherPerms;
                            _f.label = 1;
                        case 1:
                            if (!(_i < dispatcherPerms_1.length)) return [3 /*break*/, 6];
                            perm = dispatcherPerms_1[_i];
                            _a = 0, _b = perm.actions;
                            _f.label = 2;
                        case 2:
                            if (!(_a < _b.length)) return [3 /*break*/, 5];
                            action = _b[_a];
                            return [4 /*yield*/, this.prisma.rolePermission.upsert({
                                    where: {
                                        role_section_action: { role: 'DISPATCHER', section: perm.section, action: action },
                                    },
                                    update: {},
                                    create: { role: client_1.UserRole.DISPATCHER, section: perm.section, action: action },
                                })];
                        case 3:
                            _f.sent();
                            _f.label = 4;
                        case 4:
                            _a++;
                            return [3 /*break*/, 2];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            driverPerms = [
                                { section: 'orders', actions: ['VIEW'] },
                                { section: 'chat', actions: ['VIEW', 'CREATE'] },
                                { section: 'support', actions: ['VIEW', 'CREATE'] },
                                { section: 'notifications', actions: ['VIEW'] },
                            ];
                            _c = 0, driverPerms_1 = driverPerms;
                            _f.label = 7;
                        case 7:
                            if (!(_c < driverPerms_1.length)) return [3 /*break*/, 12];
                            perm = driverPerms_1[_c];
                            _d = 0, _e = perm.actions;
                            _f.label = 8;
                        case 8:
                            if (!(_d < _e.length)) return [3 /*break*/, 11];
                            action = _e[_d];
                            return [4 /*yield*/, this.prisma.rolePermission.upsert({
                                    where: {
                                        role_section_action: { role: 'DRIVER', section: perm.section, action: action },
                                    },
                                    update: {},
                                    create: { role: client_1.UserRole.DRIVER, section: perm.section, action: action },
                                })];
                        case 9:
                            _f.sent();
                            _f.label = 10;
                        case 10:
                            _d++;
                            return [3 /*break*/, 8];
                        case 11:
                            _c++;
                            return [3 /*break*/, 7];
                        case 12:
                            this.logger.log('Default ruxsatlar o\'rnatildi');
                            return [2 /*return*/];
                    }
                });
            });
        };
        return PermissionsService_1;
    }());
    __setFunctionName(_classThis, "PermissionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PermissionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PermissionsService = _classThis;
}();
exports.PermissionsService = PermissionsService;
