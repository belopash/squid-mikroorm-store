"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = void 0;
function createTransaction(con, isolationLevel) {
    return new Promise((resolve, reject) => {
        let done = con.transactional((em) => {
            return new Promise((commit, rollback) => {
                resolve({
                    em,
                    commit() {
                        commit();
                        return done;
                    },
                    rollback() {
                        rollback(ROLLBACK_ERROR);
                        return done.catch((err) => {
                            if (err !== ROLLBACK_ERROR) {
                                throw err;
                            }
                        });
                    },
                });
            });
        }, {
            isolationLevel,
        });
        done.catch((err) => {
            if (err !== ROLLBACK_ERROR) {
                reject(err);
            }
        });
    });
}
exports.createTransaction = createTransaction;
const ROLLBACK_ERROR = new Error('rollback');
//# sourceMappingURL=tx.js.map