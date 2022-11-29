import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_, Index as Index_, ManyToOne as ManyToOne_} from "@mikro-orm/core"
import * as types from "./types"
import {Account} from "./account.model"

@Entity_()
export class Transfer {
  constructor(props?: Partial<Transfer>) {
    Object.assign(this, props)
  }

  @PrimaryKey_()
  id!: string

  @Index_()
  @Property_({type: types.IntType, nullable: false})
  blockNumber!: number

  @Index_()
  @Property_({type: types.DateTimeType, nullable: false})
  timestamp!: Date

  @Index_()
  @Property_({type: types.StringType, nullable: true})
  extrinsicHash!: string | undefined | null

  @Index_()
  @ManyToOne_(() => Account, {nullable: false, mapToPk: true})
  from!: string

  @Index_()
  @ManyToOne_(() => Account, {nullable: false, mapToPk: true})
  to!: string

  @Index_()
  @Property_({type: types.BigIntType, nullable: false})
  amount!: bigint

  @Property_({type: types.BigIntType, nullable: false})
  fee!: bigint
}
