import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { OwnerCannotLeaveCommunityError, ResourceNotFoundError } from "../errors"
import { CommunityMember } from "../models/CommunityMember"
import { UserService } from "./UserService"

describe('UserService tests', () => {

    let dataSource: DataSource
    let userService: UserService
    
    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            userService = new UserService(ds)
            done()
        })
    })

    it('allows to get user by id', async () => {
        const user = await userService.getUserById(1)
        expect(user).toBeTruthy()
        expect(user.id).toBe(1)
        expect(user.username).toBe('maciek')
    })

    it('throws when attempting to delete non existing user', async () => {
        await expect(userService.removeUser(999)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to remove user', async () => {
        await userService.removeUser(3)
        await expect(userService.getUserById(3)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to change users username', async () => {
        const ogUser = await userService.getUserById(1)
        expect(ogUser).toBeTruthy()
        await userService.modifyUser(1, {username: 'marcinek'})

        const modUser = await userService.getUserById(1)
        expect(ogUser).toBeTruthy()
        expect(ogUser!.username === modUser!.username).toBe(false)
    })

    it('allows user to leave the community', async () => {
        await userService.leaveCommunity(1, 1)

        const member = await dataSource.manager.findOneBy(CommunityMember, {
            userId: 1,
            communityId: 1
        })

        expect(member).toBeNull()
    })

    it('disallows user to leave the community he isnt in', async () => {
        await expect(userService.leaveCommunity(4, 1)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows user to leave a guild as a member', async () => {
        await userService.leaveCommunity(2, 1)

        const x = (await (await userService.getUserById(2)).communities).map(c=>c.id)
        expect(x.includes(1)).toBe(false)
    })

    it('disallows user to leave a guild as owner', async () => {
        await expect(userService.leaveCommunity(3, 1)).rejects.toThrowError(OwnerCannotLeaveCommunityError)

        const x = (await (await userService.getUserById(3)).communities).map(c=>c.id)
        expect(x.includes(1)).toBe(true)
    })
})
