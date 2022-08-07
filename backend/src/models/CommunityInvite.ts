import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { CommunityInvitePublic } from "../types";
import { Community } from "./Community";
import { User } from './User';

@Entity()
export class CommunityInvite {
    // https://github.com/ai/nanoid/
    // the id that appears in the url
    @PrimaryColumn()
    id!: string

    @ManyToOne(()=>Community, com=>com.invites, {onDelete: 'CASCADE'})
    community!: Promise<Community>

    @Column()
    communityId!: number

    @ManyToOne(()=>User, {onDelete: 'SET NULL', nullable: true})
    inviter!: Promise<User>

    @Column({nullable: true})
    inviterId?: number

    @Column({nullable: true})
    maxUses?: number
    
    @Column({default: 0})
    uses!: number

    @Column({nullable: true})
    expiresAt?: Date

    public async public(): Promise<CommunityInvitePublic> {
        return {
            id: this.id,
            inviter: (await this.inviter)?.public() ?? null,
            community: (await this.community).public(),
            maxUses: this.maxUses ?? null,
            expiresAt: this.expiresAt?.toISOString() ?? null,
            uses: this.uses
        }
    }
}