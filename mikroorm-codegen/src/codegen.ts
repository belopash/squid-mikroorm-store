import type {Entity, Enum, JsonObject, Model, Prop, Union} from '@subsquid/openreader/lib/model'
import {unexpectedCase} from '@subsquid/util-internal'
import {OutDir, Output} from '@subsquid/util-internal-code-printer'
import {toCamelCase} from '@subsquid/util-naming'
import assert from 'assert'
import * as path from 'path'

export function generateOrmModels(model: Model, dir: OutDir): void {
    const variants = collectVariants(model)
    const index = dir.file('index.ts')

    for (const name in model) {
        const item = model[name]
        switch (item.kind) {
            case 'entity':
                generateEntity(name, item)
                break
            case 'object':
                generateObject(name, item)
                break
            case 'union':
                generateUnion(name, item)
                break
            case 'enum':
                generateEnum(name, item)
                break
        }
    }

    index.write()
    dir.add('types.ts', path.resolve(__dirname, '../src/types.ts'))

    function generateEntity(name: string, entity: Entity): void {
        index.line(`export * from "./${toCamelCase(name)}.model"`)
        const out = dir.file(`${toCamelCase(name)}.model.ts`)
        const imports = new ImportRegistry(name)
        imports.useMikroorm('Entity', 'Property', 'PrimaryKey')
        imports.useMarshal()
        out.lazy(() => imports.render(model, out))
        out.line()
        printComment(entity, out)
        entity.indexes?.forEach((index) => {
            if (index.fields.length < 2) return
            out.line(`@Index_([${index.fields.map((f) => `"${f.name}"`).join(', ')}], {unique: ${!!index.unique}})`)
        })
        out.line('@Entity_()')
        out.block(`export class ${name}`, () => {
            out.block(`constructor(props?: Partial<${name}>)`, () => {
                out.line('Object.assign(this, props)')
            })
            for (const key in entity.properties) {
                const prop = entity.properties[key]
                importReferencedModel(imports, prop)
                out.line()
                printComment(prop, out)
                switch (prop.type.kind) {
                    case 'scalar':
                        if (key === 'id') {
                            out.line('@PrimaryKey_({type: types.StringType})')
                        } else {
                            addIndexAnnotation(entity, key, imports, out)
                            switch (prop.type.name) {
                                case 'ID':
                                    out.line(`@Property_({type: types.StringType, nullable: ${prop.nullable}})`)
                                    break
                                default:
                                    out.line(
                                        `@Property_({type: types.${prop.type.name}Type, nullable: ${prop.nullable}})`
                                    )
                                    break
                            }
                        }
                        break
                    case 'enum':
                        addIndexAnnotation(entity, key, imports, out)
                        out.line(
                            `@Property_("varchar", {length: ${getEnumMaxLength(model, prop.type.name)}, nullable: ${
                                prop.nullable
                            }})`
                        )
                        break
                    case 'fk':
                        if (getFieldIndex(entity, key)?.unique) {
                            imports.useMikroorm('OneToOne', 'Index', 'JoinColumn')
                            out.line(`@Index_({unique: true})`)
                            out.line(`@OneToOne_(() => ${prop.type.entity}, {nullable: false, mapToPk: true})`)
                            // out.line(`@JoinProperty_()`)
                        } else {
                            imports.useMikroorm('ManyToOne', 'Index')
                            if (
                                !entity.indexes?.some(
                                    (index) => index.fields[0]?.name == key && index.fields.length > 1
                                )
                            ) {
                                out.line(`@Index_()`)
                            }
                            out.line(
                                `@ManyToOne_(() => ${prop.type.entity}, {nullable: ${prop.nullable}, mapToPk: true})`
                            )
                        }
                        break
                    case 'object':
                    case 'union':
                        addIndexAnnotation(entity, key, imports, out)
                        out.line(
                            `@Property_({type: new types.JSONType(${prop.type.name}), nullable: ${prop.nullable}})`
                        )
                        break
                    case 'list':
                        // switch (prop.type.item.type.kind) {
                        //     case 'scalar':
                        //         out.line(`@Property_("{array: true, nullable: ${prop.nullable}})`)
                        //         break
                        //     case 'enum':
                        //         out.line(
                        //             `@Property_("varchar", {length: ${getEnumMaxLength(
                        //                 model,
                        //                 prop.type.item.type.name
                        //             )}, array: true, nullable: ${prop.nullable}})`
                        //         )
                        //         break
                        //     case 'object':
                        //     case 'union':
                        //     case 'list':
                        //         imports.useMarshal()
                        //         out.line(
                        //             `@Property_("jsonb", {transformer: {to: obj => ${typesToJson(
                        //                 prop,
                        //                 'obj'
                        //             )}, from: obj => ${typesFromJson(prop, 'obj')}}, nullable: ${prop.nullable}})`
                        //         )
                        //         break
                        //     default:
                        //         throw unexpectedCase(prop.type.item.type.kind)
                        // }
                        throw unexpectedCase((prop.type as any).kind)
                        break
                    case 'lookup':
                    case 'list-lookup':
                        continue
                    default:
                        throw unexpectedCase((prop.type as any).kind)
                }
                out.line(`${key}!: ${getPropJsType(imports, 'entity', prop)}`)
            }
        })
        out.write()
    }

    function generateObject(name: string, object: JsonObject): void {
        index.line(`export * from "./_${toCamelCase(name)}"`)
        const out = dir.file(`_${toCamelCase(name)}.ts`)
        const imports = new ImportRegistry(name)
        imports.useMarshal()
        imports.useAssert()
        out.lazy(() => imports.render(model, out))
        out.line()
        printComment(object, out)
        out.block(`export class ${name}`, () => {
            if (variants.has(name)) {
                out.line(`public readonly isTypeOf = '${name}'`)
            }
            for (const key in object.properties) {
                const prop = object.properties[key]
                importReferencedModel(imports, prop)
                out.line(`private _${key}!: ${getPropJsType(imports, 'object', prop)}`)
            }
            out.line()
            out.block(`constructor(props?: Partial<Omit<${name}, 'toJSON'>>)`, () => {
                out.line('Object.assign(this, props)')
            })
            for (const key in object.properties) {
                const prop = object.properties[key]
                out.line()
                printComment(prop, out)
                out.block(`get ${key}(): ${getPropJsType(imports, 'object', prop)}`, () => {
                    if (!prop.nullable) {
                        out.line(`assert(this._${key} != null, 'uninitialized access')`)
                    }
                    out.line(`return this._${key}`)
                })
                out.line()
                out.block(`set ${key}(value: ${getPropJsType(imports, 'object', prop)})`, () => {
                    out.line(`this._${key} = value`)
                })
            }
            out.line()
            out.block(`toJSON(): object`, () => {
                out.block('return', () => {
                    if (variants.has(name)) {
                        out.line('isTypeOf: this.isTypeOf,')
                    }
                    for (const key in object.properties) {
                        const prop = object.properties[key]
                        out.line(`${key}: ${typesToJson(prop, 'this.' + key)},`)
                    }
                })
            })
            out.line()
            out.block(`static fromJSON(json: any): ${name}`, () => {
                out.line(`return new ${name}({`)
                out.indentation(() => {
                    for (const key in object.properties) {
                        const prop = object.properties[key]
                        out.line(`${key}: ${typesFromJson(prop, 'json.' + key)},`)
                    }
                })
                out.line(`})`)
            })
        })
        out.write()
    }

    function importReferencedModel(imports: ImportRegistry, prop: Prop) {
        switch (prop.type.kind) {
            case 'enum':
            case 'object':
            case 'union':
                imports.useModel(prop.type.name)
                break
            case 'fk':
                imports.useModel(prop.type.entity)
                break
        }
    }

    function typesFromJson(prop: Prop, exp: string): string {
        // assumes exp is a pure variable or prop access
        let convert: string
        switch (prop.type.kind) {
            case 'scalar':
                convert = `new types.${prop.type.name}Type().convertToJSValue(${exp})`
                break
            case 'enum':
                convert = `types.enumFromJson(${exp}, ${prop.type.name})`
                break
            case 'fk':
                convert = `new types.StringType().convertToJSValue(${exp})`
                break
            case 'object':
                convert = `new types.JSONType(${prop.type.name}).convertToJSValue(${exp})`
                break
            case 'union':
                convert = `fromJson${prop.type.name}(${exp})`
                break
            case 'list':
                convert = `types.fromList(${exp}, val => ${typesFromJson(prop.type.item, 'val')})`
                break
            default:
                throw unexpectedCase(prop.type.kind)
        }
        if (prop.nullable) {
            convert = `${exp} == null ? undefined : ${convert}`
        }
        return convert
    }

    function typesToJson(prop: Prop, exp: string): string {
        // assumes exp is a pure variable or prop access
        let convert: string
        switch (prop.type.kind) {
            case 'scalar':
            case 'object':
            case 'union':
                switch (prop.type.name) {
                    case 'ID':
                        convert = `types.StringType.toJSON(${exp})`
                    default:
                        convert = `new types.${prop.type.name}Type().toJSON(${exp})`
                }
                break
            case 'enum':
            case 'fk':
                convert = `new types.StringType().toJSON(${exp})`
                break
            case 'list': {
                let types = typesToJson(prop.type.item, 'val')
                if (types == 'val') return exp
                convert = `${exp}.map((val: any) => ${types})`
                break
            }
            default:
                throw unexpectedCase(prop.type.kind)
        }
        if (prop.nullable) {
            convert = `${exp} == null ? undefined : ${convert}`
        }
        return convert
    }

    function generateUnion(name: string, union: Union): void {
        index.line(`export * from "./_${toCamelCase(name)}"`)
        const out = dir.file(`_${toCamelCase(name)}.ts`)
        const imports = new ImportRegistry(name)
        out.lazy(() => imports.render(model, out))
        union.variants.forEach((v) => imports.useModel(v))
        out.line()
        out.line(`export type ${name} = ${union.variants.join(' | ')}`)
        out.line()
        out.block(`export function fromJson${name}(json: any): ${name}`, () => {
            out.block(`switch(json?.isTypeOf)`, () => {
                union.variants.forEach((v) => {
                    out.line(`case '${v}': return new ${v}(undefined, json)`)
                })
                out.line(`default: throw new TypeError('Unknown json object passed as ${name}')`)
            })
        })
        out.write()
    }

    function generateEnum(name: string, e: Enum): void {
        index.line(`export * from "./_${toCamelCase(name)}"`)
        const out = dir.file(`_${toCamelCase(name)}.ts`)
        out.block(`export enum ${name}`, () => {
            for (const val in e.values) {
                out.line(`${val} = "${val}",`)
            }
        })
        out.write()
    }
}

