import { ResourceNotFoundError } from "../errors";
import { Community } from "../models/Community"
import { CommunityInvite } from "../models/CommunityInvite";
import { DataSource } from "typeorm";
import { CommunityMember } from "../models/CommunityMember";

export class CommunityService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getCommunityById(communityId: number): Promise<Community> {
        const com = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!com) throw new ResourceNotFoundError()
        return com
    }

    public async getUserCommunities(userId: number): Promise<Community[]> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()
        return await user.communities
    }

    public async createCommunity(ownerId: number, name: string): Promise<Community> {
        return await this.dataSource.transaction(async transaction => {
            const com = new Community()
            com.ownerId = ownerId
            com.name = name
            const savedCommunity = await transaction.save(com)

            const comMember = new CommunityMember()
            comMember.userId = savedCommunity.ownerId
            comMember.communityId = savedCommunity.id
            await transaction.save(comMember)
            
            return savedCommunity
        })
    }
}