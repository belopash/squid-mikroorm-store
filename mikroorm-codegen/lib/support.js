"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumFromJson = exports.types = exports.EnumType = exports.ArrayType = exports.JSONArrayType = exports.JSONType = exports.BytesType = exports.DateTimeType = exports.BigDecimalType = exports.FloatType = exports.BigIntType = exports.BooleanType = exports.StringType = void 0;
const core_1 = require("@mikro-orm/core");
const assert_1 = __importDefault(require("assert"));
class IntType extends core_1.Type {
    getColumnType() {
        return `int4`;
    }
    compareAsType() {
        return 'number';
    }
    convertToDatabaseValue(value) {
        return value ?? undefined;
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(Number.isInteger(value), 'invalid Int');
            return value;
        }
    }
    toJSON(value) {
        return value ?? undefined;
    }
}
class StringType extends core_1.Type {
    getColumnType() {
        return `text`;
    }
    convertToDatabaseValue(value) {
        return value ?? undefined;
    }
    compareAsType() {
        return 'string';
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(typeof value === 'string', 'invalid String');
            return value;
        }
    }
    toJSON(value) {
        return value ?? undefined;
    }
}
exports.StringType = StringType;
class BooleanType extends core_1.Type {
    getColumnType() {
        return `boolean`;
    }
    convertToDatabaseValue(value) {
        return value ?? undefined;
    }
    compareAsType() {
        return 'boolean';
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(typeof value === 'boolean', 'invalid Boolean');
            return value;
        }
    }
    toJSON(value) {
        return value ?? undefined;
    }
}
exports.BooleanType = BooleanType;
class BigIntType extends core_1.Type {
    convertToDatabaseValue(value) {
        return value?.toString();
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(typeof value === 'string' || typeof value === 'number', 'invalid BigInt');
            return BigInt(value);
        }
    }
    getColumnType() {
        return `numeric`;
    }
    compareAsType() {
        return 'number';
    }
    toJSON(value) {
        return value?.toString();
    }
}
exports.BigIntType = BigIntType;
class FloatType extends core_1.Type {
    convertToDatabaseValue(value) {
        return value?.toString();
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(typeof value === 'number', 'invalid Float');
            return value;
        }
    }
    getColumnType() {
        return `numeric`;
    }
    compareAsType() {
        return 'number';
    }
    toJSON(value) {
        return value ?? undefined;
    }
}
exports.FloatType = FloatType;
class BigDecimalType extends core_1.Type {
    convertToDatabaseValue(value) {
        return value?.toString();
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(typeof value === 'string', 'invalid BigDecimal');
            return decimal.BigDecimal(value);
        }
    }
    getColumnType() {
        return `numeric`;
    }
    compareAsType() {
        return 'number';
    }
    toJSON(value) {
        return value?.toString();
    }
}
exports.BigDecimalType = BigDecimalType;
// credit - https://github.com/Urigo/graphql-scalars/blob/91b4ea8df891be8af7904cf84751930cc0c6613d/src/scalars/iso-date/validator.ts#L122
const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?([Z])$/;
function isIsoDateTimeString(s) {
    return RFC_3339_REGEX.test(s);
}
class DateTimeType extends core_1.Type {
    convertToDatabaseValue(value) {
        return value?.toISOString();
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else if (typeof value === 'string') {
            (0, assert_1.default)(isIsoDateTimeString(value), 'invalid DateTime');
            return new Date(value);
        }
        else {
            (0, assert_1.default)(value instanceof Date, 'invalid DateTime');
            return value;
        }
    }
    getColumnType() {
        return `timestamp with time zone`;
    }
    compareAsType() {
        return 'date';
    }
    toJSON(value) {
        return value?.toISOString();
    }
}
exports.DateTimeType = DateTimeType;
class BytesType extends core_1.Type {
    convertToDatabaseValue(value) {
        return value ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : undefined;
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else if (typeof value === 'string') {
            (0, assert_1.default)(value.length % 2 === 0, 'invalid Bytes');
            (0, assert_1.default)(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes');
            return new Uint8Array(Buffer.from(value.slice(2), 'hex'));
        }
        else {
            return Uint8Array.from(value);
        }
    }
    getColumnType() {
        return `bytea`;
    }
    compareAsType() {
        return 'Buffer';
    }
    toJSON(value) {
        if (value == null) {
            return undefined;
        }
        else if (Buffer.isBuffer(value)) {
            return ('0x' + value.toString('hex'));
        }
        else {
            return ('0x' + Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('hex'));
        }
    }
}
exports.BytesType = BytesType;
class JSONType extends core_1.JsonType {
    constructor(transformer = (json) => json) {
        super();
        this.transformer = transformer;
    }
    convertToDatabaseValue(value) {
        return this.toJSON(value) ?? null;
    }
    convertToJSValue(value) {
        return value ? this.transformer(value) : undefined;
    }
    getColumnType() {
        return 'jsonb';
    }
    compareAsType() {
        return 'any';
    }
    toJSON(value) {
        return value ? JSON.stringify(value) : undefined;
    }
}
exports.JSONType = JSONType;
class JSONArrayType extends core_1.JsonType {
    constructor(itemType) {
        super();
        this.itemType = typeof itemType === 'function' ? new itemType() : itemType;
    }
    convertToDatabaseValue(value) {
        return this.toJSON(value) ?? null;
    }
    convertToJSValue(value) {
        return value?.map((v) => this.itemType.convertToJSValue(v));
    }
    compareAsType() {
        return 'any';
    }
    toJSON(value) {
        return value ? JSON.stringify(value.map((v) => this.itemType.toJSON(v))) : undefined;
    }
    getColumnType(prop) {
        return `jsonb`;
    }
}
exports.JSONArrayType = JSONArrayType;
class ArrayType extends core_1.Type {
    constructor(itemType) {
        super();
        this.itemType = typeof itemType === 'function' ? new itemType() : itemType;
    }
    convertToDatabaseValue(value) {
        return value ? `{${value.map((v) => `"${this.itemType.convertToDatabaseValue(v)}"`).join(',')}}` : undefined;
    }
    convertToJSValue(value) {
        if (Array.isArray(value)) {
            return value.map((v) => this.itemType.convertToJSValue(v));
        }
        else {
            return value
                ? value
                    .substring(1, value.length - 1)
                    .split(',')
                    .map((v) => this.itemType.convertToJSValue(v))
                : undefined;
        }
    }
    compareAsType() {
        return 'array';
    }
    toJSON(value) {
        return value?.map((v) => this.itemType.toJSON(v));
    }
    getColumnType(prop) {
        return `${this.itemType.getColumnType(prop)} array`;
    }
}
exports.ArrayType = ArrayType;
class EnumType extends core_1.Type {
    constructor(e) {
        super();
        this.e = e;
    }
    convertToDatabaseValue(value) {
        return value ?? undefined;
    }
    getColumnType(prop) {
        return `varchar${prop.length}`;
    }
    compareAsType() {
        return 'string';
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else {
            (0, assert_1.default)(value in this.e, 'invalid Enum');
            return value;
        }
    }
    toJSON(value) {
        return value ?? undefined;
    }
}
exports.EnumType = EnumType;
exports.types = {
    Int: new IntType(),
    String: new StringType(),
    ID: new StringType(),
    Boolean: new BooleanType(),
    BigInt: new BigIntType(),
    Float: new FloatType(),
    BigDecimal: new BigDecimalType(),
    DateTime: new DateTimeType(),
    Bytes: new BytesType(),
    JSON: new JSONType(),
    JSONobj: (transformer) => new JSONType(transformer),
    JSONarray: (itemType) => new JSONArrayType(itemType),
    Array: (itemType) => new ArrayType(itemType),
};
exports.default = exports.types;
// export function nonNull<T>(val: T | undefined): T {
//     assert(val != null, 'non-nullable value is null')
//     return val
// }
function enumFromJson(json, enumObject) {
    (0, assert_1.default)(typeof json == 'string', 'invalid enum value');
    let val = enumObject[json];
    (0, assert_1.default)(typeof val == 'string', `invalid enum value`);
    return val;
}
exports.enumFromJson = enumFromJson;
const decimal = {
    get BigDecimal() {
        throw new Error('Package `@subsquid/big-decimal` is not installed');
    },
};
try {
    Object.defineProperty(decimal, 'BigDecimal', {
        value: require('@subsquid/big-decimal').BigDecimal,
    });
}
catch (e) { }
//# sourceMappingURL=support.js.map