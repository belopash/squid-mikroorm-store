"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnectionOptions = void 0;
const process_1 = __importDefault(require("process"));
function createConnectionOptions() {
    return {
        host: process_1.default.env.DB_HOST || 'localhost',
        port: process_1.default.env.DB_PORT ? parseInt(process_1.default.env.DB_PORT) : 5432,
        dbName: process_1.default.env.DB_NAME || 'postgres',
        user: process_1.default.env.DB_USER || 'postgres',
        password: process_1.default.env.DB_PASS || 'postgres',
    };
}
exports.createConnectionOptions = createConnectionOptions;
//# sourceMappingURL=connectionOptions.js.map