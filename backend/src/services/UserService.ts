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

    public async getUserConnections(userId: number): Promise<UserConnection[]> {
        const connections = await this.dataSource.manager.findBy(UserConnection, {
            userId
        })
        if (connections.length === 0) throw new ResourceNotFoundError()
        return connections
    }

    public async removeUser(userId: number): Promise<void> {
        const delResult = await this.dataSource.manager.delete(User, {
            id: userId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }

    public async removeConnection(userId: number, type: UserConnectionType): Promise<void> {
        const connections = await this.dataSource.manager.findBy(UserConnection, {
            userId
        })

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()
        
        await this.dataSource.manager.delete(UserConnection, {
            userId,
            type
        })
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()

        if (username) user.username = username
        
        return await this.dataSource.manager.save(user)
    }

    public async joinCommunity(userId: number, inviteId: string): Promise<void> {
        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            this.dataSource.manager.delete(CommunityInvite, {
                id: inviteId
            }).catch(e=>e)
            throw new ResourceNotFoundError()
        }

        const isMember = !!(await this.dataSource.manager.findOneBy(CommunityMember, {
            userId,
            communityId: invite.communityId
        }))

        if (isMember) throw new AlreadyAMemberError()

        invite.uses++

        const member = new CommunityMember()
        member.communityId = invite.communityId
        member.userId = userId

        await this.dataSource.transaction(async (transaction) => {
            await transaction.save(member)

            if (invite.maxUses !== null && invite.uses>=invite.maxUses!) {
                await transaction.delete(CommunityInvite, {
                    id: inviteId
                })
            } else {
                await transaction.save(invite)
            }
        })
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

    public async getUserCommunities(userId: number): Promise<Community[]> {
        const user = await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
        if (!user) throw new ResourceNotFoundError()
        return await user.communities
    }
}