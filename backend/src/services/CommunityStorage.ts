import { DataSource } from "typeorm";
import { Community } from "../models/Community";
import { CommunityMember } from "../models/CommunityMember";
import { User } from "../models/User";

export class CommunityStorage {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getById(communityId: number): Promise<Community | null> {
        return await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
    }

    public async getByUserId(userId: number): Promise<Community[]> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new Error()
        return await user.communities
    }

    public async save(community: Community): Promise<Community> {
        return await this.dataSource.manager.save(community)
    }

    public async saveNew(community: Community): Promise<Community> {
        return await this.dataSource.transaction(async transaction => {
            const savedCommunity = await transaction.save(community)
            const comMember = new CommunityMember()
            comMember.userId = savedCommunity.ownerId
            comMember.communityId = savedCommunity.id
            await transaction.save(comMember)
            return savedCommunity
        })
    }

    public async remove(communityId: number): Promise<void> {
        await this.dataSource.manager.delete(Community, {
            id: communityId
        })
    }

    public async removeMember(userId: number, communityId: number) {
        await this.dataSource.manager.delete(CommunityMember, {
            userId,
            communityId
        })
    }
}