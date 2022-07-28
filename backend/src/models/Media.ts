import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { MediaType } from "../types";

@Entity()
export class Media {
    @PrimaryColumn()
    filename!: string

    @ManyToOne(()=>Community, com=>com.media, {nullable: false, onDelete: 'CASCADE'})
    community!: Promise<Community>

    @PrimaryColumn()
    communityId!: number

    @OneToOne(()=>User, {onDelete: 'SET NULL'})
    author!: Promise<User>

    @Column()
    authorId!: number

    @Column()
    url!: string

    @Column()
    type!: MediaType

    @CreateDateColumn()
    createdAt!: Date
}