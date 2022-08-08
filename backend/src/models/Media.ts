import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { MediaStorage } from "../services/MediaService";
import { MediaPublic, MediaType } from "../types";
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

    @ManyToOne(()=>User, {onDelete: 'SET NULL'})
    author!: Promise<User>

    @Column()
    authorId!: number

    @Column()
    type!: MediaType

    @CreateDateColumn()
    createdAt!: Date

    public public(mediaStorage: MediaStorage): MediaPublic {
        return {
            filename: this.filename,
            authorId: this.authorId,
            type: this.type,
            url: mediaStorage.getUrl(this),
            createdAt: this.createdAt.toISOString()
        }
    }
}