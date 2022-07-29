import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { MediaType } from "../types";
import { Album } from "./Album";
import { Community } from "./Community";
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
    url!: string

    @Column()
    type!: MediaType

    @CreateDateColumn()
    createdAt!: Date
}