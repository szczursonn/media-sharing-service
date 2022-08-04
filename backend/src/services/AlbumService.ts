import { DataSource } from "typeorm";
import { InsufficientPermissionsError, ResourceNotFoundError } from "../errors";
import { Album } from "../models/Album";
import { Community } from "../models/Community";
import { CommunityMember } from "../models/CommunityMember";
import { AlbumPublic } from "../types";

export class AlbumService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
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
        if (!member) throw new InsufficientPermissionsError()

        const albums = await this.dataSource.manager.findBy(Album, {
            communityId
        })

        return albums.map(a=>a.public())
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
        if (!member || !member.canUpload) throw new InsufficientPermissionsError()

        const album = new Album()
        album.name = name
        album.communityId = communityId

        const saved = await this.dataSource.manager.save(album)

        return saved.public()
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
        if (!member || !member.canUpload) throw new InsufficientPermissionsError()

        album.name = newName

        const saved = await this.dataSource.manager.save(album)

        return saved.public()
    }

    public async remove(albumId: number, deleterId: number): Promise<void> {
        const album = await this.dataSource.manager.findOneBy(Album, {
            id: albumId
        })
        if (!album) throw new ResourceNotFoundError()

        const community = await album.community
        if (community.ownerId !== deleterId) throw new InsufficientPermissionsError()

        const delResult = await this.dataSource.manager.delete(Album, {
            id: albumId
        })
        if (typeof delResult.affected === 'number' && delResult.affected === 0) throw new ResourceNotFoundError()
    }
}