import { Express, Router } from 'express'
import { requiresAuth } from '../middlewares'
import { InviteService } from '../services/InviteService'

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