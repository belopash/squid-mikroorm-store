import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_} from "@mikro-orm/core"
import {types} from "./support"

@Entity_()
export class Item {
  constructor(props?: Partial<Item>) {
    Object.assign(this, props)
  }

  @PrimaryKey_({type: types.String})
  id!: string

  @Property_({type: types.String, nullable: false})
  name!: string
}
