import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { MediaType } from "../types";
import { Album } from "./Album";
import { User } from "./User";

@Entity()
export class Media {
    @PrimaryColumn()
    filename!: string

    @ManyToOne(()=>Album, album=>album.media, {nullable: false, onDelete: 'CASCADE'})
    album!: Promise<Album>

    @PrimaryColumn()
    albumId!: number

    @OneToOne(()=>User, {onDelete: 'SET NULL'})
    author!: Promise<User>

    @Column()
    authorId!: number

    @Column()
    type!: MediaType

    @CreateDateColumn()
    createdAt!: Date
}