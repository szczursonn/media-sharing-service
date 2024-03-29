import { DataSource } from "typeorm";
import { ResourceNotFoundError, InsufficientPermissionsError, AlreadyAMemberError, MissingAccessError } from "../errors";
import { Community } from "../models/Community"
import { CommunityInvite } from "../models/CommunityInvite";
import { CommunityMember } from "../models/CommunityMember";
import nanoid from "nanoid";
import { CommunityInvitePublic, CommunityPublic } from "../types";

export class InviteService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getInvite(inviteId: string): Promise<CommunityInvitePublic> {
        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        
        return await invite.public()
    }

    public async getCommunityInvites(communityId: number, getterId: number): Promise<CommunityInvitePublic[]> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: getterId,
            communityId
        })
        if (!member) throw new MissingAccessError()
        // only the owner can get all community invites
        if(community.ownerId !== getterId) throw new InsufficientPermissionsError()

        const invites = await community.invites

        // TODO: better query
        const i = await Promise.all(invites.map(i=>i.public()))

        return i
    }

    public async createInvite(communityId: number, inviterId: number, validTimeSeconds: number | null, maxUses: number | null): Promise<CommunityInvitePublic> {

        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: inviterId,
            communityId
        })
        if (!member) throw new MissingAccessError()
        // only the owner can create invites
        if (community.ownerId !== inviterId) throw new InsufficientPermissionsError()

        const inv = new CommunityInvite()
        inv.id = nanoid.nanoid(8)
        inv.communityId = communityId
        inv.inviterId = inviterId
        inv.expiresAt = validTimeSeconds === null ? undefined : new Date(Date.now()+validTimeSeconds*1000)
        inv.maxUses = maxUses ?? undefined

        const saved = await this.dataSource.manager.save(inv)

        return await saved.public()
    }

    public async removeInvite(inviteId: string, removerId: number): Promise<void> {

        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        // only the owner or inviter can remove an invite
        if (invite.inviterId !== removerId) {
            const community = await invite.community
            if (community.ownerId !== removerId) throw new InsufficientPermissionsError()
        }

        await this.dataSource.manager.delete(CommunityInvite, {
            id: inviteId
        })
    }

    public async acceptInvite(inviteId: string, userId: number): Promise<CommunityPublic> {
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

        const com = await this.dataSource.manager.findOneByOrFail(Community, {
            id: invite.communityId
        })

        return com.public()
    }
}