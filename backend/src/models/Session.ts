import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    userId!: number

    @ManyToOne(()=>User, user=>user.sessions, {onDelete: 'CASCADE'})
    user!: Promise<User>

    @Column({nullable: true})
    deviceName?: string

    @CreateDateColumn()
    createdAt!: Date

}
