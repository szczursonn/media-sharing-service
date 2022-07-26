import { createTestDataSource } from "../createDataSource"
import { User } from "../models/User"
import { UserConnection } from "../models/UserConnection"
import { UserConnectionType } from "../types"
import { UserStorage } from "./UserStorage"

describe('UserStorage tests', () => {
    it('allows to save a new user and load him', async () => {
        const username = 'maciek'
        const userStorage = await thereIsUserStorage()
        const user = await userStorage.save(thereIsUser(username))

        expect(user.id).toBeDefined()
        expect(user.username).toBe(username)
    })

    it('allows to save a new user with connection', async () => {
        const userStorage = await thereIsUserStorage()
        const user = thereIsUser('mario')
        const con = thereIsConnection('discord')
        const savedUser = await userStorage.saveWithConnection(user, con)

        const connections = await userStorage.getConnectionsByUserId(savedUser.id)

        expect(connections.length).toBe(1)
    })

    it('allows to remove a connection', async () => {

        await userStorage.removeConnection(3, 'github')
        
        const connections = await UserStorage.getConnectionsByUserId(3)
        expect(connections.length).toBe(2)
        expect(connections.find(c=>c.type==='github')).toBe(undefined)
    })

    it('allows to get user by connection', async () => {
        const user = await userStorage.getByConnection('maciusgamer#2022', 'discord')
        expect(user).toBeTruthy()
        expect(user.id).toBe(1)
        
    })

    it('allows to add multiple connections to user', async () => {
        const userStorage = await thereIsUserStorage()
        const user = await userStorage.save(thereIsUser('mario'))
        const con1 = thereIsConnection('discord')
        con1.userId = user.id
        const con2 = thereIsConnection('google')
        con2.userId = user.id
        await userStorage.saveConnection(con1)
        await userStorage.saveConnection(con2)

        const connections = await userStorage.getConnectionsByUserId(user.id)
        expect(connections.length).toBe(2)
    })
})

const thereIsUserStorage = async () => {
    const dataSource = await createTestDataSource()
    return new UserStorage(dataSource)
}

const thereIsUser = (username: string) => {
    const user = new User()
    user.username = username
    return user
}

const thereIsConnection = (type: UserConnectionType, foreignId?: string) => {
    if (!foreignId) foreignId = (Math.random()*10000).toString().split('.')[0]
    const con = new UserConnection()
    con.foreignId = foreignId
    con.type = type
    con.foreignUsername = `usr-${type}-${con.foreignId}`
    return con
}