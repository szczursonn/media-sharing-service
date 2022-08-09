import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MediaStorage } from "../services/MediaService";
import { AlbumPublic } from "../types";
import { Community } from "./Community";
import { Media } from "./Media";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @ManyToOne(()=>Community, com=>com.albums, {onDelete: 'CASCADE'})
    community!: Promise<Community>

    @Column()
    communityId!: number

    @OneToMany(()=>Media, m=>m.album)
    media!: Promise<Media[]>

    @OneToOne(()=>Media, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn()
    cover!: Promise<Media>

    @Column({nullable: true})
    coverFilename!: string

    @Column({nullable: true})
    coverAlbumId!: number

    public async public(mediaStorage: MediaStorage): Promise<AlbumPublic>  {
        return {
            id: this.id,
            name: this.name,
            cover: (await this.cover)?.public(mediaStorage) ?? null
        }
    }
}