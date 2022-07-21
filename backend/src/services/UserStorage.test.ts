import { createDataSource } from "../createDataSource"
import { User } from "../models/User"
import { UserConnection, UserConnectionType } from "../models/UserConnection"
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
        const con = thereIsConnection()
        const savedUser = await userStorage.saveWithConnection(user, con)

        const connections = await savedUser.connections

        expect(connections.length).toBe(1)
    })

    it('allows to remove a connection', async () => {
        const type = UserConnectionType.Discord

        const userStorage = await thereIsUserStorage()
        const user = await userStorage.saveWithConnection(
            thereIsUser('mario'), 
            thereIsConnection(type)
        )

        await userStorage.removeConnection(user.id, type)

        const user2 = await userStorage.getById(user.id)
        const connections = await user2!.connections
        expect(connections.length).toBe(0)
    })

    it('allows to get user by connection', async () => {
        const foreignId = '34242343'
        const type = UserConnectionType.Discord

        const userStorage = await thereIsUserStorage()
        await userStorage.saveWithConnection(
            thereIsUser('mario'), 
            thereIsConnection(type, foreignId)
        )

        const user = await userStorage.getByConnection(foreignId, type)
        expect(user).toBeTruthy()
        
    })

    it('allows to add multiple connections to user', async () => {
        const userStorage = await thereIsUserStorage()
        const user = await userStorage.save(thereIsUser('mario'))
        const con1 = thereIsConnection(UserConnectionType.Discord)
        con1.userId = user.id
        const con2 = thereIsConnection(UserConnectionType.Google)
        con2.userId = user.id
        await userStorage.saveConnection(con1)
        await userStorage.saveConnection(con2)

        const connections = await (await userStorage.getById(user.id))!.connections
        expect(connections.length).toBe(2)
    })
})

const thereIsUserStorage = async () => {
    const dataSource = await createDataSource()
    return new UserStorage(dataSource)
}

const thereIsUser = (username: string) => {
    const user = new User()
    user.username = username
    return user
}

const thereIsConnection = (type?: UserConnectionType, foreignId?: string) => {
    if (!type) type = UserConnectionType.Discord
    if (!foreignId) foreignId = (Math.random()*10000).toString().split('.')[0]
    const con = new UserConnection()
    con.foreignId = foreignId
    con.type = type
    con.foreignUsername = `usr-${type}-${con.foreignId}`
    return con
}