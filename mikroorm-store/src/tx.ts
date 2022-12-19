import type {EntityManager, IsolationLevel} from '@mikro-orm/core'

export interface Tx {
    em: EntityManager
    commit(): Promise<void>
    rollback(): Promise<void>
}

export function createTransaction(con: EntityManager, isolationLevel: IsolationLevel): Promise<Tx> {
    return new Promise((resolve, reject) => {
        let done: Promise<void> = con.transactional(
            (em) => {
                return new Promise((commit, rollback) => {
                    resolve({
                        em,
                        commit() {
                            commit()
                            return done
                        },
                        rollback() {
                            rollback(ROLLBACK_ERROR)
                            return done.catch((err) => {
                                if (err !== ROLLBACK_ERROR) {
                                    throw err
                                }
                            })
                        },
                    })
                })
            },
            {
                isolationLevel,
            }
        )
        done.catch((err) => {
            if (err !== ROLLBACK_ERROR) {
                reject(err)
            }
        })
    })
}

const ROLLBACK_ERROR = new Error('rollback')
