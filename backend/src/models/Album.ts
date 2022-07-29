import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Community } from "./Community";
import { Media } from "./Media";

@Entity()
export class Album {
    @PrimaryColumn()
    name!: string

    @ManyToOne(()=>Community, com=>com.albums)
    community!: Promise<Community>

    @PrimaryColumn()
    communityId!: number

    @OneToMany(()=>Media, m=>m.album)
    media!: Promise<Media[]>
}