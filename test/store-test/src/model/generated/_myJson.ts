import {BigDecimal} from "@subsquid/big-decimal"
import assert from "assert"
import {types, enumFromJson} from "./support"
import {MyEnum} from "./_myEnum"

export class MyJson {
  public readonly isOf = 'MyJson'
  private _boolean!: boolean | undefined | null
  private _bigint!: bigint | undefined | null
  private _bigdecimal!: BigDecimal | undefined | null
  private _string!: string | undefined | null
  private _datetime!: Date | undefined | null
  private _bytes!: Uint8Array | undefined | null
  private _json!: unknown | undefined | null
  private _enum!: MyEnum | undefined | null

  constructor(props?: Partial<Omit<MyJson, 'toJSON'>>) {
    Object.assign(this, props)
  }

  get boolean(): boolean | undefined | null {
    return this._boolean
  }

  set boolean(value: boolean | undefined | null) {
    this._boolean = value
  }

  get bigint(): bigint | undefined | null {
    return this._bigint
  }

  set bigint(value: bigint | undefined | null) {
    this._bigint = value
  }

  get bigdecimal(): BigDecimal | undefined | null {
    return this._bigdecimal
  }

  set bigdecimal(value: BigDecimal | undefined | null) {
    this._bigdecimal = value
  }

  get string(): string | undefined | null {
    return this._string
  }

  set string(value: string | undefined | null) {
    this._string = value
  }

  get datetime(): Date | undefined | null {
    return this._datetime
  }

  set datetime(value: Date | undefined | null) {
    this._datetime = value
  }

  get bytes(): Uint8Array | undefined | null {
    return this._bytes
  }

  set bytes(value: Uint8Array | undefined | null) {
    this._bytes = value
  }

  get json(): unknown | undefined | null {
    return this._json
  }

  set json(value: unknown | undefined | null) {
    this._json = value
  }

  get enum(): MyEnum | undefined | null {
    return this._enum
  }

  set enum(value: MyEnum | undefined | null) {
    this._enum = value
  }

  toJSON(): object {
    return {
      isOf: this.isOf,
      boolean: this.boolean == null ? undefined : types.Boolean.toJSON(this.boolean),
      bigint: this.bigint == null ? undefined : types.BigInt.toJSON(this.bigint),
      bigdecimal: this.bigdecimal == null ? undefined : types.BigDecimal.toJSON(this.bigdecimal),
      string: this.string == null ? undefined : types.String.toJSON(this.string),
      datetime: this.datetime == null ? undefined : types.DateTime.toJSON(this.datetime),
      bytes: this.bytes == null ? undefined : types.Bytes.toJSON(this.bytes),
      json: this.json == null ? undefined : types.JSON.toJSON(this.json),
      enum: this.enum == null ? undefined : types.String.toJSON(this.enum),
    }
  }

  static fromJSON(json: any): MyJson {
    return new MyJson({
      boolean: types.Boolean.convertToJSValue(json.boolean),
      bigint: types.BigInt.convertToJSValue(json.bigint),
      bigdecimal: types.BigDecimal.convertToJSValue(json.bigdecimal),
      string: types.String.convertToJSValue(json.string),
      datetime: types.DateTime.convertToJSValue(json.datetime),
      bytes: types.Bytes.convertToJSValue(json.bytes),
      json: types.JSON.convertToJSValue(json.json),
      enum: enumFromJson(json.enum, MyEnum),
    })
  }
}
