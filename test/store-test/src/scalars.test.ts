import {Scalar} from './model'
import {createStore, useDatabase} from './util'
import expect from 'expect'
import {BigDecimal} from '@subsquid/big-decimal'

describe('scalars', function () {
    describe('Read', function () {
        useDatabase([
            `create table scalar (id text primary key, "boolean" bool, "bigint" numeric, "bigdecimal" numeric, "string" text, enum text, datetime timestamptz, "bytes" bytea, "json" jsonb, "deep" jsonb, "array" numeric array)`,
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
            `insert into scalar (id, "datetime", deep) values ('10', '2021-09-22T15:43:13.400Z', '{"datetime": "2021-09-24T00:00:00.120Z"}'::jsonb)`,
            `insert into scalar (id, "datetime", deep) values ('11', '2021-09-23T00:00:00.000Z', '{"datetime": "2021-09-24T00:00:00Z"}'::jsonb)`,
            `insert into scalar (id, "datetime", deep) values ('12', '2021-09-24 02:00:00.001 +01:00', '{"datetime": "2021-09-24T00:00:00.1Z"}'::jsonb)`,
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
            `insert into scalar (id, "array") values ('23', '{"1","2","3","4"}')`,
        ])

        describe('Boolean', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                expect(await store.find(Scalar, {id: {$in: ['1', '2']}})).toMatchObject([
                    {id: '1', boolean: true},
                    {id: '2', boolean: false},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    t: await store.find(Scalar, {boolean: true}),
                    f: await store.find(Scalar, {boolean: false}),
                    nt: await store.find(Scalar, {boolean: {$ne: true}}),
                    nf: await store.find(Scalar, {boolean: {$ne: false}}),
                }).toMatchObject({
                    t: [{id: '1'}],
                    f: [{id: '2'}],
                    nt: [{id: '2'}],
                    nf: [{id: '1'}],
                })
            })
        })

        describe('String', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                expect(await store.find(Scalar, {id: {$in: ['6', '7']}})).toMatchObject([
                    {id: '6', string: 'foo bar baz'},
                    {id: '7', string: 'bar baz foo'},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect(await store.find(Scalar, {string: 'baz foo bar'})).toMatchObject([
                    {id: '8', string: 'baz foo bar'},
                ])
            })
        })

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
        //                 nin: scalars(where: {enum_nin: B} orderBy: id_ASC) { id }
        //             }
        //         `,
        //             {
        //                 eq: [{id: '15'}],
        //                 not_eq: [{id: '16'}, {id: '17'}],
        //                 in: [{id: '15'}, {id: '16'}],
        //                 nin: [{id: '15'}, {id: '17'}],
        //             }
        //         )
        //     })
        // })

        describe('BigInt', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                expect(await store.find(Scalar, {id: {$in: ['3', '4', '5']}})).toMatchObject([
                    {id: '3', bigint: 1000000000000000000000000000000000000n},
                    {id: '4', bigint: 2000000000000000000000000000000000000n},
                    {id: '5', bigint: 5n},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    eq: await store.find(Scalar, {bigint: 2000000000000000000000000000000000000n}),
                    not_eq: await store.find(Scalar, {bigint: {$ne: 2000000000000000000000000000000000000n}}),
                    gt: await store.find(Scalar, {bigint: {$gt: 1000000000000000000000000000000000000n}}),
                    gte: await store.find(Scalar, {bigint: {$gte: 1000000000000000000000000000000000000n}}),
                    lt: await store.find(Scalar, {bigint: {$lt: 1000000000000000000000000000000000000n}}),
                    lte: await store.find(Scalar, {bigint: {$lte: 1000000000000000000000000000000000000n}}),
                    in: await store.find(Scalar, {bigint: {$in: [1000000000000000000000000000000000000n, 5n]}}),
                    nin: await store.find(Scalar, {bigint: {$nin: [1000000000000000000000000000000000000n, 5n]}}),
                    // deep_eq: await store.find(Scalar, {deep: {bigint: 1000000000000000000000000000000000000n}})
                }).toMatchObject({
                    eq: [{id: '4'}],
                    not_eq: [{id: '3'}, {id: '5'}],
                    gt: [{id: '4'}],
                    gte: [{id: '3'}, {id: '4'}],
                    lt: [{id: '5'}],
                    lte: [{id: '3'}, {id: '5'}],
                    in: [{id: '3'}, {id: '5'}],
                    nin: [{id: '4'}],
                    // deep_eq: [{id: '3'}]
                })
            })

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
        })

        describe('BigDecimal', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                expect(await store.find(Scalar, {id: {$in: ['20', '21', '22']}})).toMatchObject([
                    {id: '20', bigdecimal: BigDecimal('2e-35')},
                    {id: '21', bigdecimal: BigDecimal('1e-35')},
                    {id: '22', bigdecimal: BigDecimal('5')},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    eq: await store.find(Scalar, {bigdecimal: BigDecimal('0.00000000000000000000000000000000002')}),
                    not_eq: await store.find(Scalar, {
                        bigdecimal: {$ne: BigDecimal('0.00000000000000000000000000000000002')},
                    }),
                    gt: await store.find(Scalar, {
                        bigdecimal: {$gt: BigDecimal('0.00000000000000000000000000000000001')},
                    }),
                    gte: await store.find(Scalar, {
                        bigdecimal: {$gte: BigDecimal('0.00000000000000000000000000000000002')},
                    }),
                    lt: await store.find(Scalar, {
                        bigdecimal: {$lt: BigDecimal('0.00000000000000000000000000000000002')},
                    }),
                    lte: await store.find(Scalar, {
                        bigdecimal: {$lte: BigDecimal('0.00000000000000000000000000000000002')},
                    }),
                    in: await store.find(Scalar, {
                        bigdecimal: {$in: [BigDecimal('0.00000000000000000000000000000000001'), BigDecimal('5.0')]},
                    }),
                    nin: await store.find(Scalar, {
                        bigdecimal: {$nin: [BigDecimal('0.00000000000000000000000000000000001'), BigDecimal('5.0')]},
                    }),
                }).toMatchObject({
                    eq: [{id: '20'}],
                    not_eq: [{id: '21'}, {id: '22'}],
                    gt: [{id: '20'}, {id: '22'}],
                    gte: [{id: '20'}, {id: '22'}],
                    lt: [{id: '21'}],
                    lte: [{id: '20'}, {id: '21'}],
                    in: [{id: '21'}, {id: '22'}],
                    nin: [{id: '20'}],
                })
            })

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
        })

        describe('datetime', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                await expect(store.find(Scalar, {id: {$in: ['10', '11', '12']}})).resolves.toMatchObject([
                    {id: '10', datetime: new Date('2021-09-22T15:43:13.400000Z')},
                    {id: '11', datetime: new Date('2021-09-23T00:00:00.000000Z')},
                    {id: '12', datetime: new Date('2021-09-24T01:00:00.001000Z')},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    eq: await store.find(Scalar, {datetime: new Date('2021-09-22T15:43:13.400000Z')}),
                    ne: await store.find(Scalar, {datetime: {$ne: new Date('2021-09-22T15:43:13.400000Z')}}),
                    gt: await store.find(Scalar, {datetime: {$gt: new Date('2021-09-23T00:00:00.000000Z')}}),
                    gte: await store.find(Scalar, {datetime: {$gte: new Date('2021-09-23T00:00:00.000000Z')}}),
                    lt: await store.find(Scalar, {datetime: {$lt: new Date('2021-09-23T00:00:00.000000Z')}}),
                    lte: await store.find(Scalar, {datetime: {$lte: new Date('2021-09-23T00:00:00.000000Z')}}),
                    in: await store.find(Scalar, {
                        datetime: {
                            $in: [new Date('2021-09-22T15:43:13.400000Z'), new Date('2021-09-23T00:00:00.000000Z')],
                        },
                    }),
                    nin: await store.find(Scalar, {
                        datetime: {
                            $nin: [new Date('2021-09-22T15:43:13.400000Z'), new Date('2021-09-23T00:00:00.000000Z')],
                        },
                    }),
                }).toMatchObject({
                    eq: [{id: '10'}],
                    ne: [{id: '11'}, {id: '12'}],
                    gt: [{id: '12'}],
                    gte: [{id: '11'}, {id: '12'}],
                    lt: [{id: '10'}],
                    lte: [{id: '10'}, {id: '11'}],
                    in: [{id: '10'}, {id: '11'}],
                    nin: [{id: '12'}],
                })
            })

            // it('json sort', function () {
            //     return client.test(
            //         `
            //         query {
            //             scalars(orderBy: deep_datetime_ASC where: {id_in: ["10", "11", "12"]}) {
            //                 id
            //             }
            //         }
            //     `,
            //         {
            //             scalars: [{id: '11'}, {id: '12'}, {id: '10'}],
            //         }
            //     )
            // })
        })

        describe('Bytes', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                await expect(store.find(Scalar, {id: {$in: ['13', '14']}})).resolves.toMatchObject([
                    {id: '13', bytes: new Uint8Array(Buffer.from('aa', 'hex'))},
                    {id: '14', bytes: new Uint8Array(Buffer.from('bb', 'hex'))},
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    eq: await store.find(Scalar, {bytes: new Uint8Array(Buffer.from('aa', 'hex'))}),
                }).toMatchObject({
                    eq: [{id: '13'}],
                })
            })
        })

        describe('JSON', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                await expect(store.find(Scalar, {id: {$in: ['18']}})).resolves.toMatchObject([
                    {
                        id: '18',
                        json: {
                            key1: 'value1',
                        },
                    },
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    eq: await store.find(Scalar, {json: {key1: 'value1'}}),
                }).toMatchObject({
                    eq: [{id: '18'}],
                })
            })
        })

        describe('Array', function () {
            it('outputs correctly', async function () {
                let store = await createStore()
                await expect(store.find(Scalar, {id: {$in: ['23']}})).resolves.toMatchObject([
                    {
                        id: '23',
                        array: [1n, 2n, 3n, 4n],
                    },
                ])
            })

            it('supports where conditions', async function () {
                let store = await createStore()
                expect({
                    cn: await store.find(Scalar, {array: {$contains: [2].map(v => String(v))}}),
                }).toMatchObject({
                    cn: [{id: '23'}],
                })
            })
        })
    })
})
