import assert from "assert"
import * as types from "./types"
import {Account} from "./account.model"

export class Test {
  private _a!: number | undefined | null
  private _b!: bigint | undefined | null
  private _c!: string | undefined | null
  private _d!: string | undefined | null

  constructor(props?: Partial<Omit<Test, 'toJSON'>>) {
    Object.assign(this, props)
  }

  get a(): number | undefined | null {
    return this._a
  }

  set a(value: number | undefined | null) {
    this._a = value
  }

  get b(): bigint | undefined | null {
    return this._b
  }

  set b(value: bigint | undefined | null) {
    this._b = value
  }

  get c(): string | undefined | null {
    return this._c
  }

  set c(value: string | undefined | null) {
    this._c = value
  }

  get d(): string | undefined | null {
    return this._d
  }

  set d(value: string | undefined | null) {
    this._d = value
  }

  toJSON(): object {
    return {
      a: this.a == null ? undefined : new types.IntType().toJSON(this.a),
      b: this.b == null ? undefined : new types.BigIntType().toJSON(this.b),
      c: this.c == null ? undefined : new types.StringType().toJSON(this.c),
      d: this.d == null ? undefined : new types.StringType().toJSON(this.d),
    }
  }

  static fromJSON(json: any): Test {
    return new Test({
      a: json.a == null ? undefined : new types.IntType().convertToJSValue(json.a),
      b: json.b == null ? undefined : new types.BigIntType().convertToJSValue(json.b),
      c: json.c == null ? undefined : new types.StringType().convertToJSValue(json.c),
      d: json.d == null ? undefined : new types.StringType().convertToJSValue(json.d),
    })
  }
}
