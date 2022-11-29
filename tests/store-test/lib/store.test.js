"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_internal_1 = require("@subsquid/util-internal");
const expect_1 = __importDefault(require("expect"));
const model_1 = require("./model");
const util_1 = require("./util");
describe('Store', function () {
    describe('.load()', function () {
        (0, util_1.useDatabase)([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ]);
        it('load of a single entity', async function () {
            let store = await (0, util_1.createStore)();
            await store.defer(model_1.Item, '1').load(model_1.Item);
            (0, expect_1.default)(await store.get(model_1.Item, '1')).toMatchObject({ id: '1', name: 'a' });
        });
        it('load of multiple entities', async function () {
            let store = await (0, util_1.createStore)();
            await store.defer(model_1.Item, '1').defer(model_1.Item, '2').load(model_1.Item);
            (0, expect_1.default)([await store.get(model_1.Item, '1'), await store.get(model_1.Item, '2')]).toMatchObject([
                { id: '1', name: 'a' },
                { id: '2', name: 'b' },
            ]);
        });
    });
    describe('.persist()', function () {
        (0, util_1.useDatabase)([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ]);
        it('persist of a single entity', async function () {
            let store = await (0, util_1.createStore)();
            store.persist(new model_1.Item({ id: '4', name: 'd' }));
            await store.flush();
            store.clear();
            (0, expect_1.default)(await store.findOne(model_1.Item, { id: '4' })).toMatchObject({ id: '4', name: 'd' });
        });
        it('persist of multiple entities', async function () {
            let store = await (0, util_1.createStore)();
            store.persist([new model_1.Item({ id: '4', name: 'd' }), new model_1.Item({ id: '5', name: 'e' })]);
            await store.flush();
            store.clear();
            (0, expect_1.default)(await store.find(model_1.Item, { id: { $in: ['4', '5'] } })).toMatchObject([
                { id: '4', name: 'd' },
                { id: '5', name: 'e' },
            ]);
        });
        it('get after persisting', async function () {
            let store = await (0, util_1.createStore)();
            store.persist(new model_1.Item({ id: '4', name: 'd' }));
            (0, expect_1.default)(await store.get(model_1.Item, '4')).toMatchObject({ id: '4', name: 'd' });
        });
    });
    describe('update', function () {
        (0, util_1.useDatabase)([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ]);
        it('update of a single entity', async function () {
            let store = await (0, util_1.createStore)();
            let item = await store.findOne(model_1.Item, { id: '1' }).then(util_internal_1.assertNotNull);
            item.name = 'b';
            await store.flush();
            store.clear();
            (0, expect_1.default)(await store.find(model_1.Item, { id: { $in: ['1', '2'] } })).toMatchObject([
                { id: '1', name: 'b' },
                { id: '2', name: 'b' },
            ]);
        });
        it('update of multiple entities', async function () {
            let store = await (0, util_1.createStore)();
            let item1 = await store.findOne(model_1.Item, { id: '1' }).then(util_internal_1.assertNotNull);
            item1.name = 'b';
            let item2 = await store.findOne(model_1.Item, { id: '2' }).then(util_internal_1.assertNotNull);
            item2.name = 'a';
            await store.flush();
            store.clear();
            (0, expect_1.default)(await store.find(model_1.Item, { id: { $in: ['1', '2'] } })).toMatchObject([
                { id: '1', name: 'b' },
                { id: '2', name: 'a' },
            ]);
        });
    });
    describe('.remove()', function () {
        (0, util_1.useDatabase)([
            `CREATE TABLE item (id text primary key , name text)`,
            `INSERT INTO item (id, name) values ('1', 'a')`,
            `INSERT INTO item (id, name) values ('2', 'b')`,
            `INSERT INTO item (id, name) values ('3', 'c')`,
        ]);
        it('removal by passing an entity', async function () {
            let store = await (0, util_1.createStore)();
            let item = await store.findOne(model_1.Item, { id: '1' }).then(util_internal_1.assertNotNull);
            store.remove(item);
            await store.flush();
            (0, expect_1.default)(await store.find(model_1.Item, {})).toMatchObject([
                { id: '2', name: 'b' },
                { id: '3', name: 'c' },
            ]);
        });
        it('removal by passing an array of entities', async function () {
            let store = await (0, util_1.createStore)();
            let items = await store.find(model_1.Item, { id: { $in: ['1', '2'] } });
            store.remove(...items);
            await store.flush();
            (0, expect_1.default)(await store.find(model_1.Item, {})).toMatchObject([
                { id: '3', name: 'c' },
            ]);
        });
        it('get after removing', async function () {
            let store = await (0, util_1.createStore)();
            let item = await store.findOne(model_1.Item, { id: '1' }).then(util_internal_1.assertNotNull);
            store.remove(item);
            (0, expect_1.default)(await store.get(model_1.Item, '1')).toBeUndefined();
        });
    });
});
//# sourceMappingURL=store.test.js.map