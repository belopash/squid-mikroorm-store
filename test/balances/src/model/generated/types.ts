import {Platform, Type} from '@mikro-orm/core'
import assert from 'assert'

export class IntType extends Type<number> {
    getColumnType() {
        return `int4`
    }

    compareAsType(): string {
        return 'number'
    }

    fromJSON(value: unknown): number {
        assert(Number.isInteger(value), 'invalid Int')
        return value as number
    }

    toJSON(value: number): number {
        return value
    }
}

export class StringType extends Type<string> {
    getColumnType() {
        return `text`
    }

    compareAsType(): string {
        return 'string'
    }

    fromJSON(value: unknown): string {
        assert(typeof value === 'string', 'invalid String')
        return value
    }

    toJSON(value: string): string {
        return value
    }
}

export class BooleanType extends Type<boolean> {
    getColumnType() {
        return `boolean`
    }

    compareAsType(): string {
        return 'boolean'
    }

    fromJSON(value: unknown): boolean {
        assert(typeof value === 'boolean', 'invalid Boolean')
        return value
    }

    toJSON(value: boolean): boolean {
        return value
    }
}

export class BigIntType extends Type<bigint, string> {
    convertToDatabaseValue(value: bigint | string): string {
        return value.toString()
    }

    convertToJSValue(value: bigint | string): bigint {
        return typeof value === 'bigint' ? value : BigInt(value)
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    fromJSON(value: unknown): bigint {
        assert(typeof value === 'string', 'invalid BigInt')
        return BigInt(value)
    }

    toJSON(value: bigint): string {
        return value.toString()
    }
}

export class FloatType extends Type<number, string> {
    convertToDatabaseValue(value: number | string): string {
        return value.toString()
    }

    convertToJSValue(value: number | string): number {
        return typeof value === 'number' ? value : Number(value)
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    fromJSON(value: unknown): number {
        assert(typeof value === 'number', 'invalid Float')
        return value as number
    }

    toJSON(value: number): number {
        return value
    }
}

export class BigDecimalType extends Type<any, string> {
    convertToDatabaseValue(value: any | string): string {
        return value.toString()
    }

    convertToJSValue(value: any | string): any {
        return value instanceof decimal.BigDecimal ? value : decimal.BigDecimal(value)
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    fromJSON(value: unknown): bigint {
        assert(typeof value === 'string', 'invalid BigDecimal')
        return decimal.BigDecimal(value)
    }

    toJSON(value: any): string {
        return value.toString()
    }
}

// credit - https://github.com/Urigo/graphql-scalars/blob/91b4ea8df891be8af7904cf84751930cc0c6613d/src/scalars/iso-date/validator.ts#L122
const RFC_3339_REGEX =
    /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?([Z])$/

function isIsoDateTimeString(s: string): boolean {
    return RFC_3339_REGEX.test(s)
}

export class DateTimeType extends Type<Date, string> {
    convertToDatabaseValue(value: Date | string): string {
        return value instanceof Date ? value.toISOString() : value
    }

    convertToJSValue(value: Date | string): Date {
        return value instanceof Date ? value : new Date(value)
    }

    getColumnType() {
        return `timestamp with time zone`
    }

    compareAsType(): string {
        return 'date'
    }

    fromJSON(value: unknown): Date {
        assert(typeof value === 'string', 'invalid DateTime')
        assert(isIsoDateTimeString(value), 'invalid DateTime')
        return new Date(value)
    }

    toJSON(value: Date): string {
        return value.toISOString()
    }
}

export class BytesType extends Type<Buffer> {
    convertToDatabaseValue(value: Buffer): Buffer {
        return value
    }

    convertToJSValue(value: Buffer): Buffer {
        return value instanceof Buffer ? value : Buffer.from(value)
    }

    getColumnType() {
        return `bytea`
    }

    compareAsType(): string {
        return 'Buffer'
    }

    fromJSON(value: unknown): Buffer {
        assert(typeof value === 'string', 'invalid Bytes')
        assert(value.length % 2 === 0, 'invalid Bytes')
        assert(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes')
        return Buffer.from(value.slice(2), 'hex')
    }

    toJSON(value: Uint8Array): Buffer {
        if (Buffer.isBuffer(value)) {
            return ('0x' + value.toString('hex')) as any
        } else {
            return ('0x' + Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('hex')) as any
        }
    }
}

export class JSONType<T> extends Type<T, string> {
    constructor(private jsonClass: {fromJSON: (json: any) => T}) {
        super()
    }

    convertToDatabaseValue(value: T): string {
        return this.toJSON(value)
    }

    convertToJSValue(value: string): T {
        return this.fromJSON(value)
    }

    getColumnType(): string {
        return 'jsonb'
    }

    compareAsType(): string {
        return 'any'
    }

    fromJSON(value: string): T {
        return this.jsonClass.fromJSON(JSON.parse(value))
    }

    toJSON(value: T): string {
        return JSON.stringify(value)
    }
}

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
    get BigDecimal(): any {
        throw new Error('Package `@subsquid/big-decimal` is not installed')
    },
}

try {
    Object.defineProperty(decimal, 'BigDecimal', {
        value: require('@subsquid/big-decimal').BigDecimal,
    })
} catch (e) {}
