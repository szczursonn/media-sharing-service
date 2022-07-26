import { DataSource } from "typeorm";
import { Session } from "./models/Session";
import { User } from "./models/User";
import { UserConnection } from "./models/UserConnection";
import { Community } from "./models/Community";
import { UserConnectionType } from "./types";
import { CommunityMember } from "./models/CommunityMember";

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

export const createTestDataSource = async (useMockData: boolean = true): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: ['src/models/*.ts']
    })

    await dataSource.initialize()
    
    await dataSource.synchronize(true)

    if (useMockData) await insertMockData(dataSource)

    return dataSource
}

/**
 * MOCK DATA
 * !!! UserConnection.foreignUsername = `foreignuser-${type}-${foreignId}`
 * 
 * /// User with 1 connection, 1 session, owner of 1 community, member of 2
 * - User id: 1, username: 'maciek'
 * -- UserConnection foreignId: 'maciusgamer#2022', type: 'discord'
 * -- Session id: 1
 * /// User with 2 connections, 0 sessions, owner of 0 communities, member of 1
 * - User id: 2, username: 'mario'
 * -- UserConnection foreignId: 'marianczello007', type: 'github'
 * -- UserConnection foreignId: 'abcxd1', type: 'google'
 * /// User with 3 connections, 2 sessions, owner of 1 community, member of 1
 * - User id: 3, username: 'robson'
 * -- UserConnection foreignId: 'rozkminka#1850', type: 'discord'
 * -- UserConnection foreignId: 'robsonfirmasztos', type: 'github'
 * -- UserConnection foreignId: 'goblinek666', type: 'google'
 * -- Session id: 4
 * -- Session id: 5
 * /// User with 1 connection, 1 session, member of 0 communities
 * - User id: 4, username: 'afro'
 * -- UserConnection foreignId: 'afro#1234', type: 'discord'
 * -- Session id: 3
 * 
 * // Community with 3 members
 * - Community id: 1, ownerId: 3, name: 'firma sztos official'
 * -- Member userId: 1
 * -- Member userId: 2
 * -- Member userId: 3
 * /// Community with only the owner
 * - Community id: 2, ownerId: 1, name: 'csgopolskapl.pl'
 * -- Member userId: 1
 */

const insertMockData = async (dataSource: DataSource) => {

    const m = dataSource.manager

    const user = async (userId: number, username: string, avatarUrl?: string) => {
        const u = new User()
        u.id = userId
        u.username = username
        u.avatarUrl = avatarUrl
        return await m.save(u)
    }

    const con = async (userId: number, foreignId: string, type: UserConnectionType) => {
        const c = new UserConnection()
        c.userId = userId
        c.foreignId = foreignId
        c.type = type
        c.foreignUsername = `foreignuser-${type}-${foreignId}`
        return await m.save(c)
    }

    const session = async (userId: number, sessionId: number) => {
        const s = new Session()
        s.userId = userId
        s.id = sessionId
        return await m.save(s)
    }

    const comm = async (communityId: number, ownerId: number, name: string) => {
        const c = new Community()
        c.id = communityId
        c.ownerId = ownerId
        c.name = name
        return await m.save(c)
    }

    const member = async (communityId: number, userId: number) => {
        const x = new CommunityMember()
        x.communityId = communityId
        x.userId = userId
        return await m.save(x)
    }

    await user(1, 'maciek')
    await con(1, 'maciusgamer#2022', 'discord')
    await session(1, 1)

    await user(2, 'mario')
    await con(2, 'marianczello007', 'github')
    await con(2, 'abcxd1', 'google')
    await session(2, 4)
    await session(2, 5)

    await user(3, 'robson')
    await con(3, 'rozkminka#1850', 'discord')
    await con(3, 'robsonfirmasztos', 'github')
    await con(3, 'goblinek666', 'google')

    await user(4, 'afro')
    await con(4, 'afro#1234', 'discord')
    await session(4, 3)

    await comm(1, 3, 'firma sztos official')
    await member(1, 3)
    await member(1, 2)
    await member(1, 1)

    await comm(2, 1, 'csgopolskapl.pl')
    await member(2, 1)
}

