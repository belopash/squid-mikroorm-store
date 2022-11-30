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

            expect(store.get(Item, '1')).toMatchObject({id: '1', name: 'a'})
        })

        it('load of multiple entities', async function () {
            let store = await createStore()
            await store.defer(Item, '1').defer(Item, '2').load(Item)

            expect([store.get(Item, '1'), store.get(Item, '2')]).toMatchObject([
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

            await expect(store.findOne(Item, '4')).resolves.toMatchObject({id: '4', name: 'd'})
        })

        it('persist of multiple entities', async function () {
            let store = await createStore()
            store.persist([new Item({id: '4', name: 'd'}), new Item({id: '5', name: 'e'})])
            await store.flush()
            store.clear()

            await expect(store.find(Item, ['4', '5'])).resolves.toMatchObject([
                {id: '4', name: 'd'},
                {id: '5', name: 'e'},
            ])
        })

        it('get after persist without flush', async function () {
            let store = await createStore()
            store.persist(new Item({id: '4', name: 'd'}))

            expect(store.get(Item, '4')).toMatchObject({id: '4', name: 'd'})
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
            let item = await store.findOneOrFail(Item, {id: '1'})
            item.name = 'b'
            await store.flush()
            store.clear()

            await expect(store.find(Item, {id: {$in: ['1', '2']}})).resolves.toMatchObject([
                {id: '1', name: 'b'},
                {id: '2', name: 'b'},
            ])
        })

        it('update of multiple entities', async function () {
            let store = await createStore()
            let items = await store.find(Item, ['1', '2'])
            items[0].name = 'b'
            items[1].name = 'a'
            await store.flush()
            store.clear()

            await expect(store.find(Item, {id: {$in: ['1', '2']}})).resolves.toMatchObject([
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
            let item = await store.findOneOrFail(Item, '1')
            store.remove(item)
            await store.flush()
            store.clear()

            await expect(store.find(Item, {})).resolves.toMatchObject([
                {id: '2', name: 'b'},
                {id: '3', name: 'c'},
            ])
        })

        it('removal by passing an array of entities', async function () {
            let store = await createStore()
            let items = await store.find(Item, {id: {$in: ['1', '2']}})
            store.remove(...items)
            await store.flush()
            store.clear()

            await expect(store.find(Item, {})).resolves.toMatchObject([{id: '3', name: 'c'}])
        })
    })
})
