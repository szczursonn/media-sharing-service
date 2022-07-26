import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Community } from "./Community";

export class CommunityInvite {
    // https://github.com/ai/nanoid/
    // the id that appears in the url
    @PrimaryColumn()
    id!: string

    @ManyToOne(()=>Community, com=>com.invites, {onDelete: 'CASCADE'})
    community!: Promise<Community>

    @Column()
    communityId!: number

    // TODO: default value 0
    @Column()
    uses!: number

    @Column()
    expiresAt!: Date
}