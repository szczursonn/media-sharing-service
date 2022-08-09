import { DataSource } from "typeorm";
import { CoverCanOnlyBeImageError, InsufficientPermissionsError, MissingAccessError, ResourceNotFoundError } from "../errors";
import { Album } from "../models/Album";
import { Community } from "../models/Community";
import { CommunityMember } from "../models/CommunityMember";
import { Media } from "../models/Media";
import { AlbumPublic } from "../types";
import { MediaStorage } from "./MediaService";

export class AlbumService {
    private dataSource: DataSource
    private mediaStorage: MediaStorage

    public constructor(dataSource: DataSource, mediaStorage: MediaStorage) {
        this.dataSource = dataSource
        this.mediaStorage = mediaStorage
    }

    public async getByCommunity(communityId: number, getterId: number): Promise<AlbumPublic[]> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: getterId,
            communityId
        })
        if (!member) throw new MissingAccessError()

        const albums = await this.dataSource.manager.findBy(Album, {
            communityId
        })

        return await Promise.all(albums.map(a=>a.public(this.mediaStorage)))
    }

    public async create(communityId: number, name: string, creatorId: number): Promise<AlbumPublic> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: creatorId,
            communityId
        })
        if (!member) throw new MissingAccessError()
        if (!member.canUpload) throw new InsufficientPermissionsError()

        const album = new Album()
        album.name = name
        album.communityId = communityId

        const saved = await this.dataSource.manager.save(album)

        return await saved.public(this.mediaStorage)
    }

    public async rename(albumId: number, newName: string, getterId: number): Promise<AlbumPublic> {
        const album = await this.dataSource.manager.findOneBy(Album, {
            id: albumId
        })
        if (!album) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            communityId: album.communityId,
            userId: getterId
        })
        if (!member) throw new MissingAccessError()
        if (!member.canUpload) throw new InsufficientPermissionsError()

        album.name = newName

        const saved = await this.dataSource.manager.save(album)

        return await saved.public(this.mediaStorage)
    }

    public async remove(albumId: number, deleterId: number): Promise<void> {
        const album = await this.dataSource.manager.findOneBy(Album, {
            id: albumId
        })
        if (!album) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: deleterId,
            communityId: album.communityId
        })
        if (!member) throw new MissingAccessError()

        const community = await album.community
        if (community.ownerId !== deleterId) throw new InsufficientPermissionsError()

        const delResult = await this.dataSource.manager.delete(Album, {
            id: albumId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }

    public async setCover(albumId: number, filename: string, setterId: number): Promise<AlbumPublic> {
        const album = await this.dataSource.manager.findOneBy(Album, {
            id: albumId
        })
        if (!album) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: setterId,
            communityId: album.communityId
        })
        if (!member) throw new MissingAccessError()
        if (!member.canUpload) throw new InsufficientPermissionsError()

        const media = await this.dataSource.manager.findOneBy(Media, {
            albumId,
            filename
        })
        if (!media) throw new ResourceNotFoundError()
        if (media.type !== 'image') throw new CoverCanOnlyBeImageError()

        await this.dataSource
            .createQueryBuilder()
            .relation(Album, 'cover')
            .of(albumId)
            .set(media)

        const saved = this.dataSource.manager.findOneByOrFail(Album, {
            id: albumId
        })
        return (await saved).public(this.mediaStorage)
    }
}