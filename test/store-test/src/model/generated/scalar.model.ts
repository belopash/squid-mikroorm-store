import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_} from "@mikro-orm/core"
import {types} from "./support"

@Entity_()
export class Scalar {
  constructor(props?: Partial<Scalar>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryKey_({type: types.String})
  id!: string

  @Property_({type: types.Boolean, nullable: true})
  boolean!: boolean | undefined | null

  @Property_({type: types.BigInt, nullable: true})
  bigint!: bigint | undefined | null

  @Property_({type: types.BigDecimal, nullable: true})
  bigdecimal!: BigDecimal | undefined | null

  @Property_({type: types.String, nullable: true})
  string!: string | undefined | null

  @Property_({type: types.DateTime, nullable: true})
  datetime!: Date | undefined | null

  @Property_({type: types.Bytes, nullable: true})
  bytes!: Uint8Array | undefined | null

  @Property_({type: types.JSON, nullable: true})
  json!: unknown | undefined | null

  @Property_({type: types.Array(types.BigInt), nullable: true})
  array!: (bigint | undefined | null)[] | undefined | null
}
