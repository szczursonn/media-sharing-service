import { Column, CreateDateColumn, Entity, JoinTable, OneToOne, ManyToMany, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { CommunityPublic } from "../types";
import { Album } from "./Album";
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

    @OneToMany(()=>Album, album=>album.community)
    albums!: Promise<Album[]>

    /*
    @OneToMany(()=>CommunityMember, cm=>cm.community)
    members!: Promise<CommunityMember[]>
    */

    @CreateDateColumn()
    createdAt!: Date

    public public(): CommunityPublic {
        return {
            id: this.id,
            name: this.name,
            ownerId: this.ownerId,
            createdAt: this.createdAt.toISOString()
        }
    }
}