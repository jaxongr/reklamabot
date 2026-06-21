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
exports.OrdersController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var client_1 = require("@prisma/client");
var swagger_1 = require("@nestjs/swagger");
var OrdersController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Orders'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('orders'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _getStats_decorators;
    var _getRecent_decorators;
    var _getCitySuggestions_decorators;
    var _getForSaleOrders_decorators;
    var _getAcceptedOrders_decorators;
    var _getAllAcceptedOrders_decorators;
    var _getRoute_decorators;
    var _getUniquePhones_decorators;
    var _exportUniquePhones_decorators;
    var _getBlockedPhones_decorators;
    var _exportBlockedPhones_decorators;
    var _getClosedDeals_decorators;
    var _findOne_decorators;
    var _createManual_decorators;
    var _acceptOrder_decorators;
    var _closeDeal_decorators;
    var _updateStatus_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _findDriver_decorators;
    var _getBroadcastStatus_decorators;
    var _stopBroadcast_decorators;
    var _batchUpdateStatus_decorators;
    var OrdersController = _classThis = /** @class */ (function () {
        function OrdersController_1(ordersService, postingService, prisma, gateway) {
            this.ordersService = (__runInitializers(this, _instanceExtraInitializers), ordersService);
            this.postingService = postingService;
            this.prisma = prisma;
            this.gateway = gateway;
            this.logger = new common_1.Logger(OrdersController.name);
            // Cooldown: userId → lastUsedAt (3 daqiqa)
            this.findDriverCooldown = new Map();
        }
        OrdersController_1.prototype.findAll = function (req, status, type, scope, search, cargoFrom, cargoTo, vehicleType, dateFrom, dateTo, isForSale, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Barcha autentifikatsiyalangan foydalanuvchilar orderlarni ko'radi (marketplace)
                    return [2 /*return*/, this.ordersService.findAll(undefined, {
                            status: status,
                            type: type,
                            scope: scope,
                            search: search,
                            cargoFrom: cargoFrom,
                            cargoTo: cargoTo,
                            vehicleType: vehicleType,
                            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                            dateTo: dateTo ? new Date(dateTo) : undefined,
                            isForSale: isForSale === 'true' ? true : isForSale === 'false' ? false : undefined,
                            page: page ? parseInt(page) : 1,
                            limit: limit ? parseInt(limit) : 20,
                        })];
                });
            });
        };
        OrdersController_1.prototype.getStats = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var role, canSeeAll;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
                    return [2 /*return*/, this.ordersService.getStats(canSeeAll ? undefined : req.user.userId)];
                });
            });
        };
        OrdersController_1.prototype.getRecent = function (req, limit) {
            return __awaiter(this, void 0, void 0, function () {
                var role, canSeeAll;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
                    return [2 /*return*/, this.ordersService.getRecent(canSeeAll ? undefined : req.user.userId, limit ? parseInt(limit) : 10)];
                });
            });
        };
        OrdersController_1.prototype.getCitySuggestions = function (q) {
            return this.ordersService.getCitySuggestions(q || '');
        };
        OrdersController_1.prototype.getForSaleOrders = function (page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.getForSaleOrders(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        OrdersController_1.prototype.getAcceptedOrders = function (req, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.getAcceptedOrders(req.user.userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        OrdersController_1.prototype.getAllAcceptedOrders = function (status, page, limit, search) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.getAllAcceptedOrders({
                            status: status,
                            page: page ? parseInt(page) : undefined,
                            limit: limit ? parseInt(limit) : undefined,
                            search: search,
                        })];
                });
            });
        };
        OrdersController_1.prototype.getRoute = function (coords, fromLat, fromLng, toLat, toLng) {
            return __awaiter(this, void 0, void 0, function () {
                var c, url, https_1, e_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            c = coords || "".concat(fromLng, ",").concat(fromLat, ";").concat(toLng, ",").concat(toLat);
                            url = "https://router.project-osrm.org/route/v1/driving/".concat(c, "?overview=full&geometries=geojson");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, Promise.resolve().then(function () { return require('https'); })];
                        case 2:
                            https_1 = _a.sent();
                            return [2 /*return*/, new Promise(function (resolve) {
                                    https_1.get(url, function (res) {
                                        var body = '';
                                        res.on('data', function (chunk) { return body += chunk; });
                                        res.on('end', function () {
                                            try {
                                                resolve(JSON.parse(body));
                                            }
                                            catch (_a) {
                                                resolve({ code: 'Error', message: 'JSON parse error' });
                                            }
                                        });
                                    }).on('error', function (e) {
                                        _this.logger.error("OSRM proxy error: ".concat(e));
                                        resolve({ code: 'Error', message: String(e) });
                                    });
                                })];
                        case 3:
                            e_1 = _a.sent();
                            this.logger.error("OSRM proxy error: ".concat(e_1));
                            return [2 /*return*/, { code: 'Error', message: String(e_1) }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        OrdersController_1.prototype.getUniquePhones = function (type, dateFrom, dateTo, cargoFrom, cargoTo, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.getUniquePhones({
                            type: type,
                            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                            dateTo: dateTo ? new Date(dateTo) : undefined,
                            cargoFrom: cargoFrom,
                            cargoTo: cargoTo,
                            page: page ? parseInt(page) : 1,
                            limit: limit ? parseInt(limit) : 50,
                        })];
                });
            });
        };
        OrdersController_1.prototype.exportUniquePhones = function (res, type, dateFrom, dateTo, cargoFrom, cargoTo) {
            return __awaiter(this, void 0, void 0, function () {
                var phones, content, typeLabel, filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ordersService.getUniquePhonesExport({
                                type: type,
                                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                                dateTo: dateTo ? new Date(dateTo) : undefined,
                                cargoFrom: cargoFrom,
                                cargoTo: cargoTo,
                            })];
                        case 1:
                            phones = _a.sent();
                            content = phones.join('\n');
                            typeLabel = type === 'CARGO' ? 'dispetcher' : type === 'DRIVER' ? 'haydovchi' : 'barcha';
                            filename = "unikal_raqamlar_".concat(typeLabel, "_").concat(new Date().toISOString().slice(0, 10), ".txt");
                            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                            res.setHeader('Content-Disposition', "attachment; filename=\"".concat(filename, "\""));
                            res.send(content);
                            return [2 /*return*/];
                    }
                });
            });
        };
        OrdersController_1.prototype.getBlockedPhones = function (dateFrom, dateTo, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.getBlockedPhones({
                            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                            dateTo: dateTo ? new Date(dateTo) : undefined,
                            page: page ? parseInt(page) : 1,
                            limit: limit ? parseInt(limit) : 50,
                        })];
                });
            });
        };
        OrdersController_1.prototype.exportBlockedPhones = function (res, dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var phones, filename;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ordersService.getBlockedPhonesExport({
                                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                                dateTo: dateTo ? new Date(dateTo) : undefined,
                            })];
                        case 1:
                            phones = _a.sent();
                            filename = "bloklangan_raqamlar_".concat(new Date().toISOString().slice(0, 10), ".txt");
                            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                            res.setHeader('Content-Disposition', "attachment; filename=\"".concat(filename, "\""));
                            res.send(phones.join('\n'));
                            return [2 /*return*/];
                    }
                });
            });
        };
        OrdersController_1.prototype.getClosedDeals = function (req, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                var role, canSeeAll;
                return __generator(this, function (_a) {
                    role = req.user.role;
                    canSeeAll = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER';
                    return [2 /*return*/, this.ordersService.getClosedDeals(canSeeAll ? undefined : req.user.userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20)];
                });
            });
        };
        OrdersController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.findOne(id)];
                });
            });
        };
        OrdersController_1.prototype.createManual = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.createManual(req.user.userId, req.user.userId, body)];
                });
            });
        };
        OrdersController_1.prototype.acceptOrder = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.acceptOrder(id, req.user.userId)];
                });
            });
        };
        OrdersController_1.prototype.closeDeal = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.closeDeal(id, req.user.userId, body.amount)];
                });
            });
        };
        OrdersController_1.prototype.updateStatus = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.updateStatus(id, body.status, body.notes, body.acceptedStatus)];
                });
            });
        };
        OrdersController_1.prototype.update = function (id, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.update(id, body)];
                });
            });
        };
        OrdersController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.remove(id)];
                });
            });
        };
        OrdersController_1.prototype.findDriver = function (req, id, body) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, cooldownMs, lastUsed, elapsed, remainSec, order, content, replacementPhone, user, phoneRegex, replaced, now, cooldownUntil, totalGroups, sessionCount, userSessions, uniqueTgIds, _i, userSessions_1, s, _a, _b, g, _1;
                var _this = this;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            userId = req.user.userId;
                            cooldownMs = 3 * 60 * 1000;
                            lastUsed = this.findDriverCooldown.get(userId);
                            if (lastUsed) {
                                elapsed = Date.now() - lastUsed.getTime();
                                if (elapsed < cooldownMs) {
                                    remainSec = Math.ceil((cooldownMs - elapsed) / 1000);
                                    throw new common_1.HttpException("".concat(remainSec, " soniya kutish kerak"), common_1.HttpStatus.TOO_MANY_REQUESTS);
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.findUnique({ where: { id: id } })];
                        case 1:
                            order = _d.sent();
                            if (!order) {
                                throw new common_1.NotFoundException('Buyurtma topilmadi');
                            }
                            if (order.acceptedById !== userId) {
                                throw new common_1.BadRequestException('Bu buyurtma sizga tegishli emas');
                            }
                            content = order.messageText || '';
                            replacementPhone = ((_c = body === null || body === void 0 ? void 0 : body.phone) === null || _c === void 0 ? void 0 : _c.trim()) || '';
                            if (!!replacementPhone) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: userId },
                                    select: { adPhoneNumbers: true },
                                })];
                        case 2:
                            user = _d.sent();
                            if ((user === null || user === void 0 ? void 0 : user.adPhoneNumbers) && user.adPhoneNumbers.length > 0) {
                                replacementPhone = user.adPhoneNumbers[0];
                            }
                            _d.label = 3;
                        case 3:
                            if (replacementPhone) {
                                phoneRegex = /(\+?\d[\d\s\-.()\u00A0]{6,18}\d)/g;
                                replaced = content.replace(phoneRegex, replacementPhone);
                                if (replaced === content) {
                                    content = content.trim() + '\n📞 ' + replacementPhone;
                                }
                                else {
                                    content = replaced;
                                }
                            }
                            if (!content.trim()) {
                                throw new common_1.BadRequestException('Buyurtma matni bo\'sh');
                            }
                            this.logger.log("\uD83D\uDD0D Find-driver: orderId=".concat(id, ", phone=").concat(replacementPhone || 'YO\'Q', ", contentLen=").concat(content.length));
                            now = new Date();
                            this.findDriverCooldown.set(userId, now);
                            cooldownUntil = new Date(now.getTime() + cooldownMs).toISOString();
                            // Broadcast count oshirish
                            return [4 /*yield*/, this.prisma.order.update({
                                    where: { id: id },
                                    data: { broadcastCount: { increment: 1 } },
                                }).catch(function () { })];
                        case 4:
                            // Broadcast count oshirish
                            _d.sent();
                            totalGroups = 0;
                            sessionCount = 0;
                            _d.label = 5;
                        case 5:
                            _d.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: { userId: userId, status: 'ACTIVE', isFrozen: false, sessionString: { not: null } },
                                    include: { groups: { where: { isActive: true }, select: { telegramId: true } } },
                                })];
                        case 6:
                            userSessions = _d.sent();
                            sessionCount = userSessions.length;
                            uniqueTgIds = new Set();
                            for (_i = 0, userSessions_1 = userSessions; _i < userSessions_1.length; _i++) {
                                s = userSessions_1[_i];
                                for (_a = 0, _b = s.groups; _a < _b.length; _a++) {
                                    g = _b[_a];
                                    uniqueTgIds.add(g.telegramId);
                                }
                            }
                            totalGroups = uniqueTgIds.size;
                            return [3 /*break*/, 8];
                        case 7:
                            _1 = _d.sent();
                            return [3 /*break*/, 8];
                        case 8:
                            // 6. BroadcastOnce — FONDA yuborish (non-blocking) + WS progress
                            // orderId ni in-memory status ga saqlash (mobile reconnect uchun)
                            this.postingService.setBroadcastOnceOrderId(userId, id);
                            this.postingService.broadcastOnce(content, userId, function (payload) {
                                try {
                                    _this.gateway.sendToUser(userId, 'find-driver:progress', __assign({ orderId: id }, payload));
                                }
                                catch (e) {
                                    _this.logger.warn("WS progress emit xatolik: ".concat(e.message));
                                }
                            }).then(function (result) {
                                _this.logger.log("\uD83D\uDD0D Haydovchi topish yakunlandi: orderId=".concat(id, ", sent=").concat(result.sent, ", failed=").concat(result.failed, ", total=").concat(result.total, ", sessions=").concat(result.sessionCount, ", unique=").concat(result.uniqueGroupsSent));
                            }).catch(function (error) {
                                _this.logger.error("\uD83D\uDD0D Find-driver xatolik: orderId=".concat(id, ", userId=").concat(userId, ", error=").concat(error.message));
                                try {
                                    _this.gateway.sendToUser(userId, 'find-driver:progress', {
                                        orderId: id,
                                        status: 'error',
                                        sent: 0,
                                        failed: 0,
                                        skipped: 0,
                                        total: 0,
                                        sessionCount: 0,
                                        uniqueGroupsSent: 0,
                                        error: error.message,
                                    });
                                }
                                catch (_) { }
                            });
                            return [2 /*return*/, {
                                    status: 'sending',
                                    message: 'Guruhlarga yuborilmoqda...',
                                    cooldownUntil: cooldownUntil,
                                    totalGroups: totalGroups,
                                    sessionCount: sessionCount,
                                }];
                    }
                });
            });
        };
        OrdersController_1.prototype.getBroadcastStatus = function (req) {
            var userId = req.user.userId;
            var state = this.postingService.getBroadcastOnceStatus(userId);
            if (!state) {
                return { status: 'idle' };
            }
            return {
                status: state.status,
                orderId: state.orderId,
                sent: state.sent,
                failed: state.failed,
                skipped: state.skipped,
                total: state.total,
                sessionCount: state.sessionCount,
                uniqueGroupsSent: state.uniqueGroupsSent,
            };
        };
        OrdersController_1.prototype.stopBroadcast = function (req) {
            var userId = req.user.userId;
            this.postingService.cancelBroadcastOnce(userId);
            // WS orqali mobile'ga xabar berish
            try {
                this.gateway.sendToUser(userId, 'find-driver:progress', {
                    status: 'completed',
                    sent: 0,
                    failed: 0,
                    skipped: 0,
                    total: 0,
                    sessionCount: 0,
                    uniqueGroupsSent: 0,
                });
            }
            catch (_a) { }
            return { status: 'stopped', message: "Tarqatish to'xtatildi" };
        };
        OrdersController_1.prototype.batchUpdateStatus = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.ordersService.batchUpdateStatus(body.ids, body.status)];
                });
            });
        };
        return OrdersController_1;
    }());
    __setFunctionName(_classThis, "OrdersController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: "Buyurtmalar ro'yxati" })];
        _getStats_decorators = [(0, common_1.Get)('stats'), (0, swagger_1.ApiOperation)({ summary: 'Buyurtma statistikasi' })];
        _getRecent_decorators = [(0, common_1.Get)('recent'), (0, swagger_1.ApiOperation)({ summary: "So'nggi buyurtmalar" })];
        _getCitySuggestions_decorators = [(0, common_1.Get)('city-suggestions'), (0, swagger_1.ApiOperation)({ summary: 'Shahar takliflari (autocomplete)' })];
        _getForSaleOrders_decorators = [(0, common_1.Get)('for-sale'), (0, swagger_1.ApiOperation)({ summary: 'Sotuvdagi buyurtmalar' })];
        _getAcceptedOrders_decorators = [(0, common_1.Get)('accepted'), (0, swagger_1.ApiOperation)({ summary: 'Qabul qilingan buyurtmalar' })];
        _getAllAcceptedOrders_decorators = [(0, common_1.Get)('all-accepted'), (0, swagger_1.ApiOperation)({ summary: 'Barcha qabul qilingan zakazlar (dashboard)' })];
        _getRoute_decorators = [(0, common_1.Get)('route'), (0, swagger_1.ApiOperation)({ summary: 'OSRM routing proxy' })];
        _getUniquePhones_decorators = [(0, common_1.Get)('unique-phones'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER), (0, swagger_1.ApiOperation)({ summary: 'Unikal telefon raqamlar' })];
        _exportUniquePhones_decorators = [(0, common_1.Get)('unique-phones/export'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER), (0, swagger_1.ApiOperation)({ summary: 'Unikal raqamlar TXT eksport' })];
        _getBlockedPhones_decorators = [(0, common_1.Get)('blocked-phones'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan senderlar raqamlari' })];
        _exportBlockedPhones_decorators = [(0, common_1.Get)('blocked-phones/export'), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER), (0, swagger_1.ApiOperation)({ summary: 'Bloklangan raqamlar TXT eksport' })];
        _getClosedDeals_decorators = [(0, common_1.Get)('closed-deals'), (0, swagger_1.ApiOperation)({ summary: 'Yopilgan bitimlar' })];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Bitta buyurtma' })];
        _createManual_decorators = [(0, common_1.Post)(), (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.DISPATCHER), (0, swagger_1.ApiOperation)({ summary: "Qo'lda buyurtma yaratish" })];
        _acceptOrder_decorators = [(0, common_1.Post)(':id/accept'), (0, swagger_1.ApiOperation)({ summary: 'Buyurtma qabul qilish' })];
        _closeDeal_decorators = [(0, common_1.Post)(':id/close-deal'), (0, swagger_1.ApiOperation)({ summary: 'Yuk yopish' })];
        _updateStatus_decorators = [(0, common_1.Patch)(':id/status'), (0, swagger_1.ApiOperation)({ summary: "Status o'zgartirish" })];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Buyurtma yangilash' })];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: "Buyurtma o'chirish" })];
        _findDriver_decorators = [(0, common_1.Post)(':id/find-driver'), (0, swagger_1.ApiOperation)({ summary: 'Haydovchi topish — buyurtmani guruxlarga tarqatish' })];
        _getBroadcastStatus_decorators = [(0, common_1.Get)('broadcast-status'), (0, swagger_1.ApiOperation)({ summary: 'Faol broadcast holatini olish (mobile reconnect uchun)' })];
        _stopBroadcast_decorators = [(0, common_1.Post)('stop-broadcast'), (0, swagger_1.ApiOperation)({ summary: "Tarqatishni to'xtatish" })];
        _batchUpdateStatus_decorators = [(0, common_1.Patch)('batch/status'), (0, swagger_1.ApiOperation)({ summary: "Bir nechta buyurtma statusini o'zgartirish" })];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: function (obj) { return "getStats" in obj; }, get: function (obj) { return obj.getStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRecent_decorators, { kind: "method", name: "getRecent", static: false, private: false, access: { has: function (obj) { return "getRecent" in obj; }, get: function (obj) { return obj.getRecent; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCitySuggestions_decorators, { kind: "method", name: "getCitySuggestions", static: false, private: false, access: { has: function (obj) { return "getCitySuggestions" in obj; }, get: function (obj) { return obj.getCitySuggestions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getForSaleOrders_decorators, { kind: "method", name: "getForSaleOrders", static: false, private: false, access: { has: function (obj) { return "getForSaleOrders" in obj; }, get: function (obj) { return obj.getForSaleOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAcceptedOrders_decorators, { kind: "method", name: "getAcceptedOrders", static: false, private: false, access: { has: function (obj) { return "getAcceptedOrders" in obj; }, get: function (obj) { return obj.getAcceptedOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllAcceptedOrders_decorators, { kind: "method", name: "getAllAcceptedOrders", static: false, private: false, access: { has: function (obj) { return "getAllAcceptedOrders" in obj; }, get: function (obj) { return obj.getAllAcceptedOrders; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRoute_decorators, { kind: "method", name: "getRoute", static: false, private: false, access: { has: function (obj) { return "getRoute" in obj; }, get: function (obj) { return obj.getRoute; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUniquePhones_decorators, { kind: "method", name: "getUniquePhones", static: false, private: false, access: { has: function (obj) { return "getUniquePhones" in obj; }, get: function (obj) { return obj.getUniquePhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportUniquePhones_decorators, { kind: "method", name: "exportUniquePhones", static: false, private: false, access: { has: function (obj) { return "exportUniquePhones" in obj; }, get: function (obj) { return obj.exportUniquePhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBlockedPhones_decorators, { kind: "method", name: "getBlockedPhones", static: false, private: false, access: { has: function (obj) { return "getBlockedPhones" in obj; }, get: function (obj) { return obj.getBlockedPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportBlockedPhones_decorators, { kind: "method", name: "exportBlockedPhones", static: false, private: false, access: { has: function (obj) { return "exportBlockedPhones" in obj; }, get: function (obj) { return obj.exportBlockedPhones; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getClosedDeals_decorators, { kind: "method", name: "getClosedDeals", static: false, private: false, access: { has: function (obj) { return "getClosedDeals" in obj; }, get: function (obj) { return obj.getClosedDeals; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createManual_decorators, { kind: "method", name: "createManual", static: false, private: false, access: { has: function (obj) { return "createManual" in obj; }, get: function (obj) { return obj.createManual; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _acceptOrder_decorators, { kind: "method", name: "acceptOrder", static: false, private: false, access: { has: function (obj) { return "acceptOrder" in obj; }, get: function (obj) { return obj.acceptOrder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _closeDeal_decorators, { kind: "method", name: "closeDeal", static: false, private: false, access: { has: function (obj) { return "closeDeal" in obj; }, get: function (obj) { return obj.closeDeal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: function (obj) { return "updateStatus" in obj; }, get: function (obj) { return obj.updateStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findDriver_decorators, { kind: "method", name: "findDriver", static: false, private: false, access: { has: function (obj) { return "findDriver" in obj; }, get: function (obj) { return obj.findDriver; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBroadcastStatus_decorators, { kind: "method", name: "getBroadcastStatus", static: false, private: false, access: { has: function (obj) { return "getBroadcastStatus" in obj; }, get: function (obj) { return obj.getBroadcastStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _stopBroadcast_decorators, { kind: "method", name: "stopBroadcast", static: false, private: false, access: { has: function (obj) { return "stopBroadcast" in obj; }, get: function (obj) { return obj.stopBroadcast; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _batchUpdateStatus_decorators, { kind: "method", name: "batchUpdateStatus", static: false, private: false, access: { has: function (obj) { return "batchUpdateStatus" in obj; }, get: function (obj) { return obj.batchUpdateStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrdersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrdersController = _classThis;
}();
exports.OrdersController = OrdersController;
