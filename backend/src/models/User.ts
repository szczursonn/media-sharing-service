import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Community } from "./Community";
import { Session } from "./Session";
import { UserConnection } from "./UserConnection";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @OneToMany(()=>UserConnection, userConnection=>userConnection.user, {cascade: true})
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

    public async toDisplay(withPrivates: boolean = false) {

        const privates = withPrivates ? await Promise.all([this.sessions, this.connections]) : undefined

        return {
            id: this.id,
            username: this.username,
            avatarUrl: this.avatarUrl,
            createdAt: this.createdAt,
            sessions: privates ? privates[0].map(s=>s.toDisplay()) : undefined,
            connections: privates ? privates[1].map(c=>c.toDisplay()) : undefined
        }
    }
}
