import { Express, Router } from 'express'
import { AppServices } from '../types'
import { requiresAuth } from '../middlewares'
import Logger from '../Logger'
import multer from 'multer'
import { InsufficientPermissionsError, ResourceNotFoundError } from '../errors'

/**
 * Prefix: /albums
 * - PATCH /<albumId> - edits an album (renames)
 * - DELETE /<albumId> - removes an album
 * - POST /<albumId>/media - upload new media
 */
export const setupAlbumRoutes = (app: Express, requiresAuth: requiresAuth, {albumService, mediaService}: AppServices) => {
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

    const upload = multer()

    router.post('/:albumId/media', upload.single('media'), requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            if (isNaN(albumId)) return res.sendStatus(400)
            const file = req.file
            if (!file) return res.sendStatus(400)

            const media = await mediaService.upload(albumId, file.originalname, file.buffer, userId)
            return res.json(media)
        } catch (err) {
            if (err instanceof ResourceNotFoundError) return res.sendStatus(404)
            if (err instanceof InsufficientPermissionsError) return res.sendStatus(401)
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/:albumId/media/:filename', requiresAuth( async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            if (isNaN(albumId)) return res.sendStatus(400)
            const filename = req.params.filename

            await mediaService.remove(albumId, filename, userId)
            return res.sendStatus(204)
        } catch (err) {
            if (err instanceof ResourceNotFoundError) return res.sendStatus(404)
            if (err instanceof InsufficientPermissionsError) return res.sendStatus(401)
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/albums', router)
    return app
}