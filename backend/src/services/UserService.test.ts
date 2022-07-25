import { createTestDataSource } from "../createDataSource"
import { User } from "../models/User"
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
})

const thereIsUserService = async () => {
    const dataSource = await createTestDataSource()
    const userStorage = new UserStorage(dataSource)

    const user1 = new User()
    user1.id = 1
    user1.username = 'mario'
    await userStorage.save(user1)

    const user2 = new User()
    user2.id = 2
    user2.username = 'maciek'
    user2.avatarUrl = 'https://aaaaaaa.com'
    await userStorage.save(user2)

    const userService = new UserService({userStorage})
    return userService
}