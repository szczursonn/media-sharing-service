import { ResourceNotFoundError, InsufficientPermissionsError } from "../errors";
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

    public async createInvite(communityId: number, inviterId: number, validTime: number | null, maxUses: number | null): Promise<CommunityInvite> {

        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()
        // only the owner can create invites
        if (community.ownerId !== inviterId) throw new InsufficientPermissionsError()

        // TODO: FIX THIS SHIT
        const {nanoid} = await import('nanoid/non-secure')

        const inv = new CommunityInvite()
        inv.id = nanoid(8)
        inv.communityId = communityId
        inv.inviterId = inviterId
        inv.expiresAt = validTime === null ? undefined : new Date(Date.now()+validTime)
        inv.maxUses = maxUses ?? undefined

        return await this.dataSource.manager.save(inv)
    }

    public async removeInvite(inviteId: string, userId: number): Promise<void> {

        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        if (invite.inviterId !== userId) {
            const community = await invite.community
            if (community.ownerId !== userId) throw new InsufficientPermissionsError()
        }

        await this.dataSource.manager.delete(CommunityInvite, {
            id: inviteId
        })
    }
}