import { Express, Router } from 'express'
import { AppServices } from '../types'
import { requiresAuth } from '../middlewares'
import Logger from '../Logger'

/**
 * Prefix: /albums
 * - PATCH /<albumId> - edits an album (renames)
 * - DELETE /<albumId> - removes an album
 */
export const setupAlbumRoutes = (app: Express, requiresAuth: requiresAuth, {albumService}: AppServices) => {
    const router = Router()

    router.patch('/:albumId', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            const name = req.body.name

            if (isNaN(albumId) || typeof name !== 'string') return res.sendStatus(400)

            const album = await albumService.rename(albumId, name, userId)
            return res.json(album)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/:albumId', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)

            if (isNaN(albumId)) return res.sendStatus(400)

            await albumService.remove(albumId, userId)
            return res.sendStatus(204)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/albums', router)
    return app
}