import { createTestDataSource } from "../createDataSource"
import { ResourceNotFoundError } from "../errors"
import { CommunityService } from "./CommunityService"

describe('CommunityService tests', () => {
    it('allows to get community by id', async () => {
        const communityService = await thereIsCommunityService()

        const community = await communityService.getCommunityById(1)
        expect(community.id).toBe(1)
    })

    it('disallows to get a community that doesnt exist', async () => {
        const communityService = await thereIsCommunityService()

        await expect(communityService.getCommunityById(999)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to create community', async () => {
        const communityService = await thereIsCommunityService()
        const community = await communityService.createCommunity(4, 'gigacommunity')

        const users = await community.users

        expect(users.length).toBe(1)
        expect(community.ownerId).toBe(4)
    })
})

const thereIsCommunityService = async () => {
    const dataSource = await createTestDataSource()
    const communityService = new CommunityService(dataSource)
    return communityService
}