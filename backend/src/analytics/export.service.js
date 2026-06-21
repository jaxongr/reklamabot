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
exports.ExportService = void 0;
var common_1 = require("@nestjs/common");
var ExportService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ExportService = _classThis = /** @class */ (function () {
        function ExportService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(ExportService.name);
        }
        /**
         * Task 8: Buyurtmalar eksporti (JSON formatda — CSV konversiya frontendda)
         */
        ExportService_1.prototype.exportOrders = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var where, end, orders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.order.findMany({
                                    where: where,
                                    orderBy: { createdAt: 'desc' },
                                    take: 10000,
                                })];
                        case 1:
                            orders = _a.sent();
                            return [2 /*return*/, orders.map(function (o) { return ({
                                    id: o.id,
                                    sana: o.createdAt.toISOString().split('T')[0],
                                    turi: o.type,
                                    scope: o.scope,
                                    qayerdan: o.cargoFrom || '',
                                    qayerga: o.cargoTo || '',
                                    yukTuri: o.cargoType || '',
                                    ogirlik: o.cargoWeight || '',
                                    mashinaTuri: o.vehicleType || '',
                                    narx: o.price || '',
                                    telefon: o.phone || '',
                                    guruh: o.groupTitle,
                                    yuboruvchi: o.senderName || '',
                                    status: o.status,
                                    masofa: o.distance || '',
                                    yopilganNarx: o.closedAmount || '',
                                }); })];
                    }
                });
            });
        };
        /**
         * Haydovchilar eksporti
         */
        ExportService_1.prototype.exportDrivers = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var where, end, drivers;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.driverProfile.findMany({
                                    where: where,
                                    include: { user: { select: { telegramId: true, username: true } } },
                                    orderBy: { createdAt: 'desc' },
                                    take: 10000,
                                })];
                        case 1:
                            drivers = _a.sent();
                            return [2 /*return*/, drivers.map(function (d) {
                                    var _a, _b;
                                    return ({
                                        id: d.id,
                                        ism: d.fullName || '',
                                        telefon: d.phone || '',
                                        mashinaTuri: d.vehicleType || '',
                                        sigimi: d.vehicleCapacity || '',
                                        raqam: d.vehicleNumber || '',
                                        shahar: d.lastCity || '',
                                        tasdiqlangan: d.isVerified ? 'Ha' : 'Yo\'q',
                                        onlayn: d.isOnline ? 'Ha' : 'Yo\'q',
                                        balans: d.balance,
                                        telegramId: ((_a = d.user) === null || _a === void 0 ? void 0 : _a.telegramId) || '',
                                        username: ((_b = d.user) === null || _b === void 0 ? void 0 : _b.username) || '',
                                        yaratilgan: d.createdAt.toISOString().split('T')[0],
                                    });
                                })];
                    }
                });
            });
        };
        /**
         * Takliflar eksporti
         */
        ExportService_1.prototype.exportOffers = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var where, end, offers;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.driverOffer.findMany({
                                    where: where,
                                    include: { driver: { select: { firstName: true, username: true } } },
                                    orderBy: { createdAt: 'desc' },
                                    take: 10000,
                                })];
                        case 1:
                            offers = _a.sent();
                            return [2 /*return*/, offers.map(function (o) {
                                    var _a;
                                    return ({
                                        id: o.id,
                                        qayerdan: o.fromCity,
                                        qayerga: o.toCity,
                                        mashinaTuri: o.vehicleType,
                                        sigimi: o.vehicleCapacity || '',
                                        telefon: o.phone,
                                        narx: o.price || '',
                                        status: o.status,
                                        haydovchi: ((_a = o.driver) === null || _a === void 0 ? void 0 : _a.firstName) || '',
                                        yaratilgan: o.createdAt.toISOString().split('T')[0],
                                    });
                                })];
                    }
                });
            });
        };
        /**
         * To'lovlar eksporti
         */
        ExportService_1.prototype.exportPayments = function (dateFrom, dateTo) {
            return __awaiter(this, void 0, void 0, function () {
                var where, end, payments;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = {};
                            if (dateFrom || dateTo) {
                                where.createdAt = {};
                                if (dateFrom)
                                    where.createdAt.gte = new Date(dateFrom);
                                if (dateTo) {
                                    end = new Date(dateTo);
                                    end.setHours(23, 59, 59, 999);
                                    where.createdAt.lte = end;
                                }
                            }
                            return [4 /*yield*/, this.prisma.payment.findMany({
                                    where: where,
                                    include: { user: { select: { firstName: true, telegramId: true } } },
                                    orderBy: { createdAt: 'desc' },
                                    take: 10000,
                                })];
                        case 1:
                            payments = _a.sent();
                            return [2 /*return*/, payments.map(function (p) {
                                    var _a, _b;
                                    return ({
                                        id: p.id,
                                        miqdor: p.amount,
                                        valyuta: p.currency,
                                        status: p.status,
                                        reja: p.planType || '',
                                        karta: p.cardNumber || '',
                                        foydalanuvchi: ((_a = p.user) === null || _a === void 0 ? void 0 : _a.firstName) || '',
                                        telegramId: ((_b = p.user) === null || _b === void 0 ? void 0 : _b.telegramId) || '',
                                        sana: p.createdAt.toISOString().split('T')[0],
                                    });
                                })];
                    }
                });
            });
        };
        return ExportService_1;
    }());
    __setFunctionName(_classThis, "ExportService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExportService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExportService = _classThis;
}();
exports.ExportService = ExportService;
