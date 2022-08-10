import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { InsufficientPermissionsError, MissingAccessError } from "../errors"
import { Album } from "../models/Album"
import { AlbumService } from "./AlbumService"
import { MediaStorage } from "./MediaService"
import { MockMediaStorage } from "./MediaStorages/MockMediaStorage"

describe('AlbumService tests', () => {
    
    let dataSource: DataSource
    let albumService: AlbumService
    let mediaStorage: MediaStorage

    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            mediaStorage = new MockMediaStorage()
            albumService = new AlbumService(dataSource, mediaStorage)
            done()
        })
    })
    
    it('allows to get community\'s albums', async () => {
        const albums = await albumService.getByCommunity(2, 1)
        expect(albums.length).toBe(2)
    })

    it('disallows to get community\'s albums if you are not a member', async () => {
        await expect(albumService.getByCommunity(2, 3)).rejects.toThrowError(MissingAccessError)
    })

    it('allows to create album', async () => {
        await albumService.create(1, 'qqqwwweee', 3)
    })

    it('allows to rename album', async () => {
        await albumService.rename(1, 'abcdef', 1)
        const album = await dataSource.manager.findOneByOrFail(Album, {
            id: 1
        })
        expect(album.name).toBe('abcdef')
    })

    it('allows to remove album', async () => {
        await albumService.remove(1, 1)
        const count = await dataSource.manager.countBy(Album, {
            id: 1
        })
        expect(count).toBe(0)
    })

    it('disallows to remove album if not the owner of community', async () => {
        await expect(albumService.remove(5, 2)).rejects.toThrowError(InsufficientPermissionsError)
    })
})