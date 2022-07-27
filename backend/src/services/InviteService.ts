import { DataSource } from "typeorm";
import { ResourceNotFoundError } from "../errors";
import { CommunityInvite } from "../models/CommunityInvite";

export class InviteService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
        
    }

    public async getInvite(inviteId: string): Promise<CommunityInvite> {
        const invite = await this.dataSource.manager.findOneBy(CommunityInvite, {
            id: inviteId
        })
        if (!invite) throw new ResourceNotFoundError()
        return invite
    }

}