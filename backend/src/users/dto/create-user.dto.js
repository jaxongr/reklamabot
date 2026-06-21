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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var client_1 = require("@prisma/client");
var CreateUserDto = function () {
    var _a;
    var _telegramId_decorators;
    var _telegramId_initializers = [];
    var _telegramId_extraInitializers = [];
    var _username_decorators;
    var _username_initializers = [];
    var _username_extraInitializers = [];
    var _firstName_decorators;
    var _firstName_initializers = [];
    var _firstName_extraInitializers = [];
    var _lastName_decorators;
    var _lastName_initializers = [];
    var _lastName_extraInitializers = [];
    var _phoneNumber_decorators;
    var _phoneNumber_initializers = [];
    var _phoneNumber_extraInitializers = [];
    var _language_decorators;
    var _language_initializers = [];
    var _language_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateUserDto() {
                this.telegramId = __runInitializers(this, _telegramId_initializers, void 0);
                this.username = (__runInitializers(this, _telegramId_extraInitializers), __runInitializers(this, _username_initializers, void 0));
                this.firstName = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _firstName_initializers, void 0));
                this.lastName = (__runInitializers(this, _firstName_extraInitializers), __runInitializers(this, _lastName_initializers, void 0));
                this.phoneNumber = (__runInitializers(this, _lastName_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
                this.language = (__runInitializers(this, _phoneNumber_extraInitializers), __runInitializers(this, _language_initializers, void 0));
                this.role = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                this.isActive = (__runInitializers(this, _role_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                __runInitializers(this, _isActive_extraInitializers);
            }
            return CreateUserDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _telegramId_decorators = [(0, swagger_1.ApiProperty)(), (0, class_validator_1.IsString)()];
            _username_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _firstName_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _lastName_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _phoneNumber_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _language_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _role_decorators = [(0, swagger_1.ApiPropertyOptional)({ enum: client_1.UserRole }), (0, class_validator_1.IsEnum)(client_1.UserRole), (0, class_validator_1.IsOptional)()];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _telegramId_decorators, { kind: "field", name: "telegramId", static: false, private: false, access: { has: function (obj) { return "telegramId" in obj; }, get: function (obj) { return obj.telegramId; }, set: function (obj, value) { obj.telegramId = value; } }, metadata: _metadata }, _telegramId_initializers, _telegramId_extraInitializers);
            __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: function (obj) { return "username" in obj; }, get: function (obj) { return obj.username; }, set: function (obj, value) { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
            __esDecorate(null, null, _firstName_decorators, { kind: "field", name: "firstName", static: false, private: false, access: { has: function (obj) { return "firstName" in obj; }, get: function (obj) { return obj.firstName; }, set: function (obj, value) { obj.firstName = value; } }, metadata: _metadata }, _firstName_initializers, _firstName_extraInitializers);
            __esDecorate(null, null, _lastName_decorators, { kind: "field", name: "lastName", static: false, private: false, access: { has: function (obj) { return "lastName" in obj; }, get: function (obj) { return obj.lastName; }, set: function (obj, value) { obj.lastName = value; } }, metadata: _metadata }, _lastName_initializers, _lastName_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: function (obj) { return "phoneNumber" in obj; }, get: function (obj) { return obj.phoneNumber; }, set: function (obj, value) { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: function (obj) { return "language" in obj; }, get: function (obj) { return obj.language; }, set: function (obj, value) { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateUserDto = CreateUserDto;
