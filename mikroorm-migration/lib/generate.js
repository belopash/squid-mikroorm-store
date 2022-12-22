"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const mikroorm_config_1 = require("@subsquid/mikroorm-config");
const util_internal_1 = require("@subsquid/util-internal");
const util_internal_code_printer_1 = require("@subsquid/util-internal-code-printer");
const commander_1 = require("commander");
const migrations_1 = require("@mikro-orm/migrations");
const dotenv = __importStar(require("dotenv"));
class SquidMigrationGenerator extends migrations_1.MigrationGenerator {
    generateMigrationFile(name, commands) {
        let timestamp = Date.now();
        let out = new util_internal_code_printer_1.Output();
        out.block(`module.exports = class ${name}${timestamp}`, () => {
            out.line(`name = '${name}${timestamp}'`);
            out.line();
            out.block(`async up(db)`, () => {
                commands.up.forEach((q) => {
                    if (q.length > 0)
                        out.line(`await db.query('${q}')`);
                });
            });
            out.line();
            out.block(`async down(db)`, () => {
                commands.down.forEach((q) => {
                    if (q.length > 0)
                        out.line(`await db.query('${q}')`);
                });
            });
        });
        return out.toString();
    }
}
(0, util_internal_1.runProgram)(async () => {
    commander_1.program.description('Analyze the current database state and generate migration to match the target schema');
    commander_1.program.option('-n, --name <name>', 'name suffix for new migration', 'Data');
    let { name } = commander_1.program.parse().opts();
    dotenv.config();
    let orm = await core_1.MikroORM.init({
        ...(0, mikroorm_config_1.createOrmConfig)(),
        migrations: {
            tableName: 'migrations',
            path: mikroorm_config_1.MIGRATIONS_DIR,
            snapshot: false,
            emit: 'js',
            // fileName: (timestamp: string) => (name || 'Data') + timestamp,
        },
    });
    try {
        await orm.migrator.createMigration();
    }
    finally {
        await orm.close().catch(() => null);
    }
});
//# sourceMappingURL=generate.js.map