function getPropJsType(imports: ImportRegistry, owner: 'entity' | 'object', prop: Prop): string {
    let type: string
    switch (prop.type.kind) {
        case 'scalar':
            type = getScalarJsType(prop.type.name)
            if (type == 'BigDecimal') {
                imports.useBigDecimal()
            }
            break
        case 'enum':
        case 'object':
        case 'union':
            type = prop.type.name
            break
        case 'fk':
            type = 'string'
            break
        case 'list':
            type = getPropJsType(imports, 'object', prop.type.item)
            if (type.indexOf('|')) {
                type = `(${type})[]`
            } else {
                type += '[]'
            }
            break
        default:
            throw unexpectedCase((prop.type as any).kind)
    }
    if (prop.nullable) {
        type += ' | undefined | null'
    }
    return type
}

function getScalarJsType(typeName: string): string {
    switch (typeName) {
        case 'ID':
        case 'String':
            return 'string'
        case 'Int':
        case 'Float':
            return 'number'
        case 'Boolean':
            return 'boolean'
        case 'DateTime':
            return 'Date'
        case 'BigInt':
            return 'bigint'
        case 'BigDecimal':
            return 'BigDecimal'
        case 'Bytes':
            return 'Uint8Array'
        case 'JSON':
            return 'unknown'
        default:
            throw unexpectedCase(typeName)
    }
}

