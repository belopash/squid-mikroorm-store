import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_} from "@mikro-orm/core"
import * as types from "./types"

@Entity_()
export class Item {
  constructor(props?: Partial<Item>) {
    Object.assign(this, props)
  }

  @PrimaryKey_({type: types.StringType})
  id!: string

  @Property_({type: types.StringType, nullable: false})
  name!: string
}
