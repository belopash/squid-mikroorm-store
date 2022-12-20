import {MyJson} from "./_myJson"

export type MyUnion = MyJson

export function fromJsonMyUnion(json: any): MyUnion {
  switch(json?.isOf) {
    case 'MyJson': return MyJson.fromJSON(json)
    default: throw new Error('Unknown json object passed as MyUnion')
  }
}
