import { createTestDataSource } from "../createDataSource"
import { CannotRemoveLastUserConnectionError } from "../errors"
import { User } from "../models/User"
import { UserConnection } from "../models/UserConnection"
import { UserService } from "./UserService"
import { UserStorage } from "./UserStorage"

describe('UserService tests', () => {
    it('allows to get user by id', async () => {
        const userService = await thereIsUserService()

        const user = await userService.getUserById(1)
        expect(user).toBeTruthy()
    })

    it('allows to remove user', async () => {
        const userService = await thereIsUserService()

        await userService.removeUser(1)
        const user = await userService.getUserById(1)

        expect(user).toBe(null)
    })

    it('allows to change users username', async () => {
        const userService = await thereIsUserService()

        const ogUser = await userService.getUserById(1)
        await userService.modifyUser(1, {username: 'marcinek'})

        const modUser = await userService.getUserById(1)

        expect(ogUser!.username === modUser!.username).toBe(false)
    })

    it('allows to remove user connection', async () => {
        const userService = await thereIsUserService()

        await userService.removeConnection(1, 'discord')

        const connections = await userService.getUserConnections(1)
        expect(connections.length).toBe(1)
    })

    it('disallows to remove last user connection', async () => {
        const userService = await thereIsUserService()

        expect(userService.removeConnection(2, 'google')).rejects.toEqual(new CannotRemoveLastUserConnectionError())

        const connections = await userService.getUserConnections(1)
        expect(connections.length).toBe(2)
    })

    it('allows to get user connections', async () => {
        const userService = await thereIsUserService()

        const connections = await userService.getUserConnections(1)

        expect(connections.length).toBe(2)
    })
})

const thereIsUserService = async () => {
    const dataSource = await createTestDataSource()
    const userStorage = new UserStorage(dataSource)

    const user1 = new User()
    user1.id = 1
    user1.username = 'mario'
    await userStorage.save(user1)

    const con1 = new UserConnection()
    con1.foreignId = 'adsadsa'
    con1.foreignUsername = 'gfdugfd'
    con1.type = 'discord'
    con1.userId = 1
    await userStorage.saveConnection(con1)

    const con2 = new UserConnection()
    con2.foreignId = 'fdsfds'
    con2.foreignUsername = 'dsadsa'
    con2.type = 'github'
    con2.userId = 1
    await userStorage.saveConnection(con2)

    const user2 = new User()
    user2.id = 2
    user2.username = 'maciek'
    user2.avatarUrl = 'https://aaaaaaa.com'
    const con3 = new UserConnection()
    con3.foreignId = 'dsadas'
    con3.foreignUsername = 'aaaaaaaaaaaa'
    con3.type = 'google'
    await userStorage.saveWithConnection(user2, con3)

    const userService = new UserService({userStorage})
    return userService
}