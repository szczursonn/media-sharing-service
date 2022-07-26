import { ResourceNotFoundError } from "../errors";
import { CommunityStorage } from "./CommunityStorage";
import { Community } from "../models/Community"

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
}