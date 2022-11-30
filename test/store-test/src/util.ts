import {EntityManager, FlushMode, MikroORM} from '@mikro-orm/core'
import {createOrmConfig} from '@subsquid/mikroorm-config'
import {Store} from '@subsquid/mikroorm-store'
import {assertNotNull} from '@subsquid/util-internal'
import {Client as PgClient, ClientBase} from 'pg'

export const db_config = {
    host: 'localhost',
    port: parseInt(assertNotNull(process.env.DB_PORT)),
    user: assertNotNull(process.env.DB_USER),
    password: assertNotNull(process.env.DB_PASS),
    database: assertNotNull(process.env.DB_NAME),
}

async function withClient(block: (client: ClientBase) => Promise<void>): Promise<void> {
    let client = new PgClient(db_config)
    await client.connect()
    try {
        await block(client)
    } finally {
        await client.end()
    }
}

export function databaseInit(sql: string[]): Promise<void> {
    return withClient(async (client) => {
        for (let i = 0; i < sql.length; i++) {
            await client.query(sql[i])
        }
    })
}

export function databaseDelete(): Promise<void> {
    return withClient(async (client) => {
        await client.query(`DROP SCHEMA IF EXISTS root CASCADE`)
        await client.query(`CREATE SCHEMA root`)
    })
}

export function useDatabase(sql: string[]): void {
    beforeEach(async () => {
        await databaseDelete()
        await databaseInit(sql)
    })
}

let connection: Promise<MikroORM> | undefined

export function getEntityManager(): Promise<EntityManager> {
    if (connection == null) {
        let cfg = createOrmConfig()
        connection = MikroORM.init({...cfg, debug: ['query'], flushMode: FlushMode.AUTO})
    }
    return connection.then((con) => con.em.fork())
}

export async function createStore(): Promise<Store> {
    let em = await getEntityManager()
    return new Store(() => em)
}
