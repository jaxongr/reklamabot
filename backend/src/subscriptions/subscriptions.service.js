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
exports.SubscriptionsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var PLAN_DETAILS = {
    STARTER: {
        name: 'Starter',
        price: 50000,
        currency: 'UZS',
        maxAds: -1,
        maxSessions: -1,
        maxGroups: -1,
        minInterval: 600,
        maxInterval: 1800,
        groupInterval: 5,
        durationDays: 30,
    },
    BUSINESS: {
        name: 'Business',
        price: 150000,
        currency: 'UZS',
        maxAds: -1,
        maxSessions: -1,
        maxGroups: -1,
        minInterval: 300,
        maxInterval: 900,
        groupInterval: 3,
        durationDays: 30,
    },
    PREMIUM: {
        name: 'Premium',
        price: 300000,
        currency: 'UZS',
        maxAds: -1,
        maxSessions: -1,
        maxGroups: -1,
        minInterval: 180,
        maxInterval: 600,
        groupInterval: 2,
        durationDays: 30,
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: 500000,
        currency: 'UZS',
        maxAds: -1,
        maxSessions: -1,
        maxGroups: -1,
        minInterval: 60,
        maxInterval: 300,
        groupInterval: 1,
        durationDays: 30,
    },
};
var SubscriptionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SubscriptionsService = _classThis = /** @class */ (function () {
        function SubscriptionsService_1(prisma, systemConfig) {
            this.prisma = prisma;
            this.systemConfig = systemConfig;
            this.logger = new common_1.Logger(SubscriptionsService.name);
        }
        SubscriptionsService_1.prototype.create = function (userId, planType) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, plan, startDate, endDate, subscription;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            existing = _a.sent();
                            if (existing && existing.status === client_1.SubscriptionStatus.ACTIVE) {
                                throw new common_1.BadRequestException('User already has an active subscription');
                            }
                            plan = PLAN_DETAILS[planType];
                            startDate = new Date();
                            endDate = new Date();
                            endDate.setDate(endDate.getDate() + plan.durationDays);
                            return [4 /*yield*/, this.prisma.subscription.upsert({
                                    where: { userId: userId },
                                    update: {
                                        planType: planType,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: startDate,
                                        endDate: endDate,
                                        maxAds: plan.maxAds,
                                        maxSessions: plan.maxSessions,
                                        maxGroups: plan.maxGroups,
                                        minInterval: plan.minInterval,
                                        maxInterval: plan.maxInterval,
                                        groupInterval: plan.groupInterval,
                                    },
                                    create: {
                                        userId: userId,
                                        planType: planType,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: startDate,
                                        endDate: endDate,
                                        maxAds: plan.maxAds,
                                        maxSessions: plan.maxSessions,
                                        maxGroups: plan.maxGroups,
                                        minInterval: plan.minInterval,
                                        maxInterval: plan.maxInterval,
                                        groupInterval: plan.groupInterval,
                                    },
                                })];
                        case 2:
                            subscription = _a.sent();
                            return [4 /*yield*/, this.prisma.subscriptionHistory.create({
                                    data: {
                                        userId: userId,
                                        planType: planType,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: startDate,
                                        endDate: endDate,
                                        amount: plan.price,
                                        currency: plan.currency,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            this.logger.log("Subscription created for user ".concat(userId, ": ").concat(planType));
                            return [2 /*return*/, subscription];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.findByUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription, plan;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                                include: { user: true },
                            })];
                        case 1:
                            subscription = _a.sent();
                            if (!subscription) {
                                return [2 /*return*/, null];
                            }
                            plan = PLAN_DETAILS[subscription.planType];
                            return [2 /*return*/, __assign(__assign({}, subscription), { planDetails: plan })];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.upgrade = function (userId, newPlan) {
            return __awaiter(this, void 0, void 0, function () {
                var current, planOrder, currentIndex, newIndex, plan, endDate, subscription;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            current = _a.sent();
                            if (!current) {
                                throw new common_1.NotFoundException('No active subscription found');
                            }
                            planOrder = [
                                client_1.SubscriptionPlan.STARTER,
                                client_1.SubscriptionPlan.BUSINESS,
                                client_1.SubscriptionPlan.PREMIUM,
                                client_1.SubscriptionPlan.ENTERPRISE,
                            ];
                            currentIndex = planOrder.indexOf(current.planType);
                            newIndex = planOrder.indexOf(newPlan);
                            if (newIndex <= currentIndex) {
                                throw new common_1.BadRequestException('Can only upgrade to a higher plan');
                            }
                            plan = PLAN_DETAILS[newPlan];
                            endDate = new Date();
                            endDate.setDate(endDate.getDate() + plan.durationDays);
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { userId: userId },
                                    data: {
                                        planType: newPlan,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        endDate: endDate,
                                        maxAds: plan.maxAds,
                                        maxSessions: plan.maxSessions,
                                        maxGroups: plan.maxGroups,
                                        minInterval: plan.minInterval,
                                        maxInterval: plan.maxInterval,
                                        groupInterval: plan.groupInterval,
                                    },
                                })];
                        case 2:
                            subscription = _a.sent();
                            return [4 /*yield*/, this.prisma.subscriptionHistory.create({
                                    data: {
                                        userId: userId,
                                        planType: newPlan,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: new Date(),
                                        endDate: endDate,
                                        amount: plan.price,
                                        currency: plan.currency,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            this.logger.log("Subscription upgraded for user ".concat(userId, ": ").concat(current.planType, " -> ").concat(newPlan));
                            return [2 /*return*/, subscription];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.cancel = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            subscription = _a.sent();
                            if (!subscription) {
                                throw new common_1.NotFoundException('No subscription found');
                            }
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { userId: userId },
                                    data: {
                                        status: client_1.SubscriptionStatus.CANCELLED,
                                        autoRenew: false,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            this.logger.log("Subscription cancelled for user ".concat(userId));
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.renew = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription, plan, startDate, endDate, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            subscription = _a.sent();
                            if (!subscription) {
                                throw new common_1.NotFoundException('No subscription found');
                            }
                            plan = PLAN_DETAILS[subscription.planType];
                            startDate = new Date();
                            endDate = new Date();
                            endDate.setDate(endDate.getDate() + plan.durationDays);
                            return [4 /*yield*/, this.prisma.subscription.update({
                                    where: { userId: userId },
                                    data: {
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: startDate,
                                        endDate: endDate,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [4 /*yield*/, this.prisma.subscriptionHistory.create({
                                    data: {
                                        userId: userId,
                                        planType: subscription.planType,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        startDate: startDate,
                                        endDate: endDate,
                                        amount: plan.price,
                                        currency: plan.currency,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            this.logger.log("Subscription renewed for user ".concat(userId));
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.checkExpired = function () {
            return __awaiter(this, void 0, void 0, function () {
                var expired;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.updateMany({
                                where: {
                                    status: client_1.SubscriptionStatus.ACTIVE,
                                    endDate: { lte: new Date() },
                                },
                                data: { status: client_1.SubscriptionStatus.EXPIRED },
                            })];
                        case 1:
                            expired = _a.sent();
                            this.logger.log("Expired ".concat(expired.count, " subscriptions"));
                            return [2 /*return*/, expired.count];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.getLimits = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var subscription;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.subscription.findUnique({
                                where: { userId: userId },
                            })];
                        case 1:
                            subscription = _a.sent();
                            if (!subscription || subscription.status !== client_1.SubscriptionStatus.ACTIVE) {
                                return [2 /*return*/, PLAN_DETAILS.STARTER];
                            }
                            return [2 /*return*/, {
                                    maxAds: subscription.maxAds,
                                    maxSessions: subscription.maxSessions,
                                    maxGroups: subscription.maxGroups,
                                    minInterval: subscription.minInterval,
                                    maxInterval: subscription.maxInterval,
                                    groupInterval: subscription.groupInterval,
                                }];
                    }
                });
            });
        };
        SubscriptionsService_1.prototype.getPlanDetails = function (planType) {
            return PLAN_DETAILS[planType];
        };
        SubscriptionsService_1.prototype.getAllPlans = function () {
            return __awaiter(this, void 0, void 0, function () {
                var customPlans, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.systemConfig.getSubscriptionPlans()];
                        case 1:
                            customPlans = _b.sent();
                            if (customPlans && customPlans.length > 0) {
                                return [2 /*return*/, customPlans];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 3: 
                        // Default planlarni qaytarish
                        return [2 /*return*/, Object.entries(PLAN_DETAILS).map(function (_a) {
                                var key = _a[0], value = _a[1];
                                return (__assign({ type: key }, value));
                            })];
                    }
                });
            });
        };
        return SubscriptionsService_1;
    }());
    __setFunctionName(_classThis, "SubscriptionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubscriptionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubscriptionsService = _classThis;
}();
exports.SubscriptionsService = SubscriptionsService;
