import { Express, Router } from 'express'
import { ResourceNotFoundError, InsufficientPermissionsError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { CommunityService } from '../services/CommunityService'
import { AppServices } from '../types'

/**
 * Prefix: /communities
 * - GET /<communityId> - returns community with given id
 * - POST / - creates a new community
 * - POST /<communityId>/invites - creates new invite
 * - DELETE /<communityId>/members/<memberId> - kicks user from community
 */

export const setupCommunityRoutes = (app: Express, requiresAuth: requiresAuth, {communityService, inviteService}: AppServices) => {
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

    router.post('/:id/invites', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) return res.sendStatus(400)

            const maxUses = req.body.maxUses
            const validTime = req.body.validTime

            if (
                (typeof maxUses !== 'number' && typeof maxUses !== 'undefined') ||
                (typeof validTime !== 'number' && typeof validTime !== 'undefined')
            ) return res.sendStatus(400)

            const invite = await inviteService.createInvite(communityId, userId, validTime ?? null, maxUses ?? null)
            return res.json(invite)
        } catch (err) {
            if (err instanceof InsufficientPermissionsError) {
                return res.sendStatus(403)
            }
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/:communityId/members/:userId', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.communityId)
            const kickedId = parseInt(req.params.userId)
            if (isNaN(communityId) || isNaN(kickedId)) return res.sendStatus(400)
            await communityService.kickUser(communityId, kickedId, userId)
            return res.sendStatus(204)
        } catch (err) {
            if (err instanceof ResourceNotFoundError) return res.sendStatus(404)
            if (err instanceof InsufficientPermissionsError) return res.sendStatus(403)
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/communities', router)
    return app
}