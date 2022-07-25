import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Community } from "./Community";
import { Session } from "./Session";
import { UserConnection } from "./UserConnection";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @OneToMany(()=>UserConnection, userConnection=>userConnection.user)
    connections!: Promise<UserConnection[]>

    @OneToMany(()=>Session, session=>session.user)
    sessions!: Promise<Session[]>

    @ManyToMany(()=>Community)
    @JoinTable({
        name: 'community_member'
    })
    communities!: Promise<Community[]>

    /*
    @OneToMany(()=>CommunityMember, cm=>cm.user)
    members!: Promise<CommunityMember[]>
    */

    @Column()
    username!: string

    @Column({nullable: true})
    avatarUrl?: string

    @CreateDateColumn()
    createdAt!: Date

    public toDisplay() {

        return {
            id: this.id,
            username: this.username,
            avatarUrl: this.avatarUrl,
            createdAt: this.createdAt
        }
    }
}
