import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { UserConnectionPublic, UserConnectionType } from "../types";
import { User } from "./User";

@Entity()
export class UserConnection {
    @Column()
    foreignId!: string

    @PrimaryColumn()
    type!: UserConnectionType

    @ManyToOne(()=>User, user=>user.connections, { nullable: false, onDelete: 'CASCADE' })
    user!: Promise<User>

    @PrimaryColumn()
    userId!: number

    @Column()
    foreignUsername!: string

    @CreateDateColumn()
    createdAt!: Date

    public public(): UserConnectionPublic {
        return {
            foreignId: this.foreignId,
            foreignUsername: this.foreignUsername,
            type: this.type,
            createdAt: this.createdAt.toISOString()
        }
    }

}