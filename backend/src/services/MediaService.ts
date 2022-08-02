import { DataSource } from "typeorm";
import { Media } from "../models/Media";
import { MediaType } from "../types";
import { fromBuffer } from "file-type";
import { Album } from "../models/Album";
import { InsufficientPermissionsError, ResourceNotFoundError } from "../errors";
import { CommunityMember } from "../models/CommunityMember";
import { Community } from "../models/Community";

export interface MediaStorage {
    save(media: Media, file: Buffer): Promise<void>
    remove(media: Media): Promise<void>
}

export class MediaService {
    private dataSource: DataSource
    private storage: MediaStorage

    public constructor(dataSource: DataSource, storage: MediaStorage) {
        this.dataSource = dataSource
        this.storage = storage
    }

    public async upload(albumId: number, filename: string, content: Buffer, uploaderId: number): Promise<Media> {
        let type: MediaType

        const album = await this.dataSource.manager.findOneBy(Album, {
            id: albumId
        })
        if (!album) throw new ResourceNotFoundError()

        const uploaderAsMember = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: albumId,
            communityId: album.communityId
        })

        if (!uploaderAsMember || !uploaderAsMember.canUpload) throw new InsufficientPermissionsError()

        const filetype = await fromBuffer(content)
        if (!filetype) throw new Error()
        if (filetype.mime.startsWith('image')) type = 'image'
        else if (filetype.mime.startsWith('video')) type = 'video'
        else throw new Error()

        return await this.dataSource.transaction(async (transaction) => {

            let newFilename = filename
            if (await transaction.countBy(Media, {filename: newFilename, albumId})) {
                let count = 1
                while (await transaction.countBy(Media, {filename: newFilename, albumId})) {
                    newFilename = `${count}_${filename}`
                    count++
                    if (count > 50) throw new Error()
                }
            }

            const media = new Media()
            media.filename = newFilename
            media.albumId = albumId
            media.authorId = uploaderId
            media.type = type
            const saved = await transaction.save(media)

            await this.storage.save(saved, content)

            return saved
        })
    }

    public async remove(albumId: number, filename: string, removerId: number): Promise<void> {
        const media = await this.dataSource.manager.findOneBy(Media, {
            albumId,
            filename
        })
        if (!media) throw new ResourceNotFoundError()

        if (media.authorId !== removerId) {
            const album = await this.dataSource.manager.findOneByOrFail(Album, {
                id: albumId
            })
            const community = await this.dataSource.manager.findOneByOrFail(Community, {
                id: album.communityId
            })
            if (community.ownerId !== removerId) throw new InsufficientPermissionsError()
        }

        await this.dataSource.transaction(async (transaction)=>{
            await transaction.delete(Media, {
                albumId,
                filename
            })
            await this.storage.remove(media)
        })

    }
}