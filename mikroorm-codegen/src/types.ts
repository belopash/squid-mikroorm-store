import {Platform, Type} from '@mikro-orm/core'
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

    convertToJSValue(value: string | null | undefined): Date | null | undefined {
        if (value == null) {
            return undefined
        } else {
            assert(typeof value === 'string', 'invalid DateTime')
            assert(isIsoDateTimeString(value), 'invalid DateTime')
            return new Date(value)
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

export class BytesType extends Type<Buffer | null | undefined> {
    convertToDatabaseValue(value: Buffer | null | undefined): Buffer | null | undefined {
        return value
    }

    convertToJSValue(value: Buffer | string | null | undefined): Buffer | null | undefined {
        if (value == null) {
            return undefined
        } else if (typeof value === 'string') {
            assert(value.length % 2 === 0, 'invalid Bytes')
            assert(/^0x[0-9a-f]+$/i.test(value), 'invalid Bytes')
            return Buffer.from(value.slice(2), 'hex')
        } else {
            return value
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
    constructor(private jsonClass: {fromJSON: (json: any) => T}) {
        super()
    }

    convertToDatabaseValue(value: T | null | undefined): string | null | undefined {
        return this.toJSON(value)
    }

    convertToJSValue(value: string | null | undefined): T | null | undefined {
        return value ? this.jsonClass.fromJSON(JSON.parse(value)) : undefined
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