function getEnumMaxLength(model: Model, enumName: string): number {
    const e = model[enumName]
    assert(e.kind === 'enum')
    return Object.keys(e.values).reduce((max, v) => Math.max(max, v.length), 0)
}

function collectVariants(model: Model): Set<string> {
    const variants = new Set<string>()
    for (const name in model) {
        const item = model[name]
        if (item.kind === 'union') {
            item.variants.forEach((v) => variants.add(v))
        }
    }
    return variants
}

function addIndexAnnotation(entity: Entity, field: string, imports: ImportRegistry, out: Output): void {
    let index = getFieldIndex(entity, field)
    if (index == null) return
    imports.useMikroorm('Index')
    if (index.unique) {
        out.line(`@Index_({unique: true})`)
    } else {
        out.line(`@Index_()`)
    }
}

function getFieldIndex(entity: Entity, field: string): {unique?: boolean} | undefined {
    if (entity.properties[field]?.unique) return {unique: true}
    let candidates = entity.indexes?.filter((index) => index.fields[0]?.name == field) || []
    if (candidates.length == 0) return undefined
    if (candidates.find((index) => index.fields.length == 1 && index.unique)) return {unique: true}
    if (candidates.some((index) => index.fields.length > 1)) return undefined
    return candidates[0]
}

function printComment(obj: {description?: string}, out: Output) {
    if (obj.description) {
        const lines = obj.description.split('\n')
        out.blockComment(lines)
    }
}

class ImportRegistry {
    private mikroorm = new Set<string>()
    private model = new Set<string>()
    private types = false
    private bigdecimal = false
    private assert = false

    constructor(private owner: string) {}

    useMikroorm(...names: string[]): void {
        names.forEach((name) => this.mikroorm.add(name))
    }

    useModel(...names: string[]): void {
        names.forEach((name) => {
            if (name == this.owner) return
            this.model.add(name)
        })
    }

    useMarshal() {
        this.types = true
    }

    useBigDecimal() {
        this.bigdecimal = true
    }

    useAssert() {
        this.assert = true
    }

    render(model: Model, out: Output): void {
        if (this.bigdecimal) {
            out.line(`import {BigDecimal} from "@subsquid/big-decimal"`)
        }
        if (this.assert) {
            out.line('import assert from "assert"')
        }
        if (this.mikroorm.size > 0) {
            const importList = Array.from(this.mikroorm).map((name) => name + ' as ' + name + '_')
            out.line(`import {${importList.join(', ')}} from "@mikro-orm/core"`)
        }
        if (this.types) {
            out.line(`import * as types from "./types"`)
        }
        for (const name of this.model) {
            switch (model[name].kind) {
                case 'entity':
                    out.line(`import {${name}} from "./${toCamelCase(name)}.model"`)
                    break
                default: {
                    const names = [name]
                    if (model[name].kind === 'union') {
                        names.push('fromJson' + name)
                    }
                    out.line(`import {${names.join(', ')}} from "./_${toCamelCase(name)}"`)
                }
            }
        }
    }
}
