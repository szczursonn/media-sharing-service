import { Express, Router } from 'express'
import { ResourceNotFoundError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { CommunityService } from '../services/CommunityService'

/**
 * Prefix: /communities
 * - GET /<communityId> - returns community with given id
 * - POST / - creates a new community
 */

export const setupCommunityRoutes = (app: Express, requiresAuth: requiresAuth, communityService: CommunityService) => {
    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) return res.sendStatus(400)
            return res.json(await communityService.getCommunityById(communityId))
        } catch (err) {
            if (err instanceof ResourceNotFoundError) return res.sendStatus(404)
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.post('/', requiresAuth(async (req, res, userId) => {
        try {
            const name = req.body.name
            if (typeof name !== 'string') return res.sendStatus(400)

            const community = await communityService.createCommunity(userId, name)
            return res.json(community)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/communities', router)
    return app
}