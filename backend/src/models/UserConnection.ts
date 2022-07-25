import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { UserConnectionType } from "../types";
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

    public toDisplay() {
        return {
            id: this.foreignId,
            username: this.foreignUsername,
            type: this.type
        }
    }
}