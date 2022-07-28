import { Express, Router } from 'express'
import { ResourceNotFoundError } from '../errors'
import Logger from '../Logger'
import { AppServices } from '../types'
import { requiresAuth } from '../middlewares'

/**
 * Prefix: /invite
 * - GET /<inviteId> - returns invite info (invite+community+inviter)
 * - POST /<inviteId> - accepts the invite (joins current user to community)
 * - DELETE /<inviteId> - invalidates the invite
 */
export const setupInviteRoutes = (app: Express, requiresAuth: requiresAuth, {inviteService}: AppServices) => {
    const router = Router()

    router.get('/:id', async (req, res) => {
        try {
            return res.json(await inviteService.getInvite(req.params.id))
        } catch (err) {
            if (err instanceof ResourceNotFoundError) return res.sendStatus(404)
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    })

    router.post('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const inviteId = req.body.inviteId
            if (typeof inviteId !== 'string') return res.sendStatus(400)
            await inviteService.acceptInvite(inviteId, userId)
            return res.sendStatus(204)
        } catch (err) {
            if (err instanceof ResourceNotFoundError) {
                return res.sendStatus(404)
            }
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const inviteId = req.params.id
            await inviteService.removeInvite(inviteId, userId)
            return res.sendStatus(204)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/invite', router)
    return app
}