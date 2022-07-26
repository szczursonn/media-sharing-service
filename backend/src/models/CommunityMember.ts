import { CreateDateColumn, Entity, OneToOne, PrimaryColumn } from "typeorm";
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
    
    @CreateDateColumn()
    createdAt!: Date
}