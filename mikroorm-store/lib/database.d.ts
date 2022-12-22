import { MikroORM, IsolationLevel, EntityManager } from '@mikro-orm/core';
import { Store } from './store';
export interface DatabaseOptions {
    stateSchema?: string;
    isolationLevel?: IsolationLevel;
}
export declare class MikroormDatabase {
    protected statusSchema: string;
    protected isolationLevel: IsolationLevel;
    protected orm?: MikroORM;
    protected lastCommitted: number;
    constructor(options?: DatabaseOptions);
    connect(): Promise<number>;
    close(): Promise<void>;
    transact(from: number, to: number, cb: (store: Store) => Promise<void>): Promise<void>;
    protected updateHeight(em: EntityManager, from: number, to: number): Promise<void>;
    protected runTransaction(from: number, to: number, cb: (store: Store) => Promise<void>): Promise<void>;
    private createTx;
    advance(height: number): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map