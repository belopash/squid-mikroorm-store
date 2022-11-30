import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_} from "@mikro-orm/core"
import * as types from "./types"
import {Test} from "./_test"

@Entity_()
export class Account {
  constructor(props?: Partial<Account>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryKey_()
  id!: string

  @Property_({type: types.BigIntType, nullable: false})
  transfersCount!: bigint

  @Property_({type: new types.JSONType(Test), nullable: true})
  test!: Test | undefined | null
}
