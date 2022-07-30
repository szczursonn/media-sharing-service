import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Community } from "./Community";
import { Media } from "./Media";

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @ManyToOne(()=>Community, com=>com.albums)
    community!: Promise<Community>

    @Column()
    communityId!: number

    @OneToMany(()=>Media, m=>m.album)
    media!: Promise<Media[]>

    //@OneToOne(()=>Media)
    //cover!: Promise<Media>
}