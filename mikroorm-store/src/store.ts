import {
    EntityManager,
    EntityClass,
    Entity,
    FindOptions,
    FindOneOptions as FindOneOptions_,
    CountOptions as CountOptions_,
} from '@mikro-orm/core'
import {FilterQuery} from '@mikro-orm/core/typings'
import {assertNotNull} from '@subsquid/util-internal'

export interface Entity {
    id: string
}

/**
 * Defines a special criteria to find specific entity.
 */
export type FindManyOptions<E extends Entity = any> = Pick<FindOptions<E>, 'orderBy' | 'limit' | 'offset'>

export type FindOneOptions<E extends Entity = any> = Pick<FindOneOptions_<E>, 'orderBy'>

/**
 * Restricted version of  entity manager for squid data handlers.
 */
export class Store {
    private deferredIds = new Map<EntityClass<Entity>, Set<string>>()

    constructor(private em: () => EntityManager) {}

    defer<E extends Entity>(entityClass: EntityClass<E>, ...ids: string[]) {
        const deferedIds = this.getDeferredIds(entityClass)
        for (const id of ids) {
            deferedIds.add(id)
        }
        return this
    }

    async load<E extends Entity>(entityClass: EntityClass<E>): Promise<E[]>
    async load<E extends Entity>(): Promise<void>
    async load<E extends Entity>(entityClass?: EntityClass<E>): Promise<E[] | void> {
        if (entityClass) {
            return this.loadByEntityClass(entityClass)
        } else {
            for (const e of this.deferredIds.keys()) {
                await this.loadByEntityClass(e)
            }
        }
    }

    private async loadByEntityClass<E extends Entity>(entityClass: EntityClass<E>): Promise<E[]> {
        const deferredIds = this.getDeferredIds(entityClass)
        if (deferredIds.size == 0) return []

        const entities = await this.find(entityClass, {id: {$in: [...deferredIds]}} as any)
        deferredIds.clear()

        return entities
    }

    async loadOrPersist<E extends Entity>(entityClass: EntityClass<E>, create: (id: string) => E): Promise<E[]> {
        const deferredIds = this.getDeferredIds(entityClass)
        if (deferredIds.size == 0) return []

        const entities = await this.find(entityClass, {id: {$in: [...deferredIds]}} as any)

        const fetchedIds = new Set(entities.map((e) => e.id))
        for (const id of deferredIds) {
            if (fetchedIds.has(id)) continue

            const e = create(id)
            entities.push(e)
            this.persist(e)
        }
        deferredIds.clear()

        return entities
    }

    remove<E extends Entity>(...entities: E[]): this {
        this.em().remove(entities)
        return this
    }

    count<E extends Entity>(entityClass: EntityClass<E>, where?: FilterQuery<E>): Promise<number> {
        return this.em().count(entityClass, where)
    }

    find<E extends Entity>(
        entityClass: EntityClass<E>,
        where: FilterQuery<E>,
        options?: FindManyOptions
    ): Promise<E[]> {
        return this.em().find(entityClass, where, options)
    }

    findOne<E extends Entity>(
        entityClass: EntityClass<E>,
        where: FilterQuery<E>,
        options?: FindOneOptions
    ): Promise<E | undefined> {
        return this.em().findOne(entityClass, where, options).then(noNull)
    }

    findOneOrFail<E extends Entity>(
        entityClass: EntityClass<E>,
        where: FilterQuery<E>,
        options?: FindOneOptions
    ): Promise<E> {
        return this.em().findOneOrFail(entityClass, where, options)
    }

    get<E extends Entity>(entityClass: EntityClass<E>, id: string): E | undefined {
        let uow = this.em().getUnitOfWork()
        let item = uow.getById<E>(entityClass.name, id as any)
        if (item == null) {
            return [...uow.getPersistStack()].find((e) => e.id === id && e instanceof entityClass) as any
        } else {
            if (uow.getRemoveStack().has(item)) {
                return undefined
            } else {
                return item
            }
        }
    }
    getOrFail<E extends Entity>(entityClass: EntityClass<E>, id: string): E {
        return assertNotNull(this.get<E>(entityClass, id))
    }
    async getOrPersist<E extends Entity>(
        entityClass: EntityClass<E>,
        id: string,
        create: (id: string) => E
    ): Promise<E | undefined> {
        let e = this.get<E>(entityClass, id)
        if (!e) {
            e = create(id)
            this.persist(e)
        }
        return e
    }

    persist<E extends Entity>(e: E | E[]) {
        return this.em().persist(e)
    }

    flush(): Promise<void> {
        return this.em().flush()
    }

    clear() {
        return this.em().clear()
    }

    refresh<E extends Entity>(...entities: E[]) {
        return this.em().refresh(entities)
    }

    private getDeferredIds<E extends Entity>(entityClass: EntityClass<E>): Set<string> {
        let ids = this.deferredIds.get(entityClass)
        if (!ids) {
            ids = new Set()
            this.deferredIds.set(entityClass, ids)
        }
        return ids
    }
}

function* splitIntoBatches<T>(list: T[], maxBatchSize: number): Generator<T[]> {
    if (list.length <= maxBatchSize) {
        yield list
    } else {
        let offset = 0
        while (list.length - offset > maxBatchSize) {
            yield list.slice(offset, offset + maxBatchSize)
            offset += maxBatchSize
        }
        yield list.slice(offset)
    }
}

function noNull<T>(val: null | undefined | T): T | undefined {
    return val == null ? undefined : val
}
