/// <reference types="node" />
import { Constructor, EntityProperty, Type, JsonType } from '@mikro-orm/core';
declare class IntType extends Type<number | undefined> {
    getColumnType(): string;
    compareAsType(): string;
    convertToDatabaseValue(value: number | undefined): number | undefined;
    convertToJSValue(value: number | undefined): number | undefined;
    toJSON(value: number | undefined): number | undefined;
}
export declare class StringType extends Type<string | undefined> {
    getColumnType(): string;
    convertToDatabaseValue(value: string | undefined): string | undefined;
    compareAsType(): string;
    convertToJSValue(value: string | undefined): string | undefined;
    toJSON(value: string | undefined): string | undefined;
}
export declare class BooleanType extends Type<boolean | undefined> {
    getColumnType(): string;
    convertToDatabaseValue(value: boolean | undefined): boolean | undefined;
    compareAsType(): string;
    convertToJSValue(value: boolean | undefined): boolean | undefined;
    toJSON(value: boolean | undefined): boolean | undefined;
}
export declare class BigIntType extends Type<bigint | undefined, string | undefined> {
    convertToDatabaseValue(value: bigint | undefined): string | undefined;
    convertToJSValue(value: string | undefined): bigint | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: bigint | undefined): string | undefined;
}
export declare class FloatType extends Type<number | undefined, string | undefined> {
    convertToDatabaseValue(value: number | undefined): string | undefined;
    convertToJSValue(value: string | undefined): number | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: number | undefined): number | undefined;
}
export declare class BigDecimalType extends Type<any, string | undefined> {
    convertToDatabaseValue(value: any): string | undefined;
    convertToJSValue(value: string): any;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: any): string | undefined;
}
export declare class DateTimeType extends Type<Date | undefined, string | undefined> {
    convertToDatabaseValue(value: Date | undefined): string | undefined;
    convertToJSValue(value: string | Date | undefined): Date | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: Date | undefined): string | undefined;
}
export declare class BytesType extends Type<Uint8Array | undefined, Buffer | undefined> {
    convertToDatabaseValue(value: Uint8Array | undefined): Buffer | undefined;
    convertToJSValue(value: Buffer | Uint8Array | string | undefined): Uint8Array | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: Uint8Array | undefined): Buffer | undefined;
}
export declare class JSONType<T> extends JsonType {
    private transformer;
    constructor(transformer?: (json: any) => T);
    convertToDatabaseValue(value: T | undefined): string | null;
    convertToJSValue(value: string | undefined): T | undefined;
    getColumnType(): string;
    compareAsType(): string;
    toJSON(value: T | undefined): string | undefined;
}
export declare class JSONArrayType<T extends ScalarType> extends JsonType {
    private itemType;
    constructor(itemType: T | Constructor<T>);
    convertToDatabaseValue(value: any[] | undefined): string | null;
    convertToJSValue(value: any[] | undefined): any[] | undefined;
    compareAsType(): string;
    toJSON(value: any[] | undefined): string | undefined;
    getColumnType(prop: EntityProperty): string;
}
declare type ScalarType = {
    convertToDatabaseValue(value: any): any;
    getColumnType(prop: EntityProperty): string;
    convertToJSValue(value: any): any;
    toJSON(value: any): any;
};
export declare class ArrayType<T extends ScalarType> extends Type<any[] | undefined, string | undefined> {
    private itemType;
    constructor(itemType: T | Constructor<T>);
    convertToDatabaseValue(value: any[] | undefined): string | undefined;
    convertToJSValue(value: string | any[] | undefined): any[] | undefined;
    compareAsType(): string;
    toJSON(value: any[] | undefined): any[] | undefined;
    getColumnType(prop: EntityProperty): string;
}
export declare class EnumType<T extends string> extends Type<T | undefined, string | undefined> {
    private e;
    constructor(e: {
        [key: string]: unknown;
    });
    convertToDatabaseValue(value: string | undefined): string | undefined;
    getColumnType(prop: EntityProperty): string;
    compareAsType(): string;
    convertToJSValue(value: string | undefined): T | undefined;
    toJSON(value: string | undefined): string | undefined;
}
export declare const types: {
    Int: IntType;
    String: StringType;
    ID: StringType;
    Boolean: BooleanType;
    BigInt: BigIntType;
    Float: FloatType;
    BigDecimal: BigDecimalType;
    DateTime: DateTimeType;
    Bytes: BytesType;
    JSON: JSONType<unknown>;
    JSONobj: (transformer?: ((json: any) => unknown) | undefined) => JSONType<unknown>;
    JSONarray: <T extends ScalarType>(itemType: T | Constructor<T>) => JSONArrayType<T>;
    Array: <T_1 extends ScalarType>(itemType: T_1 | Constructor<T_1>) => ArrayType<T_1>;
};
export default types;
export declare function enumFromJson<E extends object>(json: unknown, enumObject: E): E[keyof E];
//# sourceMappingURL=support.d.ts.map