import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";

export enum UserConnectionType {
    Google = 'google',
    Discord = 'discord',
    Github = 'github'
}

@Entity()
export class UserConnection {
    @Column()
    foreignId!: string

    @PrimaryColumn()
    type!: UserConnectionType

    @ManyToOne(()=>User, user=>user.connections, { nullable: false })
    user!: Promise<User>

    @PrimaryColumn()
    userId!: number

    @Column()
    foreignUsername!: string

    public toDisplay() {
        return {
            id: this.foreignId,
            username: this.foreignUsername,
            type: this.type
        }
    }
}