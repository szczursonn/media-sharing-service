import { DataSource } from "typeorm";
import { InsufficientPermissionsError, ResourceNotFoundError } from "../errors";
import { Album } from "../models/Album";
import { Community } from "../models/Community";
import { CommunityMember } from "../models/CommunityMember";

export class AlbumService {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getByCommunity(communityId: number, getterId: number): Promise<Album[]> {
        const community = await this.dataSource.manager.findOneBy(Community, {
            id: communityId
        })
        if (!community) throw new ResourceNotFoundError()

        const member = await this.dataSource.manager.findOneBy(CommunityMember, {
            userId: getterId,
            communityId
        })
        if (!member) throw new InsufficientPermissionsError()

        return await this.dataSource.manager.findBy(Album, {
            communityId
        })
    }

    public async create(communityId: number, name: string, creatorId: number): Promise<Album> {
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

        return await this.dataSource.manager.save(album)
    }

    public async rename(albumId: number, newName: string, getterId: number): Promise<Album> {
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
        return await this.dataSource.manager.save(album)
    }
}