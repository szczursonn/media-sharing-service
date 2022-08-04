import { Express, Router } from 'express'
import { AppServices } from '../types'
import { requiresAuth } from '../middlewares'
import { genericErrorResponse } from '../utils'

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
            return genericErrorResponse(res, err)
        }
    })

    router.post('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const inviteId = req.params.id
            const com = await inviteService.acceptInvite(inviteId, userId)
            return res.json(com)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const inviteId = req.params.id
            await inviteService.removeInvite(inviteId, userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    app.use('/invite', router)
    return app
}