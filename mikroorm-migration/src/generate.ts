import {MikroORM, t} from '@mikro-orm/core'
import {createOrmConfig, MIGRATIONS_DIR} from '@subsquid/mikroorm-config'
import {runProgram} from '@subsquid/util-internal'
import {Output} from '@subsquid/util-internal-code-printer'
import {program} from 'commander'
import {MigrationGenerator} from '@mikro-orm/migrations'
import * as dotenv from 'dotenv'

class SquidMigrationGenerator extends MigrationGenerator {
    generateMigrationFile(name: string, commands: {up: string[]; down: string[]}): string {
        let timestamp = Date.now()
        let out = new Output()
        out.block(`module.exports = class ${name}${timestamp}`, () => {
            out.line(`name = '${name}${timestamp}'`)
            out.line()
            out.block(`async up(db)`, () => {
                commands.up.forEach((q) => {
                    if (q.length > 0) out.line(`await db.query('${q}')`)
                })
            })
            out.line()
            out.block(`async down(db)`, () => {
                commands.down.forEach((q) => {
                    if (q.length > 0) out.line(`await db.query('${q}')`)
                })
            })
        })
        return out.toString()
    }
}

runProgram(async () => {
    program.description('Analyze the current database state and generate migration to match the target schema')
    program.option('-n, --name <name>', 'name suffix for new migration', 'Data')

    let {name} = program.parse().opts() as {name: string}

    dotenv.config()

    let orm = await MikroORM.init({
        ...createOrmConfig(),
        migrations: {
            tableName: 'migrations',
            path: MIGRATIONS_DIR,
            snapshot: false,
            emit: 'js',
            // fileName: (timestamp: string) => (name || 'Data') + timestamp,
        },
    })

    try {
        await orm.migrator.createMigration()
    } finally {
        await orm.close().catch(() => null)
    }
})
