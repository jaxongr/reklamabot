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
exports.LoginDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var LoginDto = function () {
    var _a;
    var _telegramId_decorators;
    var _telegramId_initializers = [];
    var _telegramId_extraInitializers = [];
    var _authData_decorators;
    var _authData_initializers = [];
    var _authData_extraInitializers = [];
    var _role_decorators;
    var _role_initializers = [];
    var _role_extraInitializers = [];
    return _a = /** @class */ (function () {
            function LoginDto() {
                this.telegramId = __runInitializers(this, _telegramId_initializers, void 0);
                this.authData = (__runInitializers(this, _telegramId_extraInitializers), __runInitializers(this, _authData_initializers, void 0));
                this.role = (__runInitializers(this, _authData_extraInitializers), __runInitializers(this, _role_initializers, void 0));
                __runInitializers(this, _role_extraInitializers);
            }
            return LoginDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _telegramId_decorators = [(0, swagger_1.ApiProperty)({ example: '123456789' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _authData_decorators = [(0, swagger_1.ApiProperty)({ example: 'auth_data_123' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _role_decorators = [(0, swagger_1.ApiPropertyOptional)({ example: 'DRIVER', description: 'User role (DRIVER for driver app)' }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _telegramId_decorators, { kind: "field", name: "telegramId", static: false, private: false, access: { has: function (obj) { return "telegramId" in obj; }, get: function (obj) { return obj.telegramId; }, set: function (obj, value) { obj.telegramId = value; } }, metadata: _metadata }, _telegramId_initializers, _telegramId_extraInitializers);
            __esDecorate(null, null, _authData_decorators, { kind: "field", name: "authData", static: false, private: false, access: { has: function (obj) { return "authData" in obj; }, get: function (obj) { return obj.authData; }, set: function (obj, value) { obj.authData = value; } }, metadata: _metadata }, _authData_initializers, _authData_extraInitializers);
            __esDecorate(null, null, _role_decorators, { kind: "field", name: "role", static: false, private: false, access: { has: function (obj) { return "role" in obj; }, get: function (obj) { return obj.role; }, set: function (obj, value) { obj.role = value; } }, metadata: _metadata }, _role_initializers, _role_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.LoginDto = LoginDto;
