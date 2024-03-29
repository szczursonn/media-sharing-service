import { DataSource } from "typeorm";
import { Session } from "./models/Session";
import { User } from "./models/User";
import { UserConnection } from "./models/UserConnection";
import { Community } from "./models/Community";
import { UserConnectionType } from "./types";
import { CommunityMember } from "./models/CommunityMember";
import { CommunityInvite } from "./models/CommunityInvite";
import { Album } from "./models/Album";
import { Media } from "./models/Media";

type MariaDbOptions = {
    type: 'mariadb'
    host: string
    port?: number
    username: string
    password?: string
    databaseName: string
}
type SqliteOptions = {
    type: 'sqlite'
    filename: string
}

export const createDataSource = async (dbOptions: MariaDbOptions|SqliteOptions, reset: boolean): Promise<DataSource> => {

    let dataSource: DataSource

    const entities = [Album, Community, CommunityInvite, CommunityMember, Media, Session, User, UserConnection]

    switch (dbOptions.type) {
        case 'sqlite':
            dataSource = new DataSource({
                entities,
                type: 'better-sqlite3',
                database: dbOptions.filename
            })
            break
        case 'mariadb':
            dataSource = new DataSource({
                entities,
                type: 'mariadb',
                database: dbOptions.databaseName,
                host: dbOptions.host,
                port: dbOptions.port,
                username: dbOptions.username,
                password: dbOptions.password
            })
    }

    await dataSource.initialize()
    
    await dataSource.synchronize(reset)

    return dataSource
}

export const createTestDataSource = async (useMockData: boolean = true): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: 'better-sqlite3',
        entities: ['src/models/*.ts'],
        database: ':memory:'
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
 * -- Session id: 4
 * -- Session id: 5
 * /// User with 3 connections, 2 sessions, owner of 1 community, member of 1
 * - User id: 3, username: 'robson'
 * -- UserConnection foreignId: 'rozkminka#1850', type: 'discord'
 * -- UserConnection foreignId: 'robsonfirmasztos', type: 'github'
 * -- UserConnection foreignId: 'goblinek666', type: 'google'
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
 * -- Invite id: 'aaa', inviterId: 3, maxUses: undefined, expiresAt: Date.now()-10000 (expired)
 * -- Invite id: 'bbb', inviterId: 3, maxUses: undefined, expiresAt: Date.now()+10000
 * -- Invite id: 'ccc', inviterId: 3, maxUses: 2, expiresAt: undefined
 * -- Album id: 5, name: 'gigaalbum'
 * /// Community with only the owner
 * - Community id: 2, ownerId: 1, name: 'csgopolskapl.pl'
 * -- Member userId: 1
 * -- Invite id: 'abc', inviterId: 1, maxUses: 1, expiresAt: null
 * -- Album id: 1, name: 'melanz1'
 * -- Album id: 2, name: 'melanz2'
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

    const member = async (communityId: number, userId: number, canUpload: boolean = false) => {
        const x = new CommunityMember()
        x.communityId = communityId
        x.userId = userId
        x.canUpload = canUpload
        return await m.save(x)
    }

    const invite = async (inviteId: string, communityId: number, inviterId: number, maxUses: number|undefined, expiresAt: Date|undefined) => {
        const i = new CommunityInvite()
        i.id=inviteId
        i.communityId=communityId
        i.inviterId=inviterId
        i.maxUses=maxUses
        i.expiresAt=expiresAt
        return m.save(i)
    }

    const album = async (albumId: number, name: string, communityId: number) => {
        const a = new Album()
        a.id = albumId
        a.name = name
        a.communityId = communityId

        return m.save(a)
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
    await member(1, 3, true)
    await member(1, 2)
    await member(1, 1)
    await invite('aaa', 1, 3, undefined, new Date(Date.now()-10000))
    await invite('bbb', 1, 3, undefined, new Date(Date.now()+10000))
    await invite('ccc', 1, 3, 2, undefined)
    await album(5, 'gigaalbum', 1)

    await comm(2, 1, 'csgopolskapl.pl')
    await member(2, 1, true)
    await invite('abc', 2, 1, 1, undefined)
    await album(1, 'melanz1', 2)
    await album(2, 'melanz2', 2)
}
