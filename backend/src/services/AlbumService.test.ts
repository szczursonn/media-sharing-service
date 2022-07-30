import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { InsufficientPermissionsError } from "../errors"
import { Album } from "../models/Album"
import { AlbumService } from "./AlbumService"

describe('AlbumService tests', () => {
    
    let dataSource: DataSource
    let albumService: AlbumService

    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            albumService = new AlbumService(dataSource)
            done()
        })
    })
    
    it('allows to get community\'s albums', async () => {
        const albums = await albumService.getByCommunity(2, 1)
        expect(albums.length).toBe(2)
    })

    it('disallows to get community\'s albums if you are not a member', async () => {
        await expect(albumService.getByCommunity(2, 3)).rejects.toThrowError(InsufficientPermissionsError)
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
})