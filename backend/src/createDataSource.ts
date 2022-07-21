import { DataSource } from "typeorm";

export const createDataSource = async (): Promise<DataSource> => {
    /*
    const dataSource = new DataSource({
        entities: ['src/models/*.ts'],
        type: 'mariadb',
        host: '192.168.56.10',
        port: 3306,
        username: 'gigauser',
        password: undefined,
        database: 'media_sharing_service'
    })
    */

    const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: ['src/models/*.ts']
    })

    await dataSource.initialize()
    
    await dataSource.synchronize(true)

    return dataSource
}

export const createTestDataSource = async (): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: ['src/models/*.ts']
    })

    await dataSource.initialize()
    
    await dataSource.synchronize(true)

    return dataSource
}