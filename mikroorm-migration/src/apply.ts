import {MikroORM} from '@mikro-orm/core'
import {createOrmConfig, MIGRATIONS_DIR} from '@subsquid/mikroorm-config'
import {runProgram} from '@subsquid/util-internal'
import {program} from 'commander'
import * as dotenv from 'dotenv'

runProgram(async () => {
    program.description('Apply pending migrations').parse()

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
        await orm.migrator.up()
    } finally {
        await orm.close().catch(() => null)
    }
})
