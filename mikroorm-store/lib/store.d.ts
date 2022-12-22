import { EntityManager, EntityClass, FindOptions, FindOneOptions as FindOneOptions_ } from '@mikro-orm/core';
import { FilterQuery } from '@mikro-orm/core/typings';
export interface Entity {
    id: string;
}
/**
 * Defines a special criteria to find specific entity.
 */
export declare type FindManyOptions<E extends Entity = any> = Pick<FindOptions<E>, 'orderBy' | 'limit' | 'offset'>;
export declare type FindOneOptions<E extends Entity = any> = Pick<FindOneOptions_<E>, 'orderBy'>;
/**
 * Restricted version of  entity manager for squid data handlers.
 */
export declare class Store {
    private em;
    private deferredIds;
    constructor(em: () => EntityManager);
    defer<E extends Entity>(entityClass: EntityClass<E>, ...ids: string[]): this;
    load<E extends Entity>(entityClass: EntityClass<E>): Promise<E[]>;
    load<E extends Entity>(): Promise<void>;
    private loadByEntityClass;
    loadOrPersist<E extends Entity>(entityClass: EntityClass<E>, create: (id: string) => E): Promise<E[]>;
    remove<E extends Entity>(...entities: E[]): this;
    count<E extends Entity>(entityClass: EntityClass<E>, where?: FilterQuery<E>): Promise<number>;
    find<E extends Entity>(entityClass: EntityClass<E>, where: FilterQuery<E>, options?: FindManyOptions): Promise<E[]>;
    findOne<E extends Entity>(entityClass: EntityClass<E>, where: FilterQuery<E>, options?: FindOneOptions): Promise<E | undefined>;
    findOneOrFail<E extends Entity>(entityClass: EntityClass<E>, where: FilterQuery<E>, options?: FindOneOptions): Promise<E>;
    get<E extends Entity>(entityClass: EntityClass<E>, id: string): E | undefined;
    getOrFail<E extends Entity>(entityClass: EntityClass<E>, id: string): E;
    getOrPersist<E extends Entity>(entityClass: EntityClass<E>, id: string, create: (id: string) => E): Promise<E | undefined>;
    persist<E extends Entity>(e: E | E[]): EntityManager<import("@mikro-orm/core").IDatabaseDriver<import("@mikro-orm/core").Connection>>;
    flush(): Promise<void>;
    clear(): void;
    refresh<E extends Entity>(...entities: E[]): Promise<import("@mikro-orm/core").Loaded<E[], never> | null>;
    private getDeferredIds;
}
//# sourceMappingURL=store.d.ts.map