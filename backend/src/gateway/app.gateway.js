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
exports.AppGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
var AppGateway = function () {
    var _classDecorators = [(0, websockets_1.WebSocketGateway)({
            cors: {
                origin: '*',
                credentials: true,
            },
            namespace: '/',
            transports: ['websocket', 'polling'],
            pingInterval: 10000, // 10s (default 25s)
            pingTimeout: 5000, // 5s (default 20s)
            connectTimeout: 10000,
            maxHttpBufferSize: 1e6, // 1MB
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _server_decorators;
    var _server_initializers = [];
    var _server_extraInitializers = [];
    var _handlePostingStart_decorators;
    var _handlePostingStop_decorators;
    var _handlePostingProgress_decorators;
    var _handleSessionStatus_decorators;
    var _handleDriverLocationUpdate_decorators;
    var _handleDriverStatusChange_decorators;
    var _handleChatMessage_decorators;
    var _handleChatTyping_decorators;
    var _handleChatJoin_decorators;
    var _handleChatLeave_decorators;
    var AppGateway = _classThis = /** @class */ (function () {
        function AppGateway_1(jwtService, chatService, fcmService) {
            this.jwtService = (__runInitializers(this, _instanceExtraInitializers), jwtService);
            this.chatService = chatService;
            this.fcmService = fcmService;
            this.server = __runInitializers(this, _server_initializers, void 0);
            this.logger = (__runInitializers(this, _server_extraInitializers), new common_1.Logger(AppGateway.name));
            // Track connected clients
            this.dashboardClients = new Map(); // userId → socket
            this.mobileClients = new Map(); // userId → socket
            this.driverClients = new Map(); // userId → socket
        }
        AppGateway_1.prototype.handleConnection = function (client) {
            return __awaiter(this, void 0, void 0, function () {
                var token, payload;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    try {
                        token = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) ||
                            ((_c = (_b = client.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.replace('Bearer ', ''));
                        if (!token) {
                            this.logger.warn("Unauthenticated connection attempt: ".concat(client.id));
                            client.disconnect();
                            return [2 /*return*/];
                        }
                        payload = this.jwtService.verify(token);
                        client.userId = payload.sub;
                        client.role = payload.role;
                        client.deviceType = ((_d = client.handshake.query) === null || _d === void 0 ? void 0 : _d.deviceType) || 'dashboard';
                        // Register client
                        if (client.deviceType === 'driver') {
                            this.driverClients.set(client.userId, client);
                        }
                        else if (client.deviceType === 'mobile') {
                            this.mobileClients.set(client.userId, client);
                        }
                        else {
                            this.dashboardClients.set(client.userId, client);
                        }
                        // Join user-specific room
                        client.join("user:".concat(client.userId));
                        client.join("device:".concat(client.deviceType));
                        this.logger.log("Client connected: ".concat(client.id, " (").concat(client.deviceType, ", user: ").concat(client.userId, ")"));
                        // Notify dashboard that mobile is online (or vice versa)
                        this.server.to("user:".concat(client.userId)).emit('device:status', {
                            deviceType: client.deviceType,
                            status: 'online',
                        });
                    }
                    catch (error) {
                        this.logger.warn("Auth failed for ".concat(client.id, ": ").concat(error.message));
                        client.disconnect();
                    }
                    return [2 /*return*/];
                });
            });
        };
        AppGateway_1.prototype.handleDisconnect = function (client) {
            if (client.userId) {
                if (client.deviceType === 'driver') {
                    this.driverClients.delete(client.userId);
                }
                else if (client.deviceType === 'mobile') {
                    this.mobileClients.delete(client.userId);
                }
                else {
                    this.dashboardClients.delete(client.userId);
                }
                // Notify other devices
                this.server.to("user:".concat(client.userId)).emit('device:status', {
                    deviceType: client.deviceType,
                    status: 'offline',
                });
                this.logger.log("Client disconnected: ".concat(client.id, " (").concat(client.deviceType, ", user: ").concat(client.userId, ")"));
            }
        };
        // ============================================================
        // POSTING EVENTS
        // ============================================================
        /**
         * Dashboard → Backend → Mobile: Tarqatishni boshlash
         */
        AppGateway_1.prototype.handlePostingStart = function (client, data) {
            var _a;
            var userId = client.userId;
            if (!userId)
                return;
            this.logger.log("Posting start: user ".concat(userId, ", ad ").concat(data.adId, ", ").concat(data.groups.length, " groups"));
            // Send command to mobile app
            var mobileClient = this.mobileClients.get(userId);
            if (mobileClient) {
                mobileClient.emit('posting:command', {
                    type: 'START_POSTING',
                    adId: data.adId,
                    content: data.content,
                    mediaUrls: data.mediaUrls,
                    mediaType: data.mediaType,
                    groups: data.groups,
                    safeMode: (_a = data.safeMode) !== null && _a !== void 0 ? _a : false,
                    timestamp: new Date().toISOString(),
                });
                return { success: true, message: 'Buyruq mobilga yuborildi' };
            }
            return { success: false, message: 'Mobil qurilma ulanmagan' };
        };
        /**
         * Dashboard → Backend → Mobile: Tarqatishni to'xtatish
         */
        AppGateway_1.prototype.handlePostingStop = function (client, data) {
            var userId = client.userId;
            if (!userId)
                return;
            var mobileClient = this.mobileClients.get(userId);
            if (mobileClient) {
                mobileClient.emit('posting:command', {
                    type: 'STOP_POSTING',
                    adId: data.adId,
                    timestamp: new Date().toISOString(),
                });
                return { success: true };
            }
            return { success: false, message: 'Mobil qurilma ulanmagan' };
        };
        /**
         * Mobile → Backend → Dashboard: Posting progress
         */
        AppGateway_1.prototype.handlePostingProgress = function (client, data) {
            var userId = client.userId;
            if (!userId)
                return;
            // Forward progress to dashboard
            var dashboardClient = this.dashboardClients.get(userId);
            if (dashboardClient) {
                dashboardClient.emit('posting:update', data);
            }
        };
        // ============================================================
        // SESSION EVENTS
        // ============================================================
        /**
         * Mobile → Backend → Dashboard: Session status update
         */
        AppGateway_1.prototype.handleSessionStatus = function (client, data) {
            var userId = client.userId;
            if (!userId)
                return;
            // Forward to dashboard
            var dashboardClient = this.dashboardClients.get(userId);
            if (dashboardClient) {
                dashboardClient.emit('session:update', data);
            }
        };
        // ============================================================
        // ORDER EVENTS (Server → Dashboard + Mobile)
        // ============================================================
        /**
         * Emit new order to dashboard AND mobile (called from MonitorService)
         */
        AppGateway_1.prototype.emitNewOrder = function (userId, order) {
            var dashCount = this.dashboardClients.size;
            var mobileCount = this.mobileClients.size;
            this.logger.log("[WS] Emitting order:new to ".concat(dashCount, " dashboard(s) + ").concat(mobileCount, " mobile(s)"));
            // Dashboard — broadcast to all dashboards
            this.server.to('device:dashboard').emit('order:new', order);
            // Mobile — broadcast to ALL mobile clients (userId har xil bo'lishi mumkin)
            this.server.to('device:mobile').emit('order:new', order);
            // Driver — broadcast to ALL driver clients
            // Phone yashirish — driverlar uchun phone + messageText'dagi raqamlar strip
            var phone = order.phone, senderPhone = order.senderPhone, orderWithoutPhone = __rest(order, ["phone", "senderPhone"]);
            var cleanMsg = orderWithoutPhone.messageText;
            if (cleanMsg) {
                cleanMsg = cleanMsg.replace(/(\+?\d[\d\s\-()]{7,15}\d)/g, '** *** ** **');
            }
            this.server.to('device:driver').emit('order:new', __assign(__assign({}, orderWithoutPhone), { phone: null, senderPhone: null, messageText: cleanMsg }));
        };
        /**
         * Emit order stats update
         */
        AppGateway_1.prototype.emitOrderStats = function (userId, stats) {
            this.server.to('device:dashboard').emit('order:stats', stats);
            // Mobile ga ham broadcast
            this.server.to('device:mobile').emit('order:stats', stats);
        };
        // ============================================================
        // UTILITY METHODS
        // ============================================================
        /**
         * Check if mobile client is connected
         */
        AppGateway_1.prototype.isMobileConnected = function (userId) {
            return this.mobileClients.has(userId);
        };
        /**
         * Check if dashboard client is connected
         */
        AppGateway_1.prototype.isDashboardConnected = function (userId) {
            return this.dashboardClients.has(userId);
        };
        /**
         * Get connected mobile clients count
         */
        AppGateway_1.prototype.getMobileClientCount = function () {
            return this.mobileClients.size;
        };
        /**
         * Send message to specific user's device
         */
        AppGateway_1.prototype.sendToUser = function (userId, event, data) {
            this.server.to("user:".concat(userId)).emit(event, data);
        };
        /**
         * Send to user's mobile device only
         */
        AppGateway_1.prototype.sendToMobile = function (userId, event, data) {
            var mobileClient = this.mobileClients.get(userId);
            if (mobileClient) {
                mobileClient.emit(event, data);
            }
        };
        /**
         * Send to user's dashboard only
         */
        AppGateway_1.prototype.sendToDashboard = function (userId, event, data) {
            var dashboardClient = this.dashboardClients.get(userId);
            if (dashboardClient) {
                dashboardClient.emit(event, data);
            }
        };
        /**
         * Broadcast to all connected dashboards
         */
        AppGateway_1.prototype.broadcastToDashboards = function (event, data) {
            this.server.to('device:dashboard').emit(event, data);
        };
        // ============================================================
        // FCM PUSH HELPERS
        // ============================================================
        /**
         * Hozir WebSocket'ga ulangan barcha mobile foydalanuvchi ID'lari
         */
        AppGateway_1.prototype.getConnectedMobileUserIds = function () {
            var ids = new Set();
            for (var _i = 0, _a = this.mobileClients.keys(); _i < _a.length; _i++) {
                var userId = _a[_i];
                ids.add(userId);
            }
            for (var _b = 0, _c = this.driverClients.keys(); _b < _c.length; _b++) {
                var userId = _c[_b];
                ids.add(userId);
            }
            return ids;
        };
        /**
         * Yangi order: WS + FCM push (offline userlarga)
         */
        AppGateway_1.prototype.emitNewOrderWithFcm = function (userId, order) {
            return __awaiter(this, void 0, void 0, function () {
                var route, body, connectedIds;
                var _this = this;
                return __generator(this, function (_a) {
                    // WS broadcast (mavjud logika)
                    this.emitNewOrder(userId, order);
                    route = order.cargoFrom && order.cargoTo
                        ? "".concat(order.cargoFrom, " \u2192 ").concat(order.cargoTo)
                        : 'Yangi yuk';
                    body = [
                        order.phone,
                        order.cargoWeight ? "".concat(order.cargoWeight, " kg") : null,
                        order.vehicleType,
                    ].filter(Boolean).join(' | ');
                    connectedIds = this.getConnectedMobileUserIds();
                    this.fcmService.sendToOfflineUsers("Yangi yuk: ".concat(route), body || 'Batafsil ko\'rish uchun bosing', { type: 'new_order', orderId: order.id }, connectedIds, true).catch(function (err) {
                        _this.logger.error("FCM new order xatosi: ".concat(err.message));
                    });
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Chat xabari: qabul qiluvchi offline? → FCM push
         */
        AppGateway_1.prototype.sendChatFcmPush = function (recipientUserId, senderName, message, chatRoomId) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    // Agar qabul qiluvchi WS'da ulangan bo'lsa — FCM kerak emas
                    if (this.mobileClients.has(recipientUserId) || this.driverClients.has(recipientUserId)) {
                        return [2 /*return*/];
                    }
                    this.fcmService.sendToUser(recipientUserId, senderName, message.length > 100 ? message.substring(0, 100) + '...' : message, { type: 'chat_message', chatRoomId: chatRoomId }).catch(function (err) {
                        _this.logger.error("FCM chat xatosi: ".concat(err.message));
                    });
                    return [2 /*return*/];
                });
            });
        };
        // ============================================================
        // DRIVER EVENTS
        // ============================================================
        /**
         * Driver → Backend → Dashboard: GPS location update
         */
        AppGateway_1.prototype.handleDriverLocationUpdate = function (client, data) {
            var userId = client.userId;
            if (!userId)
                return;
            // Forward to all dashboards
            this.server.to('device:dashboard').emit('driver:locationUpdate', __assign(__assign({ userId: userId }, data), { timestamp: new Date().toISOString() }));
        };
        /**
         * Driver → Backend → Dashboard: Online/Offline status change
         */
        AppGateway_1.prototype.handleDriverStatusChange = function (client, data) {
            var userId = client.userId;
            if (!userId)
                return;
            this.server.to('device:dashboard').emit('driver:statusChange', {
                userId: userId,
                isOnline: data.isOnline,
                timestamp: new Date().toISOString(),
            });
        };
        /**
         * Emit new driver offer to dashboards (called from DriversService)
         */
        AppGateway_1.prototype.emitNewDriverOffer = function (offer) {
            this.server.to('device:dashboard').emit('driver:newOffer', offer);
        };
        /**
         * Emit private order to specific driver (called from DriversService)
         */
        AppGateway_1.prototype.emitPrivateOrder = function (driverId, order) {
            var driverClient = this.driverClients.get(driverId);
            if (driverClient) {
                driverClient.emit('driver:privateOrder', order);
            }
        };
        /**
         * Emit to all driver clients
         */
        AppGateway_1.prototype.broadcastToDrivers = function (event, data) {
            this.server.to('device:driver').emit(event, data);
        };
        /**
         * Emit order accepted to dashboards
         */
        AppGateway_1.prototype.emitOrderAccepted = function (order) {
            this.server.to('device:dashboard').emit('driver:orderAccepted', order);
        };
        /**
         * Send to driver's device
         */
        AppGateway_1.prototype.sendToDriver = function (userId, event, data) {
            var driverClient = this.driverClients.get(userId);
            if (driverClient) {
                driverClient.emit(event, data);
            }
        };
        /**
         * Get connected driver clients count
         */
        AppGateway_1.prototype.getDriverClientCount = function () {
            return this.driverClients.size;
        };
        // ============================================================
        // CHAT EVENTS
        // ============================================================
        /**
         * Client → Backend: Chat xabari (typing, message)
         */
        AppGateway_1.prototype.handleChatMessage = function (client, data) {
            return __awaiter(this, void 0, void 0, function () {
                var savedMsg, participants, senderName, _i, participants_1, participant, fcmErr_1, e_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            return [4 /*yield*/, this.chatService.sendMessage(data.chatRoomId, client.userId, data.message)];
                        case 1:
                            savedMsg = _b.sent();
                            // DB dan qaytgan ma'lumotni broadcast qilish (to'g'ri sender bilan)
                            this.server.to("chat:".concat(data.chatRoomId)).emit('chat:newMessage', savedMsg);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.chatService.getRoomParticipants(data.chatRoomId)];
                        case 3:
                            participants = _b.sent();
                            senderName = ((_a = savedMsg === null || savedMsg === void 0 ? void 0 : savedMsg.sender) === null || _a === void 0 ? void 0 : _a.firstName) || 'Foydalanuvchi';
                            for (_i = 0, participants_1 = participants; _i < participants_1.length; _i++) {
                                participant = participants_1[_i];
                                if (participant.userId !== client.userId) {
                                    this.sendChatFcmPush(participant.userId, senderName, data.message, data.chatRoomId);
                                }
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            fcmErr_1 = _b.sent();
                            return [3 /*break*/, 5];
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            e_1 = _b.sent();
                            this.logger.error("Chat message error: ".concat(e_1.message));
                            client.emit('chat:error', { message: 'Xabar yuborilmadi' });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        AppGateway_1.prototype.handleChatTyping = function (client, data) {
            client.to("chat:".concat(data.chatRoomId)).emit('chat:typing', {
                chatRoomId: data.chatRoomId,
                userId: client.userId,
            });
        };
        AppGateway_1.prototype.handleChatJoin = function (client, data) {
            client.join("chat:".concat(data.chatRoomId));
        };
        AppGateway_1.prototype.handleChatLeave = function (client, data) {
            client.leave("chat:".concat(data.chatRoomId));
        };
        /**
         * Emit chat message (called from ChatService)
         */
        AppGateway_1.prototype.emitChatMessage = function (chatRoomId, message) {
            this.server.to("chat:".concat(chatRoomId)).emit('chat:newMessage', message);
        };
        // ============================================================
        // NOTIFICATION EVENTS
        // ============================================================
        /**
         * Emit notification to specific user or broadcast
         */
        AppGateway_1.prototype.emitNotification = function (userId, notification) {
            if (userId) {
                this.server.to("user:".concat(userId)).emit('notification:new', notification);
            }
            else {
                // Broadcast to all
                this.server.emit('notification:new', notification);
            }
        };
        /**
         * Broadcast notification to all dashboards
         */
        AppGateway_1.prototype.emitNotificationToDashboards = function (notification) {
            this.server.to('device:dashboard').emit('notification:new', notification);
        };
        // ============================================================
        // SURGE EVENTS
        // ============================================================
        /**
         * Emit surge price update to dashboards and mobile
         */
        AppGateway_1.prototype.emitSurgeUpdate = function (surgeData) {
            this.server.to('device:dashboard').emit('surge:update', surgeData);
            this.server.to('device:mobile').emit('surge:update', surgeData);
            this.server.to('device:driver').emit('surge:update', surgeData);
        };
        // ============================================================
        // SUPPORT EVENTS
        // ============================================================
        /**
         * Emit new support ticket/message
         */
        AppGateway_1.prototype.emitSupportUpdate = function (userId, data) {
            this.server.to("user:".concat(userId)).emit('support:update', data);
            // Also notify dashboards
            this.server.to('device:dashboard').emit('support:update', data);
        };
        return AppGateway_1;
    }());
    __setFunctionName(_classThis, "AppGateway");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [(0, websockets_1.WebSocketServer)()];
        _handlePostingStart_decorators = [(0, websockets_1.SubscribeMessage)('posting:start')];
        _handlePostingStop_decorators = [(0, websockets_1.SubscribeMessage)('posting:stop')];
        _handlePostingProgress_decorators = [(0, websockets_1.SubscribeMessage)('posting:progress')];
        _handleSessionStatus_decorators = [(0, websockets_1.SubscribeMessage)('session:status')];
        _handleDriverLocationUpdate_decorators = [(0, websockets_1.SubscribeMessage)('driver:locationUpdate')];
        _handleDriverStatusChange_decorators = [(0, websockets_1.SubscribeMessage)('driver:statusChange')];
        _handleChatMessage_decorators = [(0, websockets_1.SubscribeMessage)('chat:message')];
        _handleChatTyping_decorators = [(0, websockets_1.SubscribeMessage)('chat:typing')];
        _handleChatJoin_decorators = [(0, websockets_1.SubscribeMessage)('chat:join')];
        _handleChatLeave_decorators = [(0, websockets_1.SubscribeMessage)('chat:leave')];
        __esDecorate(_classThis, null, _handlePostingStart_decorators, { kind: "method", name: "handlePostingStart", static: false, private: false, access: { has: function (obj) { return "handlePostingStart" in obj; }, get: function (obj) { return obj.handlePostingStart; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handlePostingStop_decorators, { kind: "method", name: "handlePostingStop", static: false, private: false, access: { has: function (obj) { return "handlePostingStop" in obj; }, get: function (obj) { return obj.handlePostingStop; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handlePostingProgress_decorators, { kind: "method", name: "handlePostingProgress", static: false, private: false, access: { has: function (obj) { return "handlePostingProgress" in obj; }, get: function (obj) { return obj.handlePostingProgress; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleSessionStatus_decorators, { kind: "method", name: "handleSessionStatus", static: false, private: false, access: { has: function (obj) { return "handleSessionStatus" in obj; }, get: function (obj) { return obj.handleSessionStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleDriverLocationUpdate_decorators, { kind: "method", name: "handleDriverLocationUpdate", static: false, private: false, access: { has: function (obj) { return "handleDriverLocationUpdate" in obj; }, get: function (obj) { return obj.handleDriverLocationUpdate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleDriverStatusChange_decorators, { kind: "method", name: "handleDriverStatusChange", static: false, private: false, access: { has: function (obj) { return "handleDriverStatusChange" in obj; }, get: function (obj) { return obj.handleDriverStatusChange; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleChatMessage_decorators, { kind: "method", name: "handleChatMessage", static: false, private: false, access: { has: function (obj) { return "handleChatMessage" in obj; }, get: function (obj) { return obj.handleChatMessage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleChatTyping_decorators, { kind: "method", name: "handleChatTyping", static: false, private: false, access: { has: function (obj) { return "handleChatTyping" in obj; }, get: function (obj) { return obj.handleChatTyping; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleChatJoin_decorators, { kind: "method", name: "handleChatJoin", static: false, private: false, access: { has: function (obj) { return "handleChatJoin" in obj; }, get: function (obj) { return obj.handleChatJoin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleChatLeave_decorators, { kind: "method", name: "handleChatLeave", static: false, private: false, access: { has: function (obj) { return "handleChatLeave" in obj; }, get: function (obj) { return obj.handleChatLeave; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: function (obj) { return "server" in obj; }, get: function (obj) { return obj.server; }, set: function (obj, value) { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppGateway = _classThis;
}();
exports.AppGateway = AppGateway;
