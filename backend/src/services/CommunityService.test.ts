import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { ResourceNotFoundError } from "../errors"
import { CommunityMember } from "../models/CommunityMember"
import { CommunityService } from "./CommunityService"

describe('CommunityService tests', () => {

    let dataSource: DataSource
    let communityService: CommunityService
    
    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            communityService = new CommunityService(dataSource)
            done()
        })
    })

    it('allows to get community by id', async () => {
        const community = await communityService.getCommunityById(1)
        expect(community.id).toBe(1)
    })

    it('disallows to get a community that doesnt exist', async () => {
        await expect(communityService.getCommunityById(999)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to create community', async () => {
        const community = await communityService.createCommunity(4, 'gigacommunity')

        const members = await dataSource.manager.findBy(CommunityMember, {
            communityId: community.id,
            userId: 4
        })

        expect(members.length).toBe(1)
        expect(community.ownerId).toBe(4)
    })

    it('allows to get user communities', async () => {
        const communities = await communityService.getUserCommunities(1)

        expect(communities.length).toBe(2)
    })
})
