import { CreateDateColumn, Entity, JoinTable, OneToOne, PrimaryColumn } from "typeorm";
import { Community } from "./Community";
import { User } from "./User";

@Entity()
export class CommunityMember {
    @PrimaryColumn()
    communityId!: number

    @OneToOne(()=>Community)
    community!: Promise<Community>

    @PrimaryColumn()
    userId!: number

    @OneToOne(()=>User)
    @JoinTable()
    user!: Promise<User>
    
    @CreateDateColumn()
    createdAt!: Date
}