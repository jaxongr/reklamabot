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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var roles_guard_1 = require("../auth/guards/roles.guard");
var swagger_1 = require("@nestjs/swagger");
var PostsController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Posts'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('posts'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _getStatistics_decorators;
    var _getStatus_decorators;
    var _start_decorators;
    var _pause_decorators;
    var _resume_decorators;
    var _cancel_decorators;
    var _retry_decorators;
    var _startPosting_decorators;
    var _stopPosting_decorators;
    var _getPostingStatus_decorators;
    var _remove_decorators;
    var PostsController = _classThis = /** @class */ (function () {
        function PostsController_1(postsService, postingService, prisma) {
            this.postsService = (__runInitializers(this, _instanceExtraInitializers), postsService);
            this.postingService = postingService;
            this.prisma = prisma;
        }
        PostsController_1.prototype.create = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                var adId, config;
                return __generator(this, function (_a) {
                    adId = body.adId, config = __rest(body, ["adId"]);
                    return [2 /*return*/, this.postsService.createPost(adId, req.user.userId, config)];
                });
            });
        };
        PostsController_1.prototype.findAll = function (req, status, adId, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.getUserPosts(req.user.userId, {
                            status: status,
                            adId: adId,
                            limit: limit ? parseInt(limit) : 50,
                        })];
                });
            });
        };
        PostsController_1.prototype.getStatistics = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.getStatistics(req.user.userId)];
                });
            });
        };
        PostsController_1.prototype.getStatus = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.getStatus(id)];
                });
            });
        };
        PostsController_1.prototype.start = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.postsService.startDistribution(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: 'Distribution started' }];
                    }
                });
            });
        };
        PostsController_1.prototype.pause = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.pausePost(id)];
                });
            });
        };
        PostsController_1.prototype.resume = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.postsService.resumePost(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: 'Distribution resumed' }];
                    }
                });
            });
        };
        PostsController_1.prototype.cancel = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.cancelPost(id)];
                });
            });
        };
        PostsController_1.prototype.retry = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.postsService.retryFailed(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: 'Retrying failed deliveries' }];
                    }
                });
            });
        };
        PostsController_1.prototype.startPosting = function (req, adId) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, user, content, replacementPhone, phoneRegex, job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.ad.findUnique({ where: { id: adId } })];
                        case 1:
                            ad = _a.sent();
                            if (!ad) {
                                throw new Error("E'lon topilmadi");
                            }
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: req.user.userId },
                                    select: { adPhoneNumbers: true },
                                })];
                        case 2:
                            user = _a.sent();
                            content = ad.content;
                            if ((user === null || user === void 0 ? void 0 : user.adPhoneNumbers) && user.adPhoneNumbers.length > 0) {
                                replacementPhone = user.adPhoneNumbers[0];
                                phoneRegex = /(\+?\d{3}[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})/g;
                                content = content.replace(phoneRegex, replacementPhone);
                            }
                            return [4 /*yield*/, this.postingService.startPosting(adId, content, req.user.userId)];
                        case 3:
                            job = _a.sent();
                            return [2 /*return*/, {
                                    jobId: job.id,
                                    status: job.status,
                                    totalGroups: job.totalGroups,
                                    message: 'Tarqatish boshlandi',
                                }];
                    }
                });
            });
        };
        PostsController_1.prototype.stopPosting = function (req, adId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobs, job;
                return __generator(this, function (_a) {
                    jobs = this.postingService.getUserJobs(req.user.userId);
                    job = jobs.find(function (j) { return j.adId === adId && j.status === 'running'; });
                    if (!job) {
                        throw new Error("Bu e'lon uchun faol tarqatish topilmadi");
                    }
                    this.postingService.stopJob(job.id);
                    return [2 /*return*/, {
                            jobId: job.id,
                            message: "Tarqatish to'xtatildi",
                        }];
                });
            });
        };
        PostsController_1.prototype.getPostingStatus = function (req, adId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobs, job, stats;
                return __generator(this, function (_a) {
                    jobs = this.postingService.getUserJobs(req.user.userId);
                    job = jobs.find(function (j) { return j.adId === adId; });
                    if (!job) {
                        return [2 /*return*/, { active: false, message: 'Faol tarqatish yo\'q' }];
                    }
                    stats = this.postingService.getJobStats(job.id);
                    return [2 /*return*/, __assign({ active: job.status === 'running', jobId: job.id, status: job.status }, stats)];
                });
            });
        };
        PostsController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.postsService.remove(id)];
                });
            });
        };
        return PostsController_1;
    }());
    __setFunctionName(_classThis, "PostsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: 'Create post distribution' })];
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: 'Get posts list' })];
        _getStatistics_decorators = [(0, common_1.Get)('statistics'), (0, swagger_1.ApiOperation)({ summary: 'Get overall post statistics' })];
        _getStatus_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Get post status' })];
        _start_decorators = [(0, common_1.Post)(':id/start'), (0, swagger_1.ApiOperation)({ summary: 'Start distribution' })];
        _pause_decorators = [(0, common_1.Post)(':id/pause'), (0, swagger_1.ApiOperation)({ summary: 'Pause distribution' })];
        _resume_decorators = [(0, common_1.Post)(':id/resume'), (0, swagger_1.ApiOperation)({ summary: 'Resume distribution' })];
        _cancel_decorators = [(0, common_1.Post)(':id/cancel'), (0, swagger_1.ApiOperation)({ summary: 'Cancel distribution' })];
        _retry_decorators = [(0, common_1.Post)(':id/retry'), (0, swagger_1.ApiOperation)({ summary: 'Retry failed deliveries' })];
        _startPosting_decorators = [(0, common_1.Post)('start-posting/:adId'), (0, swagger_1.ApiOperation)({ summary: 'Start posting for ad (admin dashboard)' })];
        _stopPosting_decorators = [(0, common_1.Post)('stop-posting/:adId'), (0, swagger_1.ApiOperation)({ summary: 'Stop posting for ad' })];
        _getPostingStatus_decorators = [(0, common_1.Get)('posting-status/:adId'), (0, swagger_1.ApiOperation)({ summary: 'Get posting status for ad' })];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: 'Delete post' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatistics_decorators, { kind: "method", name: "getStatistics", static: false, private: false, access: { has: function (obj) { return "getStatistics" in obj; }, get: function (obj) { return obj.getStatistics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: function (obj) { return "getStatus" in obj; }, get: function (obj) { return obj.getStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _start_decorators, { kind: "method", name: "start", static: false, private: false, access: { has: function (obj) { return "start" in obj; }, get: function (obj) { return obj.start; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _pause_decorators, { kind: "method", name: "pause", static: false, private: false, access: { has: function (obj) { return "pause" in obj; }, get: function (obj) { return obj.pause; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resume_decorators, { kind: "method", name: "resume", static: false, private: false, access: { has: function (obj) { return "resume" in obj; }, get: function (obj) { return obj.resume; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _retry_decorators, { kind: "method", name: "retry", static: false, private: false, access: { has: function (obj) { return "retry" in obj; }, get: function (obj) { return obj.retry; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _startPosting_decorators, { kind: "method", name: "startPosting", static: false, private: false, access: { has: function (obj) { return "startPosting" in obj; }, get: function (obj) { return obj.startPosting; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _stopPosting_decorators, { kind: "method", name: "stopPosting", static: false, private: false, access: { has: function (obj) { return "stopPosting" in obj; }, get: function (obj) { return obj.stopPosting; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPostingStatus_decorators, { kind: "method", name: "getPostingStatus", static: false, private: false, access: { has: function (obj) { return "getPostingStatus" in obj; }, get: function (obj) { return obj.getPostingStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PostsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PostsController = _classThis;
}();
exports.PostsController = PostsController;
