import { BigDecimal } from "@subsquid/big-decimal";
export declare class Scalar {
    constructor(props?: Partial<Scalar>);
    /**
     * Account address
     */
    id: string;
    boolean: boolean | undefined | null;
    bigint: bigint | undefined | null;
    bigdecimal: BigDecimal | undefined | null;
    string: string | undefined | null;
    dateTime: Date | undefined | null;
    bytes: Uint8Array | undefined | null;
    json: unknown | undefined | null;
}
//# sourceMappingURL=scalar.model.d.ts.map