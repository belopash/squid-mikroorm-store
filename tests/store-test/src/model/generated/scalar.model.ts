import {BigDecimal} from "@subsquid/big-decimal"
import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_} from "@mikro-orm/core"
import * as types from "./types"

@Entity_()
export class Scalar {
  constructor(props?: Partial<Scalar>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryKey_({type: types.StringType})
  id!: string

  @Property_({type: types.BooleanType, nullable: true})
  boolean!: boolean | undefined | null

  @Property_({type: types.BigIntType, nullable: true})
  bigint!: bigint | undefined | null

  @Property_({type: types.BigDecimalType, nullable: true})
  bigdecimal!: BigDecimal | undefined | null

  @Property_({type: types.StringType, nullable: true})
  string!: string | undefined | null

  @Property_({type: types.DateTimeType, nullable: true})
  dateTime!: Date | undefined | null

  @Property_({type: types.BytesType, nullable: true})
  bytes!: Uint8Array | undefined | null

  @Property_({type: types.JSONType, nullable: true})
  json!: unknown | undefined | null
}
