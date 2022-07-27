import { createTestDataSource } from "../createDataSource"
import { AlreadyAMemberError, CannotRemoveLastUserConnectionError, OwnerCannotLeaveCommunityError, ResourceNotFoundError } from "../errors"
import { UserService } from "./UserService"

describe('UserService tests', () => {
    it('allows to get user by id', async () => {
        const userService = await thereIsUserService()

        const user = await userService.getUserById(1)
        expect(user).toBeTruthy()
        expect(user.id).toBe(1)
        expect(user.username).toBe('maciek')
    })

    it('throws when attempting to delete non existing user', async () => {
        const userService = await thereIsUserService()

        await expect(userService.removeUser(999)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to remove user', async () => {
        const userService = await thereIsUserService()

        await userService.removeUser(3)
        await expect(userService.getUserById(3)).rejects.toThrowError(ResourceNotFoundError)
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

        await expect(userService.removeConnection(1, 'discord')).rejects.toThrowError(CannotRemoveLastUserConnectionError)

        const connections = await userService.getUserConnections(1)
        expect(connections.length).toBe(1)
    })

    it('allows to get user connections', async () => {
        const userService = await thereIsUserService()

        const connections1 = await userService.getUserConnections(1)
        const connections2 = await userService.getUserConnections(2)

        expect(connections1.length).toBe(1)
        expect(connections2.length).toBe(2)
    })

    it('allows to get user communities', async () => {
        const userService = await thereIsUserService()

        const communities = await userService.getUserCommunities(1)

        expect(communities.length).toBe(2)
    })

    it('allows user to leave the community', async () => {
        const userService = await thereIsUserService()

        await userService.leaveCommunity(1, 1)

        const communities = await userService.getUserCommunities(1)

        expect(communities.map(c=>c.id).includes(1)).toBe(false)

    })

    it('disallows user to leave the community he isnt in', async () => {
        const userService = await thereIsUserService()

        await expect(userService.leaveCommunity(4, 1)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows user to join community', async () => {
        const userService = await thereIsUserService()

        await userService.joinCommunity(4, 'abc')

        const x = (await (await userService.getUserById(4)!).communities).map(c=>c.id)
        expect(x.includes(2)).toBe(true)
    })

    it('disallows user to use expired invite', async () => {
        const userService = await thereIsUserService()

        await expect(userService.joinCommunity(4, 'aaa')).rejects.toThrowError(ResourceNotFoundError)
    })

    it('disallows user to use overused invite', async () => {
        const userService = await thereIsUserService()

        await userService.joinCommunity(4, 'abc')

        await expect(userService.joinCommunity(3, 'abc')).rejects.toThrowError(ResourceNotFoundError)
    })

    it('disallows user to join a community he is already in', async () => {
        const userService = await thereIsUserService()

        await expect(userService.joinCommunity(1, 'abc')).rejects.toThrowError(AlreadyAMemberError)
    })

    it('allows user to leave a guild as a member', async () => {
        const userService = await thereIsUserService()

        await userService.leaveCommunity(2, 1)

        const x = (await (await userService.getUserById(2)).communities).map(c=>c.id)
        expect(x.includes(1)).toBe(false)
    })

    it('disallows user to leave a guild as owner', async () => {
        const userService = await thereIsUserService()

        await expect(userService.leaveCommunity(3, 1)).rejects.toThrowError(OwnerCannotLeaveCommunityError)

        const x = (await (await userService.getUserById(3)).communities).map(c=>c.id)
        expect(x.includes(1)).toBe(true)
    })
})

const thereIsUserService = async () => {
    const dataSource = await createTestDataSource()
    const userService = new UserService(dataSource)
    return userService
}