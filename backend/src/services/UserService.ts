import { AlreadyAMemberError, CannotRemoveLastUserConnectionError, OwnerCannotLeaveCommunityError } from "../errors";
import { User } from "../models/User";
import { Community } from "../models/Community";
import { UserConnection } from "../models/UserConnection";
import { UserConnectionType } from "../types";
import { ResourceNotFoundError } from "../errors"
import { CommunityMember } from "../models/CommunityMember";
import { DataSource } from "typeorm";
import { CommunityInvite } from "../models/CommunityInvite";

export class UserService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getUserById(userId: number): Promise<User> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()
        return user
    }

    public async removeUser(userId: number): Promise<void> {
        const delResult = await this.dataSource.manager.delete(User, {
            id: userId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()

        if (username) user.username = username
        
        return await this.dataSource.manager.save(user)
    }

    public async leaveCommunity(userId: number, communityId: number): Promise<void> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        if (community.ownerId === userId) throw new OwnerCannotLeaveCommunityError()

        const delResult = await this.dataSource.manager.delete(CommunityMember, {
            userId,
            communityId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }
}