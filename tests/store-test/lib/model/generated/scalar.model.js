"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scalar = void 0;
const core_1 = require("@mikro-orm/core");
const types = __importStar(require("./types"));
let Scalar = class Scalar {
    constructor(props) {
        Object.assign(this, props);
    }
};
__decorate([
    (0, core_1.PrimaryKey)({ type: types.StringType })
], Scalar.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: types.BooleanType, nullable: true })
], Scalar.prototype, "boolean", void 0);
__decorate([
    (0, core_1.Property)({ type: types.BigIntType, nullable: true })
], Scalar.prototype, "bigint", void 0);
__decorate([
    (0, core_1.Property)({ type: types.BigDecimalType, nullable: true })
], Scalar.prototype, "bigdecimal", void 0);
__decorate([
    (0, core_1.Property)({ type: types.StringType, nullable: true })
], Scalar.prototype, "string", void 0);
__decorate([
    (0, core_1.Property)({ type: types.DateTimeType, nullable: true })
], Scalar.prototype, "dateTime", void 0);
__decorate([
    (0, core_1.Property)({ type: types.BytesType, nullable: true })
], Scalar.prototype, "bytes", void 0);
__decorate([
    (0, core_1.Property)({ type: types.JSONType, nullable: true })
], Scalar.prototype, "json", void 0);
Scalar = __decorate([
    (0, core_1.Entity)()
], Scalar);
exports.Scalar = Scalar;
//# sourceMappingURL=scalar.model.js.map