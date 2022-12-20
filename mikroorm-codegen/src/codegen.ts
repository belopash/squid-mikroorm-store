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
    dir.add('support.ts', path.resolve(__dirname, '../src/support.ts'))

    function generateEntity(name: string, entity: Entity): void {
        index.line(`export * from "./${toCamelCase(name)}.model"`)
        const out = dir.file(`${toCamelCase(name)}.model.ts`)
        const imports = new ImportRegistry(name)
        imports.useMikroorm('Entity', 'Property', 'PrimaryKey')
        imports.useSupport('types')
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
                            out.line('@PrimaryKey_({type: types.String})')
                        } else {
                            addIndexAnnotation(entity, key, imports, out)
                            out.line(`@Property_({type: types.${prop.type.name}, nullable: ${prop.nullable}})`)
                            break
                        }
                        break
                    case 'enum':
                        imports.useMikroorm('Enum')
                        addIndexAnnotation(entity, key, imports, out)
                        out.line(`@Enum_({type: types.String, items: () => ${prop.type.name}, nullable: ${prop.nullable}})`)
                        break
                    case 'fk':
                        if (getFieldIndex(entity, key)?.unique) {
                            imports.useMikroorm('OneToOne', 'Index', 'Unique')
                            out.line(`@Index_()`)
                            out.line(`@Unique_()`)
                            out.line(`@OneToOne_(() => ${prop.type.entity}, {nullable: false, mapToPk: true})`)
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
                        addIndexAnnotation(entity, key, imports, out)
                        out.line(
                            `@Property_({type: types.JSONobj(${prop.type.name}.fromJSON), nullable: ${prop.nullable}})`
                        )
                        break
                    case 'union':
                        addIndexAnnotation(entity, key, imports, out)
                        out.line(
                            `@Property_({type: types.JSONobj(fromJson${prop.type.name}), nullable: ${prop.nullable}})`
                        )
                        break
                    case 'list':
                        switch (prop.type.item.type.kind) {
                            case 'scalar':
                                out.line(
                                    `@Property_({type: types.Array(types.${prop.type.item.type.name}), nullable: ${prop.nullable}})`
                                )
                                break
                            case 'enum':
                                out.line(
                                    `@Enum_({type: types.String, items: () => ${prop.type.item.type.name}, array: true, nullable: ${prop.nullable}})`
                                )
                                break
                            case 'object':
                            case 'union':
                            case 'list':
                                out.line(
                                    `@Property_("jsonb", {transformer: {to: obj => ${typesToJson(
                                        prop,
                                        'obj'
                                    )}, from: obj => ${typesFromJson(prop, 'obj', imports)}}, nullable: ${
                                        prop.nullable
                                    }})`
                                )
                                break
                            default:
                                throw unexpectedCase(prop.type.item.type.kind)
                        }
                        // throw unexpectedCase((prop.type as any).kind)
                        break
                    case 'lookup':
                    case 'list-lookup':
                        continue
                    default:
                        throw unexpectedCase((prop.type as any).kind)
                }
                out.line(`${key}!: ${getPropJs(imports, 'entity', prop)}`)
            }
        })
        out.write()
    }

    function generateObject(name: string, object: JsonObject): void {
        index.line(`export * from "./_${toCamelCase(name)}"`)
        const out = dir.file(`_${toCamelCase(name)}.ts`)
        const imports = new ImportRegistry(name)
        imports.useSupport('types')
        imports.useAssert()
        out.lazy(() => imports.render(model, out))
        out.line()
        printComment(object, out)
        out.block(`export class ${name}`, () => {
            if (variants.has(name)) {
                out.line(`public readonly isOf = '${name}'`)
            }
            for (const key in object.properties) {
                const prop = object.properties[key]
                importReferencedModel(imports, prop)
                out.line(`private _${key}!: ${getPropJs(imports, 'object', prop)}`)
            }
            out.line()
            out.block(`constructor(props?: Partial<Omit<${name}, 'toJSON'>>)`, () => {
                out.line('Object.assign(this, props)')
            })
            for (const key in object.properties) {
                const prop = object.properties[key]
                out.line()
                printComment(prop, out)
                out.block(`get ${key}(): ${getPropJs(imports, 'object', prop)}`, () => {
                    if (!prop.nullable) {
                        out.line(`assert(this._${key} != null, 'uninitialized access')`)
                    }
                    out.line(`return this._${key}`)
                })
                out.line()
                out.block(`set ${key}(value: ${getPropJs(imports, 'object', prop)})`, () => {
                    out.line(`this._${key} = value`)
                })
            }
            out.line()
            out.block(`toJSON(): object`, () => {
                out.block('return', () => {
                    if (variants.has(name)) {
                        out.line('isOf: this.isOf,')
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
                        out.line(`${key}: ${typesFromJson(prop, 'json.' + key, imports)},`)
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

    function typesFromJson(prop: Prop, exp: string, imports: ImportRegistry): string {
        // assumes exp is a pure variable or prop access
        imports.useSupport('types')
        let convert: string
        switch (prop.type.kind) {
            case 'scalar':
                convert = `types.${prop.type.name}.convertToJSValue(${exp})`
                break
            case 'enum':
                imports.useSupport('enumFromJson')
                convert = `enumFromJson(${exp}, ${prop.type.name})`
                break
            case 'fk':
                convert = `types.String.convertToJSValue(${exp})`
                break
            case 'object':
                convert = `types.JSONobj(${prop.type.name}.fromJSON).convertToJSValue(${exp})`
                break
            case 'union':
                convert = `types.JSONobj(fromJson${prop.type.name}).convertToJSValue(${exp})`
                break
            case 'list':
                switch (prop.type.item.type.kind) {
                    case 'enum':
                        imports.useSupport('enumFromJson')
                        convert = `${exp}.map((i) => enumFromJson(i, ${prop.type.item.type.name}))`
                        break
                    default:
                        convert = `types.Array(${toArrayItemType(prop.type.item)}).convertToJSValue(${exp})`
                        break
                }
                break
            default:
                throw unexpectedCase(prop.type.kind)
        }
        return convert
    }

    function toArrayItemType(prop: Prop): string {
        switch (prop.type.kind) {
            case 'scalar':
                return `types.${prop.type.name}`
            case 'fk':
                return `types.String`
            case 'object':
                return `types.JSONobj(${prop.type.name}.fromJSON)`
            case 'union':
                return `types.JSONobj(fromJson${prop.type.name})`
            case 'list':
                return `types.Array(${toArrayItemType(prop.type.item)})`
            default:
                throw unexpectedCase(prop.type.kind)
        }
    }

    function typesToJson(prop: Prop, exp: string): string {
        // assumes exp is a pure variable or prop access
        let convert: string
        switch (prop.type.kind) {
            case 'scalar':
                convert = `types.${prop.type.name}.toJSON(${exp})`
                break
            case 'object':
            case 'union':
                convert = `types.JSON.toJSON(${exp})`
                break
            case 'enum':
            case 'fk':
                convert = `types.String.toJSON(${exp})`
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
            out.block(`switch(json?.isOf)`, () => {
                union.variants.forEach((v) => {
                    out.line(`case '${v}': return ${v}.fromJSON(json)`)
                })
                out.line(`default: throw new Error('Unknown json object passed as ${name}')`)
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

function getPropJs(imports: ImportRegistry, owner: 'entity' | 'object', prop: Prop): string {
    let type: string
    switch (prop.type.kind) {
        case 'scalar':
            type = getScalarJs(prop.type.name)
            if (type == 'BigDecimal') {
                imports.useBigDecimal()
            }
            break
        case 'enum':
        case 'object':
        case 'union':
            imports.useModel(prop.type.name)
            type = prop.type.name
            break
        case 'fk':
            type = 'string'
            break
        case 'list':
            type = getPropJs(imports, 'object', prop.type.item)
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

function getScalarJs(typeName: string): string {
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
    out.line(`@Index_()`)
    if (index.unique) {
        imports.useMikroorm('Unique')
        out.line(`@Unique_()`)
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
    private support = new Set<string>()
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

    useSupport(...names: string[]) {
        names.forEach((name) => this.support.add(name))
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
        if (this.support.size > 0) {
            out.line(`import {${Array.from(this.support).join(', ')}} from "./support"`)
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
