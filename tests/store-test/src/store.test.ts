import {assertNotNull} from '@subsquid/util-internal'
import expect from 'expect'
import {Item} from './model'
import {createStore, useDatabase} from './util'

describe('Store', function () {
    describe('.load()', function () {
        useDatabase([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ])

        it('load of a single entity', async function () {
            let store = await createStore()
            await store.defer(Item, '1').load(Item)
            expect(await store.get(Item, '1')).toMatchObject({id: '1', name: 'a'})
        })

        it('load of multiple entities', async function () {
            let store = await createStore()
            await store.defer(Item, '1').defer(Item, '2').load(Item)

            expect([await store.get(Item, '1'), await store.get(Item, '2')]).toMatchObject([
                {id: '1', name: 'a'},
                {id: '2', name: 'b'},
            ])
        })
    })

    describe('.persist()', function () {
        useDatabase([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ])

        it('persist of a single entity', async function () {
            let store = await createStore()
            store.persist(new Item({id: '4', name: 'd'}))
            await store.flush()
            store.clear()
            expect(await store.findOne(Item, {id: '4'})).toMatchObject({id: '4', name: 'd'})
        })

        it('persist of multiple entities', async function () {
            let store = await createStore()
            store.persist([new Item({id: '4', name: 'd'}), new Item({id: '5', name: 'e'})])
            await store.flush()
            store.clear()
            expect(await store.find(Item, {id: {$in: ['4', '5']}})).toMatchObject([
                {id: '4', name: 'd'},
                {id: '5', name: 'e'},
            ])
        })

        it('get after persisting', async function () {
            let store = await createStore()
            store.persist(new Item({id: '4', name: 'd'}))
            expect(await store.get(Item, '4')).toMatchObject({id: '4', name: 'd'})
        })
    })

    describe('update', function () {
        useDatabase([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ])

        it('update of a single entity', async function () {
            let store = await createStore()
            let item = await store.findOne(Item, {id: '1'}).then(assertNotNull)
            item.name = 'b'
            await store.flush()
            store.clear()
            expect(await store.find(Item, {id: {$in: ['1', '2']}})).toMatchObject([
                {id: '1', name: 'b'},
                {id: '2', name: 'b'},
            ])
        })

        it('update of multiple entities', async function () {
            let store = await createStore()
            let item1 = await store.findOne(Item, {id: '1'}).then(assertNotNull)
            item1.name = 'b'
            let item2 = await store.findOne(Item, {id: '2'}).then(assertNotNull)
            item2.name = 'a'
            await store.flush()
            store.clear()
            expect(await store.find(Item, {id: {$in: ['1', '2']}})).toMatchObject([
                {id: '1', name: 'b'},
                {id: '2', name: 'a'},
            ])
        })
    })

    describe('.remove()', function () {
        useDatabase([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ])

        it('removal by passing an entity', async function () {
            let store = await createStore()
            let item = await store.findOne(Item, {id: '1'}).then(assertNotNull)
            store.remove(item)
            await store.flush()
            expect(await store.find(Item, {})).toMatchObject([
                {id: '2', name: 'b'},
                {id: '3', name: 'c'},
            ])
        })

        it('removal by passing an array of entities', async function () {
            let store = await createStore()
            let items = await store.find(Item, {id: {$in: ['1', '2']}})
            store.remove(...items)
            await store.flush()
            expect(await store.find(Item, {})).toMatchObject([
                {id: '3', name: 'c'},
            ])
        })

        it('get after removing', async function () {
            let store = await createStore()
            let item = await store.findOne(Item, {id: '1'}).then(assertNotNull)
            store.remove(item)
            expect(await store.get(Item, '1')).toBeUndefined()
        })
    })
})
