/// <reference types="node" />
import { Type } from '@mikro-orm/core';
export declare class IntType extends Type<number | null | undefined> {
    getColumnType(): string;
    compareAsType(): string;
    convertToJSValue(value: number | null | undefined): number | null | undefined;
    toJSON(value: number | null | undefined): number | null | undefined;
}
export declare class StringType extends Type<string | null | undefined> {
    getColumnType(): string;
    compareAsType(): string;
    convertToJSValue(value: string | null | undefined): string | null | undefined;
    toJSON(value: string | null | undefined): string | null | undefined;
}
export declare class BooleanType extends Type<boolean | null | undefined> {
    getColumnType(): string;
    compareAsType(): string;
    convertToJSValue(value: boolean | null | undefined): boolean | null | undefined;
    toJSON(value: boolean | null | undefined): boolean | null | undefined;
}
export declare class BigIntType extends Type<bigint | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: bigint | null | undefined): string | null | undefined;
    convertToJSValue(value: string | null | undefined): bigint | null | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: bigint | null | undefined): string | null | undefined;
}
export declare class FloatType extends Type<number | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: number | null | undefined): string | null | undefined;
    convertToJSValue(value: string | null | undefined): number | null | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: number | null | undefined): number | null | undefined;
}
export declare class BigDecimalType extends Type<any, string | undefined> {
    convertToDatabaseValue(value: any): string | undefined;
    convertToJSValue(value: string): any;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: any): string | null | undefined;
}
export declare class DateTimeType extends Type<Date | null | undefined, string | null | undefined> {
    convertToDatabaseValue(value: Date | null | undefined): string | null | undefined;
    convertToJSValue(value: string | null | undefined): Date | null | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: Date | null | undefined): string | undefined;
}
export declare class BytesType extends Type<Buffer | null | undefined> {
    convertToDatabaseValue(value: Buffer | null | undefined): Buffer | null | undefined;
    convertToJSValue(value: Buffer | string | null | undefined): Buffer | null | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: Uint8Array | null | undefined): Buffer | null | undefined;
}
export declare class JSONType<T> extends Type<T | null | undefined, string | null | undefined> {
    private jsonClass;
    constructor(jsonClass: {
        fromJSON: (json: any) => T;
    });
    convertToDatabaseValue(value: T | null | undefined): string | null | undefined;
    convertToJSValue(value: string | null | undefined): T | null | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: T | null | undefined): string | null | undefined;
}
//# sourceMappingURL=types.d.ts.map