"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONType = exports.BytesType = exports.DateTimeType = exports.BigDecimalType = exports.FloatType = exports.BigIntType = exports.BooleanType = exports.StringType = exports.IntType = void 0;
const core_1 = require("@mikro-orm/core");
const assert_1 = __importDefault(require("assert"));
class IntType extends core_1.Type {
    getColumnType() {
        return `int4`;
    }
    compareAsType() {
        return 'number';
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
exports.IntType = IntType;
class StringType extends core_1.Type {
    getColumnType() {
        return `text`;
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
            (0, assert_1.default)(typeof value === 'string', 'invalid BigInt');
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
        return value;
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
        else {
            (0, assert_1.default)(typeof value === 'string', 'invalid DateTime');
            (0, assert_1.default)(isIsoDateTimeString(value), 'invalid DateTime');
            return new Date(value);
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
        return value;
    }
    convertToJSValue(value) {
        if (value == null) {
            return undefined;
        }
        else if (typeof value === 'string') {
            (0, assert_1.default)(value.length % 2 === 0, 'invalid Bytes');
            (0, assert_1.default)(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes');
            return Buffer.from(value.slice(2), 'hex');
        }
        else {
            return value;
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
class JSONType extends core_1.Type {
    constructor(jsonClass) {
        super();
        this.jsonClass = jsonClass;
    }
    convertToDatabaseValue(value) {
        return this.toJSON(value);
    }
    convertToJSValue(value) {
        return value ? this.jsonClass.fromJSON(JSON.parse(value)) : undefined;
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
// export const types = {
//     int: IntType,
//     bigint: BigIntType,
//     float: FloatType,
//     bigDecimal: BigDecimalType,
//     string: StringType,
//     datetime: DateTimeType,
//     boolean: BooleanType,
// }
// export class ArrayType<T extends Type<any, any>> extends Type<ReturnType<T['getColumnType']>[], string> {
//     constructor(private itemType: T) {
//         super()
//     }
//     convertToDatabaseValue(value: ReturnType<T['getColumnType']>[] | string, platform: Platform): string {
//         return Array.isArray(value)
//             ? platform.marshallArray(value.map((i) => this.itemType.convertToDatabaseValue(i, platform)))
//             : value
//     }
//     convertToJSValue(
//         value: string | ReturnType<T['getColumnType']>[],
//         platform: Platform
//     ): ReturnType<T['getColumnType']>[] {
//         return Array.isArray(value)
//             ? (platform.marshallArray(value.map((i) => this.itemType.convertToJSValue(i, platform))) as any)
//             : value
//     }
//     compareAsType(): string {
//         return 'array'
//     }
//     toJSON(value) {
//         return value
//     }
//     getColumnType(prop, platform) {
//         return this.itemType
//     }
// }
// export interface Marshal<T, S> {
//     fromJSON(value: unknown): T
//     toJSON(value: T): S
// }
// export const bytes: Marshal<Uint8Array, string> = {
//     fromJSON(value: unknown): Buffer {
//         assert(typeof value === 'string', 'invalid Bytes')
//         assert(value.length % 2 === 0, 'invalid Bytes')
//         assert(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes')
//         return Buffer.from(value.slice(2), 'hex')
//     },
//     toJSON(value: Uint8Array): string {
//         if (Buffer.isBuffer(value)) {
//             return '0x' + value.toString('hex')
//         } else {
//             return '0x' + Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('hex')
//         }
//     },
// }
// export function fromList<T>(list: unknown, f: (val: unknown) => T): T[] {
//     assert(Array.isArray(list))
//     return list.map((val) => f(val))
// }
// export function nonNull<T>(val: T | undefined | null): T {
//     assert(val != null, 'non-nullable value is null')
//     return val
// }
// export function enumFromJson<E extends object>(json: unknown, enumObject: E): E[keyof E] {
//     assert(typeof json == 'string', 'invalid enum value')
//     let val = (enumObject as any)[json]
//     assert(typeof val == 'string', `invalid enum value`)
//     return val as any
// }
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
//# sourceMappingURL=types.js.map