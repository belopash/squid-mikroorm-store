"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrmConfig = exports.MIGRATIONS_DIR = void 0;
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@mikro-orm/core");
const connectionOptions_1 = require("./connectionOptions");
const postgresql_1 = require("@mikro-orm/postgresql");
exports.MIGRATIONS_DIR = 'db/migrations';
function createOrmConfig(options) {
    let dir = path_1.default.resolve(options?.projectDir || process_1.default.cwd());
    let model = resolveModel(path_1.default.join(dir, 'lib/model/models.js'));
    let migrationsDir = path_1.default.join(dir, exports.MIGRATIONS_DIR);
    return {
        driver: postgresql_1.PostgreSqlDriver,
        namingStrategy: core_1.UnderscoreNamingStrategy,
        entities: [model],
        migrations: { path: migrationsDir },
        ...(0, connectionOptions_1.createConnectionOptions)(),
        useBatchInserts: true,
        useBatchUpdates: true,
        schemaGenerator: {
            ignoreSchema: ['squid_status', 'squid_processor'],
        },
    };
}
exports.createOrmConfig = createOrmConfig;
function resolveModel(model) {
    model = path_1.default.resolve(model || 'lib/model/models.js');
    try {
        return require.resolve(model);
    }
    catch (e) {
        throw new Error(`Failed to resolve model ${model}. Did you forget to run codegen or compile the code?`);
    }
}
//# sourceMappingURL=config.js.map