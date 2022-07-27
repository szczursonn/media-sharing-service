import { ResourceNotFoundError, InsufficientPermissionsError } from "../errors";
import { CommunityStorage } from "./CommunityStorage";
import { Community } from "../models/Community"
import { CommunityInvite } from "../models/CommunityInvite";
import { CommunityMember } from "../models/CommunityMember";

export class CommunityService {
    private communityStorage: CommunityStorage

    public constructor(communityStorage: CommunityStorage) {
        this.communityStorage = communityStorage
    }

    public async getCommunityById(communityId: number): Promise<Community> {
        const com = await this.communityStorage.getById(communityId)
        if (!com) throw new ResourceNotFoundError()
        return com
    }

    public async createCommunity(ownerId: number, name: string): Promise<Community> {
        const com = new Community()
        com.ownerId = ownerId
        com.name = name
        const saved = await this.communityStorage.saveNew(com)
        return saved
    }

    public async createInvite(communityId: number, inviterId: number, validTime: number | null, maxUses: number | null): Promise<CommunityInvite> {

        // only the owner can create invites
        const community = await this.communityStorage.getById(communityId)
        if (community.ownerId !== inviterId) throw new InsufficientPermissionsError()

        const inv = new CommunityInvite()
        inv.id = // TODO: https://github.com/ai/nanoid/
        inv.communityId = communityId
        inv.inviterId = inviterId
        inv.expiresAt = validTime === null ? null : new Date(Date.now()+validTime)
        inv.maxUses = maxUses

        return await this.communityStorage.saveInvite(inv)
    }

    public async removeInvite(inviteId: string, userId: number): Promise<void> {

        const invite = await this.communityStorage.getInvite(inviteId)
        if (!invite) throw ResourceNotFoundError()
        if (invite.inviterId !== userId) {
            const community = await invite.community
            if (community.ownerId !== userId) throw new InsufficientPermissionsError()
        }

        await this.communityStorage.removeInvite(inviteId)
    }
}