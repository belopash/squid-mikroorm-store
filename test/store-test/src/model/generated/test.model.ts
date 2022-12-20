import {Entity as Entity_, Property as Property_, PrimaryKey as PrimaryKey_, Enum as Enum_} from "@mikro-orm/core"
import {types} from "./support"
import {MyJson} from "./_myJson"
import {MyEnum} from "./_myEnum"
import {MyUnion, fromJsonMyUnion} from "./_myUnion"

@Entity_()
export class Test {
  constructor(props?: Partial<Test>) {
    Object.assign(this, props)
  }

  @PrimaryKey_({type: types.String})
  id!: string

  @Property_({type: types.JSONobj(MyJson.fromJSON), nullable: true})
  json!: MyJson | undefined | null

  @Enum_({type: types.String, items: () => MyEnum, nullable: true})
  enum!: MyEnum | undefined | null

  @Property_({type: types.Array(types.BigInt), nullable: true})
  array!: (bigint | undefined | null)[] | undefined | null

  @Property_({type: types.JSONobj(fromJsonMyUnion), nullable: true})
  union!: MyUnion | undefined | null
}
