import { Options } from '@mikro-orm/postgresql';
export interface OrmOptions {
    projectDir?: string;
}
export declare const MIGRATIONS_DIR = "db/migrations";
export declare function createOrmConfig(options?: OrmOptions): Options;
//# sourceMappingURL=config.d.ts.map