import {Constructor, EntityProperty, Platform, Type} from '@mikro-orm/core'
import assert from 'assert'

export class IntType extends Type<number | null | undefined> {
    getColumnType() {
        return `int4`
    }

    compareAsType(): string {
        return 'number'
    }

    convertToJSValue(value: number | null | undefined): number | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(Number.isInteger(value), 'invalid Int')
            return value as number
        }
    }

    toJSON(value: number | null | undefined): number | null | undefined {
        return value ?? undefined
    }
}

export class StringType extends Type<string | null | undefined> {
    getColumnType() {
        return `text`
    }

    compareAsType(): string {
        return 'string'
    }

    convertToJSValue(value: string | null | undefined): string | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'string', 'invalid String')
            return value
        }
    }

    toJSON(value: string | null | undefined): string | null | undefined {
        return value ?? undefined
    }
}

export class BooleanType extends Type<boolean | null | undefined> {
    getColumnType() {
        return `boolean`
    }

    compareAsType(): string {
        return 'boolean'
    }

    convertToJSValue(value: boolean | null | undefined): boolean | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'boolean', 'invalid Boolean')
            return value
        }
    }

    toJSON(value: boolean | null | undefined): boolean | null | undefined {
        return value ?? undefined
    }
}

export class BigIntType extends Type<bigint | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: bigint | null | undefined): string | null | undefined {
        return value?.toString()
    }

    convertToJSValue(value: string | null | undefined): bigint | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'string', 'invalid BigInt')
            return BigInt(value)
        }
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    toJSON(value: bigint | null | undefined): string | null | undefined {
        return value?.toString()
    }
}

export class FloatType extends Type<number | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: number | null | undefined): string | null | undefined {
        return value?.toString()
    }

    convertToJSValue(value: string | null | undefined): number | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'number', 'invalid Float')
            return value as number
        }
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    toJSON(value: number | null | undefined): number | null | undefined {
        return value
    }
}

export class BigDecimalType extends Type<any, string | undefined> {
    convertToDatabaseValue(value: any): string | undefined {
        return value?.toString()
    }

    convertToJSValue(value: string): any {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'string', 'invalid BigDecimal')
            return decimal.BigDecimal(value)
        }
    }

    getColumnType() {
        return `numeric`
    }

    compareAsType(): string {
        return 'number'
    }

    toJSON(value: any): string | null | undefined {
        return value?.toString()
    }
}

// credit - https://github.com/Urigo/graphql-scalars/blob/91b4ea8df891be8af7904cf84751930cc0c6613d/src/scalars/iso-date/validator.ts#L122
const RFC_3339_REGEX =
    /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?([Z])$/

function isIsoDateTimeString(s: string): boolean {
    return RFC_3339_REGEX.test(s)
}

export class DateTimeType extends Type<Date | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: Date | null | undefined): string | null | undefined {
        return value?.toISOString()
    }

    convertToJSValue(value: string | Date | null | undefined): Date | null | undefined {
        if (value == null) {
            return undefined
        } else if (typeof value === 'string') {
            assert(isIsoDateTimeString(value), 'invalid DateTime')
            return new Date(value)
        } else {
            assert(value instanceof Date, 'invalid DateTime')
            return value
        }
    }

    getColumnType() {
        return `timestamp with time zone`
    }

    compareAsType(): string {
        return 'date'
    }

    toJSON(value: Date | null | undefined): string | undefined {
        return value?.toISOString()
    }
}

export class BytesType extends Type<Uint8Array | null | undefined, Buffer | null | undefined> {
    convertToDatabaseValue(value: Uint8Array | null | undefined): Buffer | null | undefined {
        return value ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : undefined
    }

    convertToJSValue(value: Buffer | Uint8Array | string | null | undefined): Uint8Array | undefined {
        if (value == null) {
            return undefined
        } else if (typeof value === 'string') {
            assert(value.length % 2 === 0, 'invalid Bytes')
            assert(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes')
            return new Uint8Array(Buffer.from(value.slice(2), 'hex'))
        } else {
            return Uint8Array.from(value)
        }
    }

    getColumnType() {
        return `bytea`
    }

    compareAsType(): string {
        return 'Buffer'
    }

    toJSON(value: Uint8Array | null | undefined): Buffer | null | undefined {
        if (value == null) {
            return undefined
        } else if (Buffer.isBuffer(value)) {
            return ('0x' + value.toString('hex')) as any
        } else {
            return ('0x' + Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('hex')) as any
        }
    }
}

export class JSONType<T> extends Type<T | null | undefined, string | null | undefined> {
    constructor(private transformer: (json: any) => T = (json: any) => json) {
        super()
    }

    convertToDatabaseValue(value: T | null | undefined): string | null | undefined {
        return this.toJSON(value)
    }

    convertToJSValue(value: string | null | undefined): T | null | undefined {
        return value ? this.transformer(value) : undefined
    }

    getColumnType(): string {
        return 'jsonb'
    }

    compareAsType(): string {
        return 'any'
    }

    toJSON(value: T | null | undefined): string | null | undefined {
        return value ? JSON.stringify(value) : undefined
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

export class ArrayType<T extends Type<any, any>> extends Type<any[], string> {
    private itemType: T

    constructor(itemType: T | Constructor<T>) {
        super()
        this.itemType = typeof itemType === 'function' ? new itemType() : itemType
    }

    convertToDatabaseValue(value: T extends Type<infer R> ? R[] : never, platform: Platform): string {
        return `{${value.map((v) => this.itemType.convertToDatabaseValue(v, platform)).join(',')}}`
    }

    convertToJSValue(value: string | any[], platform: Platform): any[] {
        if (Array.isArray(value)) {
            return value.map((v) => this.itemType.convertToJSValue(v, platform))
        } else {
            return value
                .substring(1, value.length - 1)
                .split(',')
                .map((v) => this.itemType.convertToJSValue(v, platform))
        }
    }

    compareAsType(): string {
        return 'array'
    }

    toJSON(value: T extends Type<infer R> ? R[] : never, platform: Platform) {
        return value.map((v) => this.itemType.toJSON(v, platform))
    }

    getColumnType(prop: EntityProperty, platform: Platform) {
        return `${this.itemType.getColumnType(prop, platform)} array`
    }
}

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
