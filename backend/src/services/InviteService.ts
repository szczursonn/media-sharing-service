import { DataSource } from "typeorm";
import { ResourceNotFoundError } from "../errors";
import { CommunityInvite } from "../models/CommunityInvite";
import { User } from "../models/User";

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
}