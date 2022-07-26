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
        expect(user.id).toBe(1)
        expect(user.username).toBe('maciek')
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
        expect(ogUser).toBeTruthy()
        await userService.modifyUser(1, {username: 'marcinek'})

        const modUser = await userService.getUserById(1)
        expect(ogUser).toBeTruthy()
        expect(ogUser!.username === modUser!.username).toBe(false)
    })

    it('allows to remove user connection', async () => {
        const userService = await thereIsUserService()

        await userService.removeConnection(2, 'github')

        const connections = await userService.getUserConnections(2)
        expect(connections.length).toBe(1)
    })

    it('disallows to remove last user connection', async () => {
        const userService = await thereIsUserService()

        expect(userService.removeConnection(1, 'discord')).rejects.toEqual(new CannotRemoveLastUserConnectionError())

        const connections = await userService.getUserConnections(1)
        expect(connections.length).toBe(1)
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
    const userService = new UserService({userStorage})
    return userService
}