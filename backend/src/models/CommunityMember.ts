import { CreateDateColumn, Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { CommunityMemberPublic } from "../types";
import { Community } from "./Community";
import { User } from "./User";

@Entity()
export class CommunityMember {
    @PrimaryColumn()
    communityId!: number

    @OneToOne(()=>Community, {onDelete: 'CASCADE'})
    community!: Promise<Community>

    @PrimaryColumn()
    userId!: number

    @OneToOne(()=>User, {onDelete: 'CASCADE'})
    user!: Promise<User>
    
    @Column({default: false})
    canUpload!: boolean

    @CreateDateColumn()
    createdAt!: Date

    public async public(): Promise<CommunityMemberPublic> {
        return {
            user: (await this.user).public(),
            canUpload: this.canUpload,
            joinedAt: this.createdAt.toISOString()
        }
    }
}