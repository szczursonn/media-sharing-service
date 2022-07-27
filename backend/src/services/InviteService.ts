import { CommunityInvite } from "../models/CommunityInvite";
import { CommunityStorage } from "./CommunityStorage";

export class InviteService {
    private communityStorage: CommunityStorage

    public constructor(communityStorage: CommunityStorage) {
        this.communityStorage = communityStorage
    }

    public getInvite(inviteId: string): Promise<CommunityInvite> {
        await this.communityStorage.getInvite(inviteId)
    }

}