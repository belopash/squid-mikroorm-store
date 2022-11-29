"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = exports.getEntityManager = exports.useDatabase = exports.databaseDelete = exports.databaseInit = exports.db_config = void 0;
const core_1 = require("@mikro-orm/core");
const mikroorm_config_1 = require("@subsquid/mikroorm-config");
const mikroorm_store_1 = require("@subsquid/mikroorm-store");
const util_internal_1 = require("@subsquid/util-internal");
const pg_1 = require("pg");
exports.db_config = {
    host: 'localhost',
    port: parseInt((0, util_internal_1.assertNotNull)(process.env.DB_PORT)),
    user: (0, util_internal_1.assertNotNull)(process.env.DB_USER),
    password: (0, util_internal_1.assertNotNull)(process.env.DB_PASS),
    database: (0, util_internal_1.assertNotNull)(process.env.DB_NAME),
};
async function withClient(block) {
    let client = new pg_1.Client(exports.db_config);
    await client.connect();
    try {
        await block(client);
    }
    finally {
        await client.end();
    }
}
function databaseInit(sql) {
    return withClient(async (client) => {
        for (let i = 0; i < sql.length; i++) {
            await client.query(sql[i]);
        }
    });
}
exports.databaseInit = databaseInit;
function databaseDelete() {
    return withClient(async (client) => {
        await client.query(`DROP SCHEMA IF EXISTS root CASCADE`);
        await client.query(`CREATE SCHEMA root`);
    });
}
exports.databaseDelete = databaseDelete;
function useDatabase(sql) {
    beforeEach(async () => {
        await databaseDelete();
        await databaseInit(sql);
    });
}
exports.useDatabase = useDatabase;
let connection;
function getEntityManager() {
    if (connection == null) {
        let cfg = (0, mikroorm_config_1.createOrmConfig)();
        connection = core_1.MikroORM.init(cfg);
    }
    return connection.then((con) => con.em.fork());
}
exports.getEntityManager = getEntityManager;
async function createStore() {
    let em = await getEntityManager();
    return new mikroorm_store_1.Store(() => em);
}
exports.createStore = createStore;
//# sourceMappingURL=util.js.map