import { Express, Router } from 'express'
import { ResourceNotFoundError } from '../errors'
import Logger from '../Logger'
import { InviteService } from '../services/InviteService'

/**
 * Prefix: /invite
 * - GET /<inviteId> - returns invite info (invite+community+inviter)
 */
export const setupInviteRoutes = (app: Express, inviteService: InviteService) => {
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

    app.use('/invite', router)
    return app
}