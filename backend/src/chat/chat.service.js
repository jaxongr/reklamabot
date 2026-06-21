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
exports.ChatService = void 0;
var common_1 = require("@nestjs/common");
var ChatService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ChatService = _classThis = /** @class */ (function () {
        function ChatService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(ChatService.name);
        }
        /**
         * Task 17: Chat xonasi yaratish
         */
        ChatService_1.prototype.createRoom = function (name, type, participantIds) {
            return __awaiter(this, void 0, void 0, function () {
                var room;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.chatRoom.create({
                                data: {
                                    name: name,
                                    type: type,
                                    participants: {
                                        create: participantIds.map(function (userId, i) { return ({
                                            userId: userId,
                                            isAdmin: i === 0, // Birinchi ishtirokchi admin
                                        }); }),
                                    },
                                },
                                include: { participants: { include: { user: { select: { id: true, firstName: true, username: true } } } } },
                            })];
                        case 1:
                            room = _a.sent();
                            return [2 /*return*/, room];
                    }
                });
            });
        };
        /**
         * Foydalanuvchi xonalari
         */
        ChatService_1.prototype.getUserRooms = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var rooms;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.chatRoom.findMany({
                                where: {
                                    isActive: true,
                                    participants: { some: { userId: userId } },
                                },
                                include: {
                                    participants: {
                                        include: { user: { select: { id: true, firstName: true, username: true } } },
                                    },
                                    messages: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 1,
                                        select: { message: true, createdAt: true, sender: { select: { firstName: true } } },
                                    },
                                    _count: { select: { messages: true } },
                                },
                                orderBy: { updatedAt: 'desc' },
                            })];
                        case 1:
                            rooms = _a.sent();
                            return [2 /*return*/, rooms];
                    }
                });
            });
        };
        /**
         * Xona xabarlari
         */
        ChatService_1.prototype.getRoomMessages = function (roomId_1) {
            return __awaiter(this, arguments, void 0, function (roomId, page, limit) {
                var skip, _a, messages, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 50; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.chatMessage.findMany({
                                        where: { chatRoomId: roomId, isDeleted: false },
                                        include: { sender: { select: { id: true, firstName: true, username: true, role: true } } },
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.chatMessage.count({ where: { chatRoomId: roomId, isDeleted: false } }),
                                ])];
                        case 1:
                            _a = _b.sent(), messages = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: messages.reverse(),
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        /**
         * Xabar yuborish
         */
        ChatService_1.prototype.sendMessage = function (roomId, senderId, message) {
            return __awaiter(this, void 0, void 0, function () {
                var room, msg;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.chatRoom.findUnique({ where: { id: roomId } })];
                        case 1:
                            room = _a.sent();
                            if (!room)
                                throw new common_1.NotFoundException('Chat xonasi topilmadi');
                            return [4 /*yield*/, this.prisma.chatMessage.create({
                                    data: { chatRoomId: roomId, senderId: senderId, message: message },
                                    include: { sender: { select: { id: true, firstName: true, username: true, role: true } } },
                                })];
                        case 2:
                            msg = _a.sent();
                            // Xona updatedAt yangilash
                            return [4 /*yield*/, this.prisma.chatRoom.update({
                                    where: { id: roomId },
                                    data: { updatedAt: new Date() },
                                })];
                        case 3:
                            // Xona updatedAt yangilash
                            _a.sent();
                            return [2 /*return*/, msg];
                    }
                });
            });
        };
        /**
         * Support xonasi yaratish (yoki mavjudini qaytarish)
         */
        ChatService_1.prototype.getOrCreateSupportRoom = function (userId, type) {
            return __awaiter(this, void 0, void 0, function () {
                var existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.chatRoom.findFirst({
                                where: {
                                    type: type,
                                    isActive: true,
                                    participants: { some: { userId: userId } },
                                },
                                include: {
                                    participants: {
                                        include: { user: { select: { id: true, firstName: true, username: true } } },
                                    },
                                },
                            })];
                        case 1:
                            existing = _a.sent();
                            if (existing)
                                return [2 /*return*/, existing];
                            // Yangi xona yaratish
                            return [2 /*return*/, this.createRoom("Support: ".concat(userId), type, [userId])];
                    }
                });
            });
        };
        /**
         * Chat room ishtirokchilari (FCM uchun)
         */
        ChatService_1.prototype.getRoomParticipants = function (roomId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.chatParticipant.findMany({
                            where: { chatRoomId: roomId },
                            select: { userId: true },
                        })];
                });
            });
        };
        /**
         * Admin: Barcha chat xonalari
         */
        ChatService_1.prototype.getAllRooms = function (type_1) {
            return __awaiter(this, arguments, void 0, function (type, page, limit) {
                var skip, where, _a, data, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            where = { isActive: true };
                            if (type)
                                where.type = type;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.chatRoom.findMany({
                                        where: where,
                                        include: {
                                            participants: {
                                                include: { user: { select: { id: true, firstName: true, username: true } } },
                                            },
                                            messages: {
                                                orderBy: { createdAt: 'desc' },
                                                take: 1,
                                            },
                                            _count: { select: { messages: true } },
                                        },
                                        orderBy: { updatedAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                    }),
                                    this.prisma.chatRoom.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), data = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: data,
                                    pagination: { total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        return ChatService_1;
    }());
    __setFunctionName(_classThis, "ChatService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChatService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChatService = _classThis;
}();
exports.ChatService = ChatService;
