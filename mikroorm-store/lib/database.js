"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroormDatabase = void 0;
const util_internal_1 = require("@subsquid/util-internal");
const assert_1 = __importDefault(require("assert"));
const core_1 = require("@mikro-orm/core");
const store_1 = require("./store");
const tx_1 = require("./tx");
const mikroorm_config_1 = require("@subsquid/mikroorm-config");
class MikroormDatabase {
    constructor(options) {
        this.lastCommitted = -1;
        this.statusSchema = options?.stateSchema ? `"${options.stateSchema}"` : 'squid_processor';
        this.isolationLevel = options?.isolationLevel || core_1.IsolationLevel.SERIALIZABLE;
    }
    async connect() {
        if (this.orm != null) {
            throw new Error('Already connected');
        }
        let cfg = (0, mikroorm_config_1.createOrmConfig)();
        let orm = await core_1.MikroORM.init(cfg);
        try {
            let height = await orm.em.transactional(async (em) => {
                await em.execute(`CREATE SCHEMA IF NOT EXISTS ${this.statusSchema}`);
                await em.execute(`
                    CREATE TABLE IF NOT EXISTS ${this.statusSchema}.status (
                        id int primary key,
                        height int not null
                    )`);
                let status = await em.execute(`SELECT height FROM ${this.statusSchema}.status WHERE id = 0`);
                if (status.length == 0) {
                    await em.execute(`INSERT INTO ${this.statusSchema}.status (id, height) VALUES (0, -1)`);
                    return -1;
                }
                else {
                    return status[0].height;
                }
            }, {
                isolationLevel: core_1.IsolationLevel.SERIALIZABLE,
            });
            this.updateHeight = async (em, from, to) => {
                await em
                    .execute(`UPDATE ${this.statusSchema}.status SET height = ${to} WHERE id = 0 AND height < ${from}`, [], 'run')
                    .then((result) => {
                    assert_1.default.strictEqual(result.affectedRows, 1, 'status table was updated by foreign process, make sure no other processor is running');
                });
            };
            this.orm = orm;
            return height;
        }
        catch (e) {
            await orm.close().catch(() => { }); // ignore error
            throw e;
        }
    }
    async close() {
        let orm = this.orm;
        this.orm = undefined;
        this.lastCommitted = -1;
        if (orm) {
            await orm.close();
        }
    }
    async transact(from, to, cb) {
        let retries = 3;
        while (true) {
            try {
                return await this.runTransaction(from, to, cb);
            }
            catch (e) {
                if (e.code == '40001' && retries) {
                    retries -= 1;
                }
                else {
                    throw e;
                }
            }
        }
    }
    async updateHeight(em, from, to) {
        throw new Error('Not implemented');
    }
    async runTransaction(from, to, cb) {
        let tx = await this.createTx(from, to);
        let open = true;
        let store = new store_1.Store(() => {
            (0, assert_1.default)(open, `Transaction was already closed`);
            return tx.em;
        });
        try {
            await cb(store);
        }
        catch (e) {
            open = false;
            await tx.rollback().catch((err) => null);
            throw e;
        }
        open = false;
        await tx.commit();
        this.lastCommitted = to;
    }
    async createTx(from, to) {
        let orm = (0, util_internal_1.assertNotNull)(this.orm, 'not connected');
        let tx = await (0, tx_1.createTransaction)(orm.em, this.isolationLevel);
        try {
            await this.updateHeight(tx.em, from, to);
            return tx;
        }
        catch (e) {
            await tx.rollback().catch(() => { });
            throw e;
        }
    }
    async advance(height) {
        if (this.lastCommitted == height)
            return;
        let tx = await this.createTx(height, height);
        await tx.commit();
    }
}
exports.MikroormDatabase = MikroormDatabase;
//# sourceMappingURL=database.js.map