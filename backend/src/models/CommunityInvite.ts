import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
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

    @OneToOne(()=>User, {onDelete: 'SET NULL', nullable: true})
    inviter!: Promise<User>

    @Column()
    inviterId?: number

    @Column({nullable: true})
    maxUses?: number
    
    @Column({default: 0})
    uses!: number

    @Column({nullable: true})
    expiresAt?: Date
}