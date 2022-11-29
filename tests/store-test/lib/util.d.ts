import { EntityManager } from '@mikro-orm/core';
import { Store } from '@subsquid/mikroorm-store';
export declare const db_config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};
export declare function databaseInit(sql: string[]): Promise<void>;
export declare function databaseDelete(): Promise<void>;
export declare function useDatabase(sql: string[]): void;
export declare function getEntityManager(): Promise<EntityManager>;
export declare function createStore(): Promise<Store>;
//# sourceMappingURL=util.d.ts.map