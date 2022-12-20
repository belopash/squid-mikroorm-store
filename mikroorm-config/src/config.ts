import process from 'process'
import path from 'path'
import {UnderscoreNamingStrategy} from '@mikro-orm/core'
import {createConnectionOptions} from './connectionOptions'
import {PostgreSqlDriver, Options} from '@mikro-orm/postgresql'

export interface OrmOptions {
    projectDir?: string
}

export const MIGRATIONS_DIR = 'db/migrations'

export function createOrmConfig(options?: OrmOptions): Options {
    let dir = path.resolve(options?.projectDir || process.cwd())
    let model = resolveModel(path.join(dir, 'lib/model/models.js'))
    let migrationsDir = path.join(dir, MIGRATIONS_DIR)
    return {
        driver: PostgreSqlDriver,
        namingStrategy: UnderscoreNamingStrategy,
        entities: [model],
        migrations: {path: migrationsDir},
        ...createConnectionOptions(),
        useBatchInserts: true,
        useBatchUpdates: true,
        schemaGenerator: {
            ignoreSchema: ['squid_status', 'squid_processor'],
        },
    }
}

function resolveModel(model: string): string {
    model = path.resolve(model || 'lib/model/models.js')
    try {
        return require.resolve(model)
    } catch (e: any) {
        throw new Error(`Failed to resolve model ${model}. Did you forget to run codegen or compile the code?`)
    }
}
