import { Column, CreateDateColumn, Entity, JoinTable, OneToOne, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
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

    /*
    @OneToMany(()=>CommunityMember, cm=>cm.community)
    members!: Promise<CommunityMember[]>
    */

    @CreateDateColumn()
    createdAt!: Date
}