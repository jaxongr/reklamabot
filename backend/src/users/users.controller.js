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
exports.UsersController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var UsersController = function () {
    var _classDecorators = [(0, common_1.Controller)('users'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _getProfile_decorators;
    var _search_decorators;
    var _findByRole_decorators;
    var _findActive_decorators;
    var _getDashboardSummary_decorators;
    var _toggleLineStatus_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _changeRole_decorators;
    var _toggleActive_decorators;
    var _updateBrandAd_decorators;
    var _remove_decorators;
    var _batchUpdate_decorators;
    var _getAdPhones_decorators;
    var _updateAdPhones_decorators;
    var _getStaffList_decorators;
    var _createStaff_decorators;
    var _changePassword_decorators;
    var UsersController = _classThis = /** @class */ (function () {
        function UsersController_1(usersService) {
            this.usersService = (__runInitializers(this, _instanceExtraInitializers), usersService);
        }
        /**
         * Create new user (admin only)
         */
        UsersController_1.prototype.create = function (createUserDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.create(createUserDto)];
                });
            });
        };
        /**
         * Get all users with pagination
         */
        UsersController_1.prototype.findAll = function (skip, take, search, role) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    where = {};
                    if (search) {
                        where.OR = [
                            { username: { contains: search, mode: 'insensitive' } },
                            { phoneNumber: { contains: search } },
                            { firstName: { contains: search, mode: 'insensitive' } },
                        ];
                    }
                    if (role) {
                        where.role = role;
                    }
                    return [2 /*return*/, this.usersService.findAll({ skip: skip, take: take, where: where })];
                });
            });
        };
        /**
         * Get current user profile
         */
        UsersController_1.prototype.getProfile = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.getStatistics(req.user.userId)];
                });
            });
        };
        /**
         * Search users
         */
        UsersController_1.prototype.search = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.search(query)];
                });
            });
        };
        /**
         * Get users by role
         */
        UsersController_1.prototype.findByRole = function (role) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.findByRole(role)];
                });
            });
        };
        /**
         * Get active users
         */
        UsersController_1.prototype.findActive = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.findActive()];
                });
            });
        };
        /**
         * Get dashboard summary
         */
        UsersController_1.prototype.getDashboardSummary = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.getDashboardSummary()];
                });
            });
        };
        /**
         * Linya holatini o'zgartirish (o'chiq bo'lganda e'lon push kelmaydi)
         */
        UsersController_1.prototype.toggleLineStatus = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.setLineStatus(req.user.userId, body.isLineActive)];
                });
            });
        };
        /**
         * Get user by ID
         */
        UsersController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.findOne(id)];
                });
            });
        };
        /**
         * Update user
         */
        UsersController_1.prototype.update = function (id, updateUserDto, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Only allow users to update their own profile or admins to update any
                    if (req.user.userId !== id && !this.isAdmin(req.user.role)) {
                        throw new Error('You can only update your own profile');
                    }
                    return [2 /*return*/, this.usersService.update(id, updateUserDto)];
                });
            });
        };
        /**
         * Change user role (admin only)
         */
        UsersController_1.prototype.changeRole = function (id, role) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.changeRole(id, role)];
                });
            });
        };
        /**
         * Toggle user active status (admin only)
         */
        UsersController_1.prototype.toggleActive = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.toggleActive(id)];
                });
            });
        };
        /**
         * Update brand advertisement
         */
        UsersController_1.prototype.updateBrandAd = function (id, brandAdText, brandAdEnabled, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (req.user.userId !== id && !this.isAdmin(req.user.role)) {
                        throw new Error('You can only update your own profile');
                    }
                    return [2 /*return*/, this.usersService.updateBrandAd(id, brandAdText, brandAdEnabled)];
                });
            });
        };
        /**
         * Delete user (soft delete)
         */
        UsersController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.remove(id)];
                });
            });
        };
        /**
         * Batch update users (admin only)
         */
        UsersController_1.prototype.batchUpdate = function (ids, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.batchUpdate(ids, data)];
                });
            });
        };
        // Task 14: E'lon uchun telefonlar
        UsersController_1.prototype.getAdPhones = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.getAdPhones(req.user.userId)];
                });
            });
        };
        UsersController_1.prototype.updateAdPhones = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.updateAdPhones(req.user.userId, body.phones)];
                });
            });
        };
        // ===================== HODIMLAR BOSHQARUVI =====================
        /**
         * Hodimlar ro'yxati
         */
        UsersController_1.prototype.getStaffList = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.getStaffList()];
                });
            });
        };
        /**
         * Yangi hodim yaratish
         */
        UsersController_1.prototype.createStaff = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.createStaff(body)];
                });
            });
        };
        /**
         * Hodim parolini o'zgartirish
         */
        UsersController_1.prototype.changePassword = function (id, password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.usersService.changePassword(id, password)];
                });
            });
        };
        /**
         * Helper method to check if user is admin
         */
        UsersController_1.prototype.isAdmin = function (role) {
            return role === client_1.UserRole.ADMIN || role === client_1.UserRole.SUPER_ADMIN;
        };
        return UsersController_1;
    }());
    __setFunctionName(_classThis, "UsersController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _findAll_decorators = [(0, common_1.Get)(), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER)];
        _getProfile_decorators = [(0, common_1.Get)('profile')];
        _search_decorators = [(0, common_1.Get)('search'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _findByRole_decorators = [(0, common_1.Get)('role/:role'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _findActive_decorators = [(0, common_1.Get)('active'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _getDashboardSummary_decorators = [(0, common_1.Get)('dashboard/summary'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _toggleLineStatus_decorators = [(0, common_1.Patch)('line-status')];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _changeRole_decorators = [(0, common_1.Patch)(':id/role'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _toggleActive_decorators = [(0, common_1.Patch)(':id/toggle-active'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _updateBrandAd_decorators = [(0, common_1.Patch)(':id/brand-ad')];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _batchUpdate_decorators = [(0, common_1.Post)('batch-update'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _getAdPhones_decorators = [(0, common_1.Get)('ad-phones')];
        _updateAdPhones_decorators = [(0, common_1.Patch)('ad-phones')];
        _getStaffList_decorators = [(0, common_1.Get)('staff'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _createStaff_decorators = [(0, common_1.Post)('staff'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        _changePassword_decorators = [(0, common_1.Patch)(':id/password'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN)];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: function (obj) { return "getProfile" in obj; }, get: function (obj) { return obj.getProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: function (obj) { return "search" in obj; }, get: function (obj) { return obj.search; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByRole_decorators, { kind: "method", name: "findByRole", static: false, private: false, access: { has: function (obj) { return "findByRole" in obj; }, get: function (obj) { return obj.findByRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findActive_decorators, { kind: "method", name: "findActive", static: false, private: false, access: { has: function (obj) { return "findActive" in obj; }, get: function (obj) { return obj.findActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDashboardSummary_decorators, { kind: "method", name: "getDashboardSummary", static: false, private: false, access: { has: function (obj) { return "getDashboardSummary" in obj; }, get: function (obj) { return obj.getDashboardSummary; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleLineStatus_decorators, { kind: "method", name: "toggleLineStatus", static: false, private: false, access: { has: function (obj) { return "toggleLineStatus" in obj; }, get: function (obj) { return obj.toggleLineStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changeRole_decorators, { kind: "method", name: "changeRole", static: false, private: false, access: { has: function (obj) { return "changeRole" in obj; }, get: function (obj) { return obj.changeRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _toggleActive_decorators, { kind: "method", name: "toggleActive", static: false, private: false, access: { has: function (obj) { return "toggleActive" in obj; }, get: function (obj) { return obj.toggleActive; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateBrandAd_decorators, { kind: "method", name: "updateBrandAd", static: false, private: false, access: { has: function (obj) { return "updateBrandAd" in obj; }, get: function (obj) { return obj.updateBrandAd; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _batchUpdate_decorators, { kind: "method", name: "batchUpdate", static: false, private: false, access: { has: function (obj) { return "batchUpdate" in obj; }, get: function (obj) { return obj.batchUpdate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAdPhones_decorators, { kind: "method", name: "getAdPhones", static: false, private: false, access: { has: function (obj) { return "getAdPhones" in obj; }, get: function (obj) { return obj.getAdPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateAdPhones_decorators, { kind: "method", name: "updateAdPhones", static: false, private: false, access: { has: function (obj) { return "updateAdPhones" in obj; }, get: function (obj) { return obj.updateAdPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStaffList_decorators, { kind: "method", name: "getStaffList", static: false, private: false, access: { has: function (obj) { return "getStaffList" in obj; }, get: function (obj) { return obj.getStaffList; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createStaff_decorators, { kind: "method", name: "createStaff", static: false, private: false, access: { has: function (obj) { return "createStaff" in obj; }, get: function (obj) { return obj.createStaff; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: function (obj) { return "changePassword" in obj; }, get: function (obj) { return obj.changePassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersController = _classThis;
}();
exports.UsersController = UsersController;
