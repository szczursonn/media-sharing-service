import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: number

    @ManyToOne(()=>User, user=>user.sessions)
    user!: Promise<User>

    @CreateDateColumn()
    createdAt!: Date

    public toDisplay() {
        return {
            id: this.id,
            createdAt: this.createdAt
        }
    }
}
