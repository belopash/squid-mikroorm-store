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
const commander_1 = require("commander");
const dotenv = __importStar(require("dotenv"));
(0, util_internal_1.runProgram)(async () => {
    commander_1.program.description('Apply pending migrations').parse();
    dotenv.config();
    let orm = await core_1.MikroORM.init({
        ...(0, mikroorm_config_1.createOrmConfig)(),
        migrations: {
            tableName: 'migrations',
            path: mikroorm_config_1.MIGRATIONS_DIR,
            transactional: true,
        },
        debug: ['query', 'schema', 'info'],
    });
    try {
        await orm.migrator.up();
    }
    finally {
        await orm.close().catch(() => null);
    }
});
//# sourceMappingURL=apply.js.map