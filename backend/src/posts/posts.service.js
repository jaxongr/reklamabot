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
exports.PostsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var crypto_1 = require("crypto");
var PostsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PostsService = _classThis = /** @class */ (function () {
        function PostsService_1(prisma, telegramService) {
            this.prisma = prisma;
            this.telegramService = telegramService;
            this.logger = new common_1.Logger(PostsService.name);
            this.activePosts = new Map();
        }
        /**
         * Create new post distribution task
         */
        PostsService_1.prototype.createPost = function (adId, userId, config) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, sessions, allGroups, totalGroups, post;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.ad.findUnique({
                                where: { id: adId },
                            })];
                        case 1:
                            ad = _a.sent();
                            if (!ad) {
                                throw new common_1.NotFoundException('Ad not found');
                            }
                            if (ad.status !== client_1.AdStatus.ACTIVE) {
                                throw new Error('Ad is not active');
                            }
                            return [4 /*yield*/, this.prisma.session.findMany({
                                    where: __assign({ userId: userId, status: 'ACTIVE', isFrozen: false }, (config.selectedSessions && { id: { in: config.selectedSessions } })),
                                    include: {
                                        groups: {
                                            where: __assign({ isActive: true, isSkipped: false }, (config.usePriorityGroups && { isPriority: true })),
                                        },
                                    },
                                })];
                        case 2:
                            sessions = _a.sent();
                            if (sessions.length === 0) {
                                throw new Error('No active sessions available');
                            }
                            allGroups = sessions.flatMap(function (s) { return s.groups; });
                            totalGroups = allGroups.length;
                            if (totalGroups === 0) {
                                throw new Error('No groups available for posting');
                            }
                            return [4 /*yield*/, this.prisma.post.create({
                                    data: {
                                        adId: adId,
                                        userId: userId,
                                        sessionId: sessions[0].id, // Primary session
                                        totalGroups: totalGroups,
                                        status: client_1.PostStatus.PENDING,
                                    },
                                })];
                        case 3:
                            post = _a.sent();
                            this.logger.log("Created post: ".concat(post.id, " for ").concat(totalGroups, " groups"));
                            return [2 /*return*/, post];
                    }
                });
            });
        };
        /**
         * Start post distribution
         */
        PostsService_1.prototype.startDistribution = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, groups;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                                include: {
                                    ad: true,
                                },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            return [4 /*yield*/, this.getTargetGroups(post)];
                        case 2:
                            groups = _a.sent();
                            // Update post status
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.IN_PROGRESS,
                                        startedAt: new Date(),
                                    },
                                })];
                        case 3:
                            // Update post status
                            _a.sent();
                            // Start distribution process
                            this.distributeContent(post, groups);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get target groups for posting
         */
        PostsService_1.prototype.getTargetGroups = function (post) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, sessionId, session, groups;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ad = post.ad, sessionId = post.sessionId;
                            return [4 /*yield*/, this.prisma.session.findUnique({
                                    where: { id: sessionId },
                                    include: {
                                        groups: {
                                            where: {
                                                isActive: true,
                                                isSkipped: false,
                                            },
                                        },
                                    },
                                })];
                        case 1:
                            session = _a.sent();
                            if (!session) {
                                throw new Error('Session not found');
                            }
                            groups = session.groups;
                            // Filter by ad settings
                            if (ad.selectedGroups && ad.selectedGroups.length > 0) {
                                groups = groups.filter(function (g) { return ad.selectedGroups.includes(g.id); });
                            }
                            // Sort: priority groups first, then by activity
                            groups.sort(function (a, b) {
                                if (a.isPriority && !b.isPriority)
                                    return -1;
                                if (!a.isPriority && b.isPriority)
                                    return 1;
                                return b.activityScore - a.activityScore;
                            });
                            return [2 /*return*/, groups];
                    }
                });
            });
        };
        /**
         * Distribute content to groups
         */
        PostsService_1.prototype.distributeContent = function (post, groups) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, content, completedCount, failedCount, skippedCount, i, group, currentPost, delay, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ad = post.ad;
                            return [4 /*yield*/, this.prepareContent(post, ad)];
                        case 1:
                            content = _a.sent();
                            completedCount = 0;
                            failedCount = 0;
                            skippedCount = 0;
                            i = 0;
                            _a.label = 2;
                        case 2:
                            if (!(i < groups.length)) return [3 /*break*/, 15];
                            group = groups[i];
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 10, , 14]);
                            return [4 /*yield*/, this.prisma.post.findUnique({
                                    where: { id: post.id },
                                })];
                        case 4:
                            currentPost = _a.sent();
                            if ((currentPost === null || currentPost === void 0 ? void 0 : currentPost.status) === client_1.PostStatus.PAUSED) {
                                this.logger.log("Post ".concat(post.id, " paused at group ").concat(i));
                                return [3 /*break*/, 15];
                            }
                            // Check group restrictions
                            if (group.hasRestrictions) {
                                if (group.restrictionUntil && group.restrictionUntil > new Date()) {
                                    this.logger.log("Group ".concat(group.id, " has restrictions, skipping"));
                                    skippedCount++;
                                    return [3 /*break*/, 14];
                                }
                            }
                            // Check if group requires manual invite
                            if (group.requiresInvite) {
                                this.logger.log("Group ".concat(group.id, " requires manual invite, skipping"));
                                skippedCount++;
                                return [3 /*break*/, 14];
                            }
                            // Send message
                            return [4 /*yield*/, this.sendMessageToGroup(post.id, group, content)];
                        case 5:
                            // Send message
                            _a.sent();
                            // Update post history
                            return [4 /*yield*/, this.prisma.postHistory.create({
                                    data: {
                                        postId: post.id,
                                        groupId: group.id,
                                        userId: post.userId,
                                        status: 'SENT',
                                        sentAt: new Date(),
                                    },
                                })];
                        case 6:
                            // Update post history
                            _a.sent();
                            completedCount++;
                            // Update post progress
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: post.id },
                                    data: {
                                        completedGroups: completedCount,
                                        lastGroupIndex: i,
                                    },
                                })];
                        case 7:
                            // Update post progress
                            _a.sent();
                            if (!(i < groups.length - 1)) return [3 /*break*/, 9];
                            delay = this.calculateDelay(ad.groupInterval);
                            return [4 /*yield*/, this.sleep(delay)];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [3 /*break*/, 14];
                        case 10:
                            error_1 = _a.sent();
                            this.logger.error("Failed to send to group ".concat(group.id, ":"), error_1);
                            failedCount++;
                            // Record failure
                            return [4 /*yield*/, this.prisma.postHistory.create({
                                    data: {
                                        postId: post.id,
                                        groupId: group.id,
                                        userId: post.userId,
                                        status: 'FAILED',
                                        failedAt: new Date(),
                                        errorMessage: error_1.message,
                                    },
                                })];
                        case 11:
                            // Record failure
                            _a.sent();
                            if (!(failedCount > groups.length * 0.3)) return [3 /*break*/, 13];
                            // More than 30% failures, might be frozen
                            return [4 /*yield*/, this.handlePotentialFreeze(post)];
                        case 12:
                            // More than 30% failures, might be frozen
                            _a.sent();
                            return [3 /*break*/, 15];
                        case 13: return [3 /*break*/, 14];
                        case 14:
                            i++;
                            return [3 /*break*/, 2];
                        case 15: 
                        // Mark post as completed
                        return [4 /*yield*/, this.prisma.post.update({
                                where: { id: post.id },
                                data: {
                                    status: client_1.PostStatus.COMPLETED,
                                    completedAt: new Date(),
                                    failedGroups: failedCount,
                                    skippedGroups: skippedCount,
                                },
                            })];
                        case 16:
                            // Mark post as completed
                            _a.sent();
                            this.logger.log("Post ".concat(post.id, " completed: ").concat(completedCount, "/").concat(groups.length));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Prepare content with ad and brand advertisement
         */
        PostsService_1.prototype.prepareContent = function (post, ad) {
            return __awaiter(this, void 0, void 0, function () {
                var content, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            content = ad.content;
                            return [4 /*yield*/, this.prisma.user.findUnique({
                                    where: { id: post.userId },
                                })];
                        case 1:
                            user = _a.sent();
                            if ((user === null || user === void 0 ? void 0 : user.brandAdEnabled) && user.brandAdText) {
                                content += '\n\n' + user.brandAdText;
                            }
                            return [2 /*return*/, content];
                    }
                });
            });
        };
        /**
         * Calculate delay between posts (anti-ban)
         */
        PostsService_1.prototype.calculateDelay = function (baseInterval) {
            // Add randomness to avoid detection
            var variation = (0, crypto_1.randomInt)(500, 2000); // 0.5-2 seconds random
            return baseInterval * 1000 + variation;
        };
        /**
         * Sleep utility
         */
        PostsService_1.prototype.sleep = function (ms) {
            return new Promise(function (resolve) { return setTimeout(resolve, ms); });
        };
        /**
         * Send message to group via Telegram API
         */
        PostsService_1.prototype.sendMessageToGroup = function (postId, group, content) {
            return __awaiter(this, void 0, void 0, function () {
                var dbGroup;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log("Sending message to group ".concat(group.id, " (").concat(group.telegramId, ")"));
                            return [4 /*yield*/, this.prisma.group.findUnique({
                                    where: { id: group.id },
                                    include: { session: true },
                                })];
                        case 1:
                            dbGroup = _a.sent();
                            if (!dbGroup || !dbGroup.session) {
                                throw new Error("Group ".concat(group.id, " not found or has no session"));
                            }
                            return [4 /*yield*/, this.telegramService.sendMessage(dbGroup.sessionId, dbGroup.telegramId, content)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Handle potential freeze
         */
        PostsService_1.prototype.handlePotentialFreeze = function (post) {
            return __awaiter(this, void 0, void 0, function () {
                var unfreezeAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.warn("Potential freeze detected for post ".concat(post.id));
                            unfreezeAt = new Date(Date.now() + 10 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.session.update({
                                    where: { id: post.sessionId },
                                    data: {
                                        isFrozen: true,
                                        frozenAt: new Date(),
                                        unfreezeAt: unfreezeAt,
                                        freezeCount: { increment: 1 },
                                    },
                                })];
                        case 1:
                            _a.sent();
                            // Update post status
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: post.id },
                                    data: {
                                        status: client_1.PostStatus.PAUSED,
                                        pausedAt: new Date(),
                                    },
                                })];
                        case 2:
                            // Update post status
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Pause post distribution
         */
        PostsService_1.prototype.pausePost = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, updatedPost, timer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            if (post.status !== client_1.PostStatus.IN_PROGRESS) {
                                throw new Error('Post is not in progress');
                            }
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.PAUSED,
                                        pausedAt: new Date(),
                                        lastPausedAt: new Date(),
                                    },
                                })];
                        case 2:
                            updatedPost = _a.sent();
                            timer = this.activePosts.get(postId);
                            if (timer) {
                                clearTimeout(timer);
                                this.activePosts.delete(postId);
                            }
                            this.logger.log("Post ".concat(postId, " paused"));
                            return [2 /*return*/, updatedPost];
                    }
                });
            });
        };
        /**
         * Resume post distribution
         */
        PostsService_1.prototype.resumePost = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, timeSincePause, tenMinutes, waitTime, groups, startIndex, remainingGroups;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                                include: {
                                    ad: true,
                                },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            if (post.status !== client_1.PostStatus.PAUSED) {
                                throw new Error('Post is not paused');
                            }
                            // Check if 10 minutes have passed since last pause
                            if (post.lastPausedAt) {
                                timeSincePause = Date.now() - post.lastPausedAt.getTime();
                                tenMinutes = 10 * 60 * 1000;
                                if (timeSincePause < tenMinutes) {
                                    waitTime = Math.ceil((tenMinutes - timeSincePause) / 1000 / 60);
                                    throw new Error("Please wait ".concat(waitTime, " more minutes before resuming"));
                                }
                            }
                            return [4 /*yield*/, this.getTargetGroups(post)];
                        case 2:
                            groups = _a.sent();
                            startIndex = post.lastGroupIndex || 0;
                            remainingGroups = groups.slice(startIndex + 1);
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.IN_PROGRESS,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            this.logger.log("Resuming post ".concat(postId, " from group ").concat(startIndex + 1));
                            this.distributeContent(post, remainingGroups);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cancel post distribution
         */
        PostsService_1.prototype.cancelPost = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, updatedPost, timer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.CANCELLED,
                                    },
                                })];
                        case 2:
                            updatedPost = _a.sent();
                            timer = this.activePosts.get(postId);
                            if (timer) {
                                clearTimeout(timer);
                                this.activePosts.delete(postId);
                            }
                            this.logger.log("Post ".concat(postId, " cancelled"));
                            return [2 /*return*/, updatedPost];
                    }
                });
            });
        };
        /**
         * Get post status
         */
        PostsService_1.prototype.getStatus = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, progress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                                include: {
                                    ad: true,
                                    histories: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 50,
                                    },
                                },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            progress = post.totalGroups > 0
                                ? (post.completedGroups / post.totalGroups) * 100
                                : 0;
                            return [2 /*return*/, {
                                    post: {
                                        id: post.id,
                                        status: post.status,
                                        totalGroups: post.totalGroups,
                                        completedGroups: post.completedGroups,
                                        failedGroups: post.failedGroups,
                                        skippedGroups: post.skippedGroups,
                                        progress: Math.round(progress * 100) / 100,
                                        startedAt: post.startedAt,
                                        completedAt: post.completedAt,
                                        pausedAt: post.pausedAt,
                                    },
                                    ad: {
                                        id: post.ad.id,
                                        title: post.ad.title,
                                        content: post.ad.content,
                                    },
                                    recentHistory: post.histories,
                                }];
                    }
                });
            });
        };
        /**
         * Get all posts for user
         */
        PostsService_1.prototype.getUserPosts = function (userId, params) {
            return __awaiter(this, void 0, void 0, function () {
                var where, posts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = __assign(__assign({ userId: userId }, ((params === null || params === void 0 ? void 0 : params.status) && { status: params.status })), ((params === null || params === void 0 ? void 0 : params.adId) && { adId: params.adId }));
                            return [4 /*yield*/, this.prisma.post.findMany({
                                    where: where,
                                    include: {
                                        ad: true,
                                        _count: {
                                            select: { histories: true },
                                        },
                                    },
                                    orderBy: { createdAt: 'desc' },
                                    take: (params === null || params === void 0 ? void 0 : params.limit) || 50,
                                })];
                        case 1:
                            posts = _a.sent();
                            return [2 /*return*/, {
                                    data: posts,
                                    total: posts.length,
                                }];
                    }
                });
            });
        };
        /**
         * Delete post
         */
        PostsService_1.prototype.remove = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, deletedPost;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            // Only allow deleting cancelled or completed posts
                            if (post.status !== client_1.PostStatus.CANCELLED && post.status !== client_1.PostStatus.COMPLETED) {
                                throw new Error('Can only delete completed or cancelled posts');
                            }
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.CANCELLED,
                                    },
                                })];
                        case 2:
                            deletedPost = _a.sent();
                            this.logger.log("Post ".concat(postId, " deleted"));
                            return [2 /*return*/, deletedPost];
                    }
                });
            });
        };
        /**
         * Retry failed posts
         */
        PostsService_1.prototype.retryFailed = function (postId) {
            return __awaiter(this, void 0, void 0, function () {
                var post, failedHistories, _i, failedHistories_1, history_1, group, content, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.post.findUnique({
                                where: { id: postId },
                                include: {
                                    ad: true,
                                },
                            })];
                        case 1:
                            post = _a.sent();
                            if (!post) {
                                throw new common_1.NotFoundException('Post not found');
                            }
                            return [4 /*yield*/, this.prisma.postHistory.findMany({
                                    where: {
                                        postId: postId,
                                        status: 'FAILED',
                                    },
                                })];
                        case 2:
                            failedHistories = _a.sent();
                            if (failedHistories.length === 0) {
                                throw new Error('No failed posts to retry');
                            }
                            // Reset post for retry
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: {
                                        status: client_1.PostStatus.PENDING,
                                        completedGroups: { decrement: failedHistories.length },
                                        failedGroups: 0,
                                    },
                                })];
                        case 3:
                            // Reset post for retry
                            _a.sent();
                            _i = 0, failedHistories_1 = failedHistories;
                            _a.label = 4;
                        case 4:
                            if (!(_i < failedHistories_1.length)) return [3 /*break*/, 14];
                            history_1 = failedHistories_1[_i];
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 12, , 13]);
                            return [4 /*yield*/, this.prisma.group.findUnique({
                                    where: { id: history_1.groupId },
                                })];
                        case 6:
                            group = _a.sent();
                            if (!group) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.prepareContent(post, post.ad)];
                        case 7:
                            content = _a.sent();
                            return [4 /*yield*/, this.sendMessageToGroup(postId, group, content)];
                        case 8:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.postHistory.update({
                                    where: { id: history_1.id },
                                    data: {
                                        status: 'SENT',
                                        sentAt: new Date(),
                                        failedAt: null,
                                        errorMessage: null,
                                    },
                                })];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.post.update({
                                    where: { id: postId },
                                    data: { completedGroups: { increment: 1 } },
                                })];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            error_2 = _a.sent();
                            this.logger.error("Retry failed for group ".concat(history_1.groupId, ":"), error_2);
                            return [3 /*break*/, 13];
                        case 13:
                            _i++;
                            return [3 /*break*/, 4];
                        case 14: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Schedule post for later
         */
        PostsService_1.prototype.schedulePost = function (adId, userId, scheduledFor, config) {
            return __awaiter(this, void 0, void 0, function () {
                var ad, post, now, delay, timer;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.ad.update({
                                where: { id: adId },
                                data: {
                                    isScheduled: true,
                                    scheduledFor: scheduledFor,
                                },
                            })];
                        case 1:
                            ad = _a.sent();
                            return [4 /*yield*/, this.createPost(adId, userId, config)];
                        case 2:
                            post = _a.sent();
                            now = new Date();
                            delay = scheduledFor.getTime() - now.getTime();
                            if (delay > 0) {
                                timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var error_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, this.startDistribution(post.id)];
                                            case 1:
                                                _a.sent();
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_3 = _a.sent();
                                                this.logger.error("Scheduled post ".concat(post.id, " failed:"), error_3);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); }, delay);
                                this.activePosts.set(post.id, timer);
                            }
                            this.logger.log("Post ".concat(post.id, " scheduled for ").concat(scheduledFor));
                            return [2 /*return*/, post];
                    }
                });
            });
        };
        /**
         * Get statistics
         */
        PostsService_1.prototype.getStatistics = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var where, _a, totalPosts, inProgressPosts, completedPosts, failedPosts, todayPosts;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            where = userId ? { userId: userId } : {};
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.post.count({ where: where }),
                                    this.prisma.post.count({ where: __assign(__assign({}, where), { status: client_1.PostStatus.IN_PROGRESS }) }),
                                    this.prisma.post.count({ where: __assign(__assign({}, where), { status: client_1.PostStatus.COMPLETED }) }),
                                    this.prisma.post.count({ where: __assign(__assign({}, where), { status: client_1.PostStatus.FAILED }) }),
                                    this.prisma.post.count({
                                        where: __assign(__assign({}, where), { createdAt: {
                                                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                            } }),
                                    }),
                                ])];
                        case 1:
                            _a = _b.sent(), totalPosts = _a[0], inProgressPosts = _a[1], completedPosts = _a[2], failedPosts = _a[3], todayPosts = _a[4];
                            return [2 /*return*/, {
                                    total: totalPosts,
                                    inProgress: inProgressPosts,
                                    completed: completedPosts,
                                    failed: failedPosts,
                                    today: todayPosts,
                                }];
                    }
                });
            });
        };
        return PostsService_1;
    }());
    __setFunctionName(_classThis, "PostsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PostsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PostsService = _classThis;
}();
exports.PostsService = PostsService;
