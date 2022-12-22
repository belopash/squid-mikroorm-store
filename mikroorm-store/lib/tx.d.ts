import type { EntityManager, IsolationLevel } from '@mikro-orm/core';
export interface Tx {
    em: EntityManager;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export declare function createTransaction(con: EntityManager, isolationLevel: IsolationLevel): Promise<Tx>;
//# sourceMappingURL=tx.d.ts.map