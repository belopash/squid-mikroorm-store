"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
const util_1 = require("./util");
const expect_1 = __importDefault(require("expect"));
const big_decimal_1 = require("@subsquid/big-decimal");
describe('scalars', function () {
    (0, util_1.useDatabase)([
        `create table scalar (id text primary key, "boolean" bool, "bigint" numeric, "bigdecimal" numeric, "string" text, enum text, date_time timestamptz, "bytes" bytea, "json" jsonb, "deep" jsonb)`,
        `insert into scalar (id, "boolean") values ('1', true)`,
        `insert into scalar (id, "boolean", deep) values ('2', false, '{"boolean": true}'::jsonb)`,
        `insert into scalar (id, "bigint", deep) values ('3', 1000000000000000000000000000000000000, '{"bigint": "1000000000000000000000000000000000000"}'::jsonb)`,
        `insert into scalar (id, "bigint", deep) values ('4', 2000000000000000000000000000000000000, '{"bigint": "2000000000000000000000000000000000000"}'::jsonb)`,
        `insert into scalar (id, "bigint", deep) values ('5', 5, '{"bigint": "5"}'::jsonb)`,
        `insert into scalar (id, "string") values ('6', 'foo bar baz')`,
        `insert into scalar (id, "string") values ('7', 'bar baz foo')`,
        `insert into scalar (id, "string") values ('8', 'baz foo bar')`,
        `insert into scalar (id, "string") values ('9', 'hello')`,
        `insert into scalar (id, "string") values ('9-1', 'A fOo B')`,
        `insert into scalar (id, "date_time", deep) values ('10', '2021-09-24T15:43:13.400Z', '{"dateTime": "2021-09-24T00:00:00.120Z"}'::jsonb)`,
        `insert into scalar (id, "date_time", deep) values ('11', '2021-09-24T00:00:00.000Z', '{"dateTime": "2021-09-24T00:00:00Z"}'::jsonb)`,
        `insert into scalar (id, "date_time", deep) values ('12', '2021-09-24 02:00:00.001 +01:00', '{"dateTime": "2021-09-24T00:00:00.1Z"}'::jsonb)`,
        `insert into scalar (id, "bytes", deep) values ('13', decode('aa', 'hex'), '{"bytes": "0xaa"}'::jsonb)`,
        `insert into scalar (id, "bytes", deep) values ('14', decode('bb', 'hex'), '{"bytes": "0xCCDD"}'::jsonb)`,
        `insert into scalar (id, "enum") values ('15', 'A')`,
        `insert into scalar (id, "enum") values ('16', 'B')`,
        `insert into scalar (id, "enum") values ('17', 'C')`,
        `insert into scalar (id, "json") values ('18', '{"key1": "value1"}'::jsonb)`,
        `insert into scalar (id, "json") values ('19', '{"key2": "value2"}'::jsonb)`,
        `insert into scalar (id, "bigdecimal", deep) values ('20', 0.00000000000000000000000000000000002, '{"bigdecimal": "100.00000000000000000000000000000000002"}'::jsonb)`,
        `insert into scalar (id, "bigdecimal", deep) values ('21', 0.00000000000000000000000000000000001, '{"bigdecimal": "12.00000000000000000000000000000000001"}'::jsonb)`,
        `insert into scalar (id, "bigdecimal", deep) values ('22', 5, '{"bigdecimal": "5"}'::jsonb)`,
    ]);
    describe('Boolean', function () {
        it('outputs correctly', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)(await store.find(model_1.Scalar, { id: { $in: ['1', '2'] } })).toMatchObject([
                { id: '1', boolean: true },
                { id: '2', boolean: false },
            ]);
        });
        it('supports where conditions', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)({
                t: await store.find(model_1.Scalar, { boolean: true }),
                f: await store.find(model_1.Scalar, { boolean: false }),
                nt: await store.find(model_1.Scalar, { boolean: { $ne: true } }),
                nf: await store.find(model_1.Scalar, { boolean: { $ne: false } }),
            }).toMatchObject({
                t: [{ id: '1' }],
                f: [{ id: '2' }],
                nt: [{ id: '2' }],
                nf: [{ id: '1' }],
            });
        });
    });
    describe('String', function () {
        it('outputs correctly', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)(await store.find(model_1.Scalar, { id: { $in: ['6', '7'] } })).toMatchObject([
                { id: '6', string: 'foo bar baz' },
                { id: '7', string: 'bar baz foo' },
            ]);
        });
        it('supports where conditions', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)(await store.find(model_1.Scalar, { string: 'baz foo bar' })).toMatchObject([{ id: '8', string: 'baz foo bar' }]);
        });
    });
    // describe('Enum', function () {
    //     it('outputs correctly', function () {
    //         return client.test(
    //             `
    //             query {
    //                 scalars(where: {id_in: ["15", "16", "17"]} orderBy: id_ASC) {
    //                     id
    //                     enum
    //                 }
    //             }
    //         `,
    //             {
    //                 scalars: [
    //                     {id: '15', enum: 'A'},
    //                     {id: '16', enum: 'B'},
    //                     {id: '17', enum: 'C'},
    //                 ],
    //             }
    //         )
    //     })
    //     it('supports where conditions', function () {
    //         return client.test(
    //             `
    //             query {
    //                 eq: scalars(where: {enum_eq: A} orderBy: id_ASC) { id }
    //                 not_eq: scalars(where: {enum_not_eq: A} orderBy: id_ASC) { id }
    //                 in: scalars(where: {enum_in: [A, B]} orderBy: id_ASC) { id }
    //                 not_in: scalars(where: {enum_not_in: B} orderBy: id_ASC) { id }
    //             }
    //         `,
    //             {
    //                 eq: [{id: '15'}],
    //                 not_eq: [{id: '16'}, {id: '17'}],
    //                 in: [{id: '15'}, {id: '16'}],
    //                 not_in: [{id: '15'}, {id: '17'}],
    //             }
    //         )
    //     })
    // })
    describe('BigInt', function () {
        it('outputs correctly', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)(await store.find(model_1.Scalar, { id: { $in: ['3', '4', '5'] } })).toMatchObject([
                {
                    id: '3',
                    bigint: 1000000000000000000000000000000000000n,
                },
                {
                    id: '4',
                    bigint: 2000000000000000000000000000000000000n,
                },
                {
                    id: '5',
                    bigint: 5n,
                },
            ]);
        });
        it('supports where conditions', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)({
                eq: await store.find(model_1.Scalar, { bigint: 2000000000000000000000000000000000000n }),
                not_eq: await store.find(model_1.Scalar, { bigint: { $ne: 2000000000000000000000000000000000000n } }),
                gt: await store.find(model_1.Scalar, { bigint: { $gt: 1000000000000000000000000000000000000n } }),
                gte: await store.find(model_1.Scalar, { bigint: { $gte: 1000000000000000000000000000000000000n } }),
                lt: await store.find(model_1.Scalar, { bigint: { $lt: 1000000000000000000000000000000000000n } }),
                lte: await store.find(model_1.Scalar, { bigint: { $lte: 1000000000000000000000000000000000000n } }),
                in: await store.find(model_1.Scalar, { bigint: { $in: [1000000000000000000000000000000000000n, 5n] } }),
                not_in: await store.find(model_1.Scalar, { bigint: { $nin: [1000000000000000000000000000000000000n, 5n] } }),
            }).toMatchObject({
                eq: [{ id: '4' }],
                not_eq: [{ id: '3' }, { id: '5' }],
                gt: [{ id: '4' }],
                gte: [{ id: '3' }, { id: '4' }],
                lt: [{ id: '5' }],
                lte: [{ id: '3' }, { id: '5' }],
                in: [{ id: '3' }, { id: '5' }],
                not_in: [{ id: '4' }],
            });
        });
        // it('json sort', function () {
        //     return client.test(
        //         `
        //         query {
        //             scalars(orderBy: deep_bigint_ASC where: {id_in: ["3", "4", "5"]}) {
        //                 id
        //             }
        //         }
        //     `,
        //         {
        //             scalars: [{id: '5'}, {id: '3'}, {id: '4'}],
        //         }
        //     )
        // })
    });
    describe('BigDecimal', function () {
        it('outputs correctly', async function () {
            let store = await (0, util_1.createStore)();
            (0, expect_1.default)(await store.find(model_1.Scalar, { id: { $in: ['20', '21', '22'] } })).toMatchObject([
                {
                    id: '20',
                    bigdecimal: (0, big_decimal_1.BigDecimal)('2e-35'),
                },
                {
                    id: '21',
                    bigdecimal: (0, big_decimal_1.BigDecimal)('1e-35'),
                },
                {
                    id: '22',
                    bigdecimal: (0, big_decimal_1.BigDecimal)('5'),
                },
            ]);
        });
        // it('supports where conditions', function () {
        //     return client.test(
        //         `
        //         query {
        //             eq: scalars(where: {bigdecimal_eq: 0.00000000000000000000000000000000002} orderBy: id_ASC) { id }
        //             not_eq: scalars(where: {bigdecimal_not_eq: 0.00000000000000000000000000000000002} orderBy: id_ASC) { id }
        //             gt: scalars(where: {bigdecimal_gt: 0.00000000000000000000000000000000001} orderBy: id_ASC) { id }
        //             gte: scalars(where: {bigdecimal_gte: 0.00000000000000000000000000000000002} orderBy: id_ASC) { id }
        //             lt: scalars(where: {bigdecimal_lt: 0.00000000000000000000000000000000002} orderBy: id_ASC) { id }
        //             lte: scalars(where: {bigdecimal_lte: 0.00000000000000000000000000000000002} orderBy: id_ASC) { id }
        //             in: scalars(where: {bigdecimal_in: [0.00000000000000000000000000000000001, 5.0]} orderBy: id_ASC) { id }
        //             not_in: scalars(where: {bigdecimal_not_in: [0.00000000000000000000000000000000001, 5.0]} orderBy: id_ASC) { id }
        //         }
        //     `,
        //         {
        //             eq: [{id: '20'}],
        //             not_eq: [{id: '21'}, {id: '22'}],
        //             gt: [{id: '20'}, {id: '22'}],
        //             gte: [{id: '20'}, {id: '22'}],
        //             lt: [{id: '21'}],
        //             lte: [{id: '20'}, {id: '21'}],
        //             in: [{id: '21'}, {id: '22'}],
        //             not_in: [{id: '20'}],
        //         }
        //     )
        // })
        //     it('json sort', function () {
        //         return client.test(
        //             `
        //             query {
        //                 scalars(orderBy: deep_bigdecimal_ASC where: {id_in: ["20", "21", "22"]}) {
        //                     id
        //                 }
        //             }
        //         `,
        //             {
        //                 scalars: [{id: '22'}, {id: '21'}, {id: '20'}],
        //             }
        //         )
        //     })
    });
    // describe('DateTime', function () {
    //     it('outputs correctly', function () {
    //         return client.test(
    //             `
    //             query {
    //                 scalars(where: {id_in: ["10", "11", "12"]} orderBy: id_ASC) {
    //                     id
    //                     dateTime
    //                     deep { dateTime }
    //                 }
    //             }
    //         `,
    //             {
    //                 scalars: [
    //                     {
    //                         id: '10',
    //                         dateTime: '2021-09-24T15:43:13.400000Z',
    //                         deep: {dateTime: '2021-09-24T00:00:00.120Z'},
    //                     },
    //                     {id: '11', dateTime: '2021-09-24T00:00:00.000000Z', deep: {dateTime: '2021-09-24T00:00:00Z'}},
    //                     {id: '12', dateTime: '2021-09-24T01:00:00.001000Z', deep: {dateTime: '2021-09-24T00:00:00.1Z'}},
    //                 ],
    //             }
    //         )
    //     })
    //     it('supports where conditions', function () {
    //         return client.test(
    //             `
    //             query {
    //                 gt: scalars(orderBy: id_ASC, where: {dateTime_gt: "2021-09-24T00:00:00Z"}) { id }
    //                 gte: scalars(orderBy: id_ASC, where: {dateTime_gte: "2021-09-24T00:00:00Z"}) { id }
    //                 lt: scalars(orderBy: id_ASC, where: {dateTime_lt: "2021-09-24T00:00:00Z"}) { id }
    //                 lte: scalars(orderBy: id_ASC, where: {dateTime_lte: "2021-09-24T00:00:00Z"}) { id }
    //                 in: scalars(orderBy: id_ASC, where: {dateTime_in: ["2021-09-24T00:00:00Z", "2021-09-24T15:43:13.400Z"]}) { id }
    //                 not_in: scalars(orderBy: id_ASC, where: {dateTime_not_in: ["2021-09-24T00:00:00Z", "2021-09-24T15:43:13.400Z"]}) { id }
    //             }
    //         `,
    //             {
    //                 gt: [{id: '10'}, {id: '12'}],
    //                 gte: [{id: '10'}, {id: '11'}, {id: '12'}],
    //                 lt: [],
    //                 lte: [{id: '11'}],
    //                 in: [{id: '10'}, {id: '11'}],
    //                 not_in: [{id: '12'}],
    //             }
    //         )
    //     })
    //     it('json sort', function () {
    //         return client.test(
    //             `
    //             query {
    //                 scalars(orderBy: deep_dateTime_ASC where: {id_in: ["10", "11", "12"]}) {
    //                     id
    //                 }
    //             }
    //         `,
    //             {
    //                 scalars: [{id: '11'}, {id: '12'}, {id: '10'}],
    //             }
    //         )
    //     })
    // })
    // describe('Bytes', function () {
    //     it('outputs correctly', function () {
    //         return client.test(
    //             `
    //             query {
    //                 scalars(where: {id_in: ["13", "14"]} orderBy: id_ASC) {
    //                     id
    //                     bytes
    //                     deep { bytes }
    //                 }
    //             }
    //         `,
    //             {
    //                 scalars: [
    //                     {id: '13', bytes: '0xaa', deep: {bytes: '0xaa'}},
    //                     {id: '14', bytes: '0xbb', deep: {bytes: '0xccdd'}},
    //                 ],
    //             }
    //         )
    //     })
    //     it('supports where conditions', function () {
    //         return client.test(
    //             `
    //             query {
    //                 eq: scalars(where: {bytes_eq: "0xaa"} orderBy: id_ASC) { id }
    //                 deep_eq: scalars(where: {deep: {bytes_eq: "0xccdd"}} orderBy: id_ASC) { id }
    //             }
    //         `,
    //             {
    //                 eq: [{id: '13'}],
    //                 deep_eq: [{id: '14'}],
    //             }
    //         )
    //     })
    // })
    // describe('JSON', function () {
    //     it('outputs correctly', function () {
    //         return client.test(
    //             `
    //             query {
    //                 scalars(where: {id_in: ["18"]}, orderBy: id_ASC) {
    //                     id
    //                     json
    //                 }
    //             }
    //         `,
    //             {
    //                 scalars: [{id: '18', json: {key1: 'value1'}}],
    //             }
    //         )
    //     })
    //     it('supports where conditions', function () {
    //         return client.test(
    //             `
    //             query {
    //                 eq: scalars(where: {json_eq: {key1: "value1"}}) { id }
    //                 jsonHasKey: scalars(where: {json_jsonHasKey: "key1"}) { id }
    //                 jsonContains: scalars(where: {json_jsonContains: {key2: "value2"}}) { id }
    //                 missingKey: scalars(where: {json_jsonHasKey: {foo: 1}}) { id }
    //             }
    //         `,
    //             {
    //                 eq: [{id: '18'}],
    //                 jsonHasKey: [{id: '18'}],
    //                 jsonContains: [{id: '19'}],
    //                 missingKey: [],
    //             }
    //         )
    //     })
    // })
});
//# sourceMappingURL=scalars.test.js.map