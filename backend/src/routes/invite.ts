import { Express, Router } from 'express'
import { ResourceNotFoundError } from '../errors'
import { CannotRemoveLastUserConnectionError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'

/**
 * Prefix: /invite
 * - GET /<inviteId> - returns invite info (invite+community+inviter)
 */
export const setupInviteRoutes = (app: Express, requiresAuth: requiresAuth, inviteService: InviteService) => {
    const router = Router()

    router.get('/:id', async (req, res) => {
        return res.sendStatus(500)
    })

    app.use('/invite', router)
    return app
}