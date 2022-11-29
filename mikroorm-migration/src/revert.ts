import {MikroORM} from "@mikro-orm/core"
import {createOrmConfig, MIGRATIONS_DIR} from "@subsquid/mikroorm-config"
import {runProgram} from "@subsquid/util-internal"
import {program} from "commander"
import * as dotenv from "dotenv"


runProgram(async () => {
    program.description('Revert the last applied migration').parse()

    dotenv.config()

    let orm = await MikroORM.init({
        ...createOrmConfig(),
        migrations: {
            tableName: 'migrations',
            path: MIGRATIONS_DIR,
            transactional: true,
        },
        debug: ['query', 'schema', 'info'],
    })

    try {
        await orm.migrator.down()
    } finally {
        await orm.close().catch(() => null)
    }
})
