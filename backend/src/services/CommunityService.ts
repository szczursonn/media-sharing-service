import { InsufficientPermissionsError, MissingAccessError, OwnerCannotLeaveCommunityError, ResourceNotFoundError } from "../errors";
import { Community } from "../models/Community"
import { DataSource } from "typeorm";
import { CommunityMember } from "../models/CommunityMember";
import { User } from "../models/User";
import { CommunityMemberPublic, CommunityPublic } from "../types";

export class CommunityService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getCommunityById(communityId: number, requesterId: number): Promise<CommunityPublic> {
        const com = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!com) throw new ResourceNotFoundError()
        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: requesterId,
            communityId
        })
        if (!member) throw new MissingAccessError()
        return com.public()
    }

    public async getUserCommunities(userId: number): Promise<CommunityPublic[]> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()

        const communities = await user.communities

        return communities.map(c=>c.public())
    }

    public async getCommunityMembers(communityId: number, getterId: number): Promise<CommunityMemberPublic[]> {
        const members = await this.dataSource.manager.findBy(CommunityMember, {
            communityId
        })
        if (!members.map(m=>m.userId).includes(getterId)) throw new MissingAccessError()
        
        // TODO: better query

        const mem = await Promise.all(members.map(m=>m.public()))

        return mem
    }

    public async kickUser(communityId: number, userId: number, kickerId: number): Promise<void> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            communityId,
            userId: kickerId
        })
        if (!member) throw new MissingAccessError()
        // only the owner can kick users
        if (community.ownerId !== kickerId) throw new InsufficientPermissionsError()
        if (userId === community.ownerId) throw new OwnerCannotLeaveCommunityError()

        const delResult = await this.dataSource.manager.delete(CommunityMember, {
            userId,
            communityId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }

    public async createCommunity(ownerId: number, name: string): Promise<CommunityPublic> {
        return await this.dataSource.transaction(async transaction => {
            const com = new Community()
            com.ownerId = ownerId
            com.name = name
            const savedCommunity = await transaction.save(com)

            const comMember = new CommunityMember()
            comMember.userId = savedCommunity.ownerId
            comMember.communityId = savedCommunity.id
            comMember.canUpload = true
            await transaction.save(comMember)
            
            return savedCommunity.public()
        })
    }

    public async deleteCommunity(communityId: number, deleterId: number): Promise<void> {

        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()

        if (community.ownerId !== deleterId) throw new InsufficientPermissionsError()

        const delResult = await this.dataSource.manager.delete(Community, {
            id: communityId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }
}