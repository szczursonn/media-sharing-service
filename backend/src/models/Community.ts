import { Column, CreateDateColumn, Entity, JoinTable, OneToOne, ManyToMany, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { CommunityInvite } from "./CommunityInvite";
import { User } from "./User";

@Entity()
export class Community {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @ManyToMany(()=>User)
    @JoinTable({
        name: 'community_member'
    })
    users!: Promise<User[]>

    @OneToOne(()=>User)
    owner!: Promise<User>

    @Column()
    ownerId!: number

    @OneToMany(()=>CommunityInvite, ci=>ci.community)
    invites!: Promise<CommunityInvite[]>

    @OneToMany(()=>Media, media=>media.community)
    media!: Promise<Media[]>

    /*
    @OneToMany(()=>CommunityMember, cm=>cm.community)
    members!: Promise<CommunityMember[]>
    */

    @CreateDateColumn()
    createdAt!: Date
}