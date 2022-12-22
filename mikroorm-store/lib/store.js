"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const util_internal_1 = require("@subsquid/util-internal");
/**
 * Restricted version of  entity manager for squid data handlers.
 */
class Store {
    constructor(em) {
        this.em = em;
        this.deferredIds = new Map();
    }
    defer(entityClass, ...ids) {
        const deferedIds = this.getDeferredIds(entityClass);
        for (const id of ids) {
            deferedIds.add(id);
        }
        return this;
    }
    async load(entityClass) {
        if (entityClass) {
            return this.loadByEntityClass(entityClass);
        }
        else {
            for (const e of this.deferredIds.keys()) {
                await this.loadByEntityClass(e);
            }
        }
    }
    async loadByEntityClass(entityClass) {
        const deferredIds = this.getDeferredIds(entityClass);
        if (deferredIds.size == 0)
            return [];
        const entities = await this.find(entityClass, { id: { $in: [...deferredIds] } });
        deferredIds.clear();
        return entities;
    }
    async loadOrPersist(entityClass, create) {
        const deferredIds = this.getDeferredIds(entityClass);
        if (deferredIds.size == 0)
            return [];
        const entities = await this.find(entityClass, { id: { $in: [...deferredIds] } });
        const fetchedIds = new Set(entities.map((e) => e.id));
        for (const id of deferredIds) {
            if (fetchedIds.has(id))
                continue;
            const e = create(id);
            entities.push(e);
            this.persist(e);
        }
        deferredIds.clear();
        return entities;
    }
    remove(...entities) {
        this.em().remove(entities);
        return this;
    }
    count(entityClass, where) {
        return this.em().count(entityClass, where);
    }
    find(entityClass, where, options) {
        return this.em().find(entityClass, where, options);
    }
    findOne(entityClass, where, options) {
        return this.em().findOne(entityClass, where, options).then(noNull);
    }
    findOneOrFail(entityClass, where, options) {
        return this.em().findOneOrFail(entityClass, where, options);
    }
    get(entityClass, id) {
        let uow = this.em().getUnitOfWork();
        let item = uow.getById(entityClass.name, id);
        if (item == null) {
            let persistMap = new Map([...uow.getPersistStack()].map((e) => [e.id, e]));
            return persistMap.get(id);
        }
        else {
            if (uow.getRemoveStack().has(item)) {
                return undefined;
            }
            else {
                return item;
            }
        }
    }
    getOrFail(entityClass, id) {
        return (0, util_internal_1.assertNotNull)(this.get(entityClass, id));
    }
    async getOrPersist(entityClass, id, create) {
        let e = this.get(entityClass, id);
        if (!e) {
            e = create(id);
            this.persist(e);
        }
        return e;
    }
    persist(e) {
        return this.em().persist(e);
    }
    flush() {
        return this.em().flush();
    }
    clear() {
        return this.em().clear();
    }
    refresh(...entities) {
        return this.em().refresh(entities);
    }
    getDeferredIds(entityClass) {
        let ids = this.deferredIds.get(entityClass);
        if (!ids) {
            ids = new Set();
            this.deferredIds.set(entityClass, ids);
        }
        return ids;
    }
}
exports.Store = Store;
function* splitIntoBatches(list, maxBatchSize) {
    if (list.length <= maxBatchSize) {
        yield list;
    }
    else {
        let offset = 0;
        while (list.length - offset > maxBatchSize) {
            yield list.slice(offset, offset + maxBatchSize);
            offset += maxBatchSize;
        }
        yield list.slice(offset);
    }
}
function noNull(val) {
    return val == null ? undefined : val;
}
//# sourceMappingURL=store.js.map