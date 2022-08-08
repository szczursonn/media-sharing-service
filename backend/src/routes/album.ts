import { Express, Router } from 'express'
import { AppServices } from '../types'
import { requiresAuth } from '../middlewares'
import multer from 'multer'
import { BadRequestError } from '../errors'
import { genericErrorResponse } from '../utils'

/**
 * Prefix: /albums
 * - PATCH /<albumId> - edits an album (renames)
 * - DELETE /<albumId> - removes an album
 * - GET /<albumId>/media - get album media
 * - POST /<albumId>/media - upload new media
 */
export const setupAlbumRoutes = (app: Express, requiresAuth: requiresAuth, {albumService, mediaService}: AppServices) => {
    const router = Router()

    router.patch('/:albumId', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            const name = req.body.name
            
            if (isNaN(albumId) || typeof name !== 'string') throw new BadRequestError()

            const album = await albumService.rename(albumId, name, userId)
            return res.json(album)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/:albumId', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)

            if (isNaN(albumId)) throw new BadRequestError()

            await albumService.remove(albumId, userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/:albumId/media', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)

            if (isNaN(albumId)) throw new BadRequestError()

            const media = await mediaService.getMedia(albumId, userId)
            return res.json(media)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    const upload = multer()
    router.post('/:albumId/media', upload.single('media'), requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            if (isNaN(albumId)) throw new BadRequestError()
            const file = req.file
            if (!file) throw new BadRequestError()

            const media = await mediaService.upload(albumId, file.originalname, file.buffer, userId)
            return res.json(media)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/:albumId/media/:filename', requiresAuth(async (req, res, userId) => {
        try {
            const albumId = parseInt(req.params.albumId)
            if (isNaN(albumId)) throw new BadRequestError()
            const filename = req.params.filename

            await mediaService.remove(albumId, filename, userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    app.use('/albums', router)
    return app
}