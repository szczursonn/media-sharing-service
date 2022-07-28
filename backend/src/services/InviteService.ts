import { DataSource } from "typeorm";
import { ResourceNotFoundError, InsufficientPermissionsError, AlreadyAMemberError } from "../errors";
import { Community } from "../models/Community"
import { CommunityInvite } from "../models/CommunityInvite";
import { CommunityMember } from "../models/CommunityMember";
import { User } from "../models/User";
import nanoid from "nanoid";

export class InviteService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getInvite(inviteId: string) {
        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        const community = await invite.community
        const user = await this.dataSource.manager.findOneBy(User, {
            id: invite.inviterId
        })
        
        return {
            invite,
            community,
            user
        }
    }

    public async getCommunityInvites(communityId: number, getterId: number) {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        // only the owner can get invites
        if(community.ownerId !== getterId) throw new InsufficientPermissionsError()

        const invites = await community.invites

        return invites
    }

    public async createInvite(communityId: number, inviterId: number, validTime: number | null, maxUses: number | null): Promise<CommunityInvite> {

        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        // only the owner can create invites
        if (community.ownerId !== inviterId) throw new InsufficientPermissionsError()

        const inv = new CommunityInvite()
        inv.id = nanoid.nanoid(8)
        inv.communityId = communityId
        inv.inviterId = inviterId
        inv.expiresAt = validTime === null ? undefined : new Date(Date.now()+validTime)
        inv.maxUses = maxUses ?? undefined

        return await this.dataSource.manager.save(inv)
    }

    public async removeInvite(inviteId: string, removerId: number): Promise<void> {

        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        if (invite.inviterId !== removerId) {
            const community = await invite.community
            if (community.ownerId !== removerId) throw new InsufficientPermissionsError()
        }

        await this.dataSource.manager.delete(CommunityInvite, {
            id: inviteId
        })
    }

    public async acceptInvite(inviteId: string, userId: number): Promise<void> {
        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        // check if expired
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            /*
            this.dataSource.manager.delete(CommunityInvite, {
                id: inviteId
            }).catch(e=>e)
            // Removal of expired invites handled by cron job
            */
           
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
}