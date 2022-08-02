import { Express, Router } from 'express'
import { ResourceNotFoundError, InsufficientPermissionsError, BadRequestError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { AppServices } from '../types'
import { genericErrorResponse } from '../utils'

/**
 * Prefix: /communities
 * - GET /<communityId> - returns community with given id
 * - POST / - creates a new community
 * - GET /<communityId/invities - returns community invites
 * - POST /<communityId>/invites - creates new invite
 * - GET /<communityId/members - returns community members
 * - DELETE /<communityId>/members/<memberId> - kicks user from community
 * - GET /<communityId>/albums - returns community albums
 * - POST /<communityId>/albums - creates an album
 */

export const setupCommunityRoutes = (app: Express, requiresAuth: requiresAuth, {communityService, inviteService, albumService}: AppServices) => {
    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) throw new BadRequestError()
            return res.json(await communityService.getCommunityById(communityId))
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.post('/', requiresAuth(async (req, res, userId) => {
        try {
            const name = req.body.name
            if (typeof name !== 'string') throw new BadRequestError()

            const community = await communityService.createCommunity(userId, name)
            return res.json(community)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/:id/invites', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) throw new BadRequestError()

            const invites = await inviteService.getCommunityInvites(communityId, userId)

            return res.json(invites)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.post('/:id/invites', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) throw new BadRequestError()

            const maxUses = req.body.maxUses
            const validTime = req.body.validTime

            if (
                (typeof maxUses !== 'number' && typeof maxUses !== 'undefined') ||
                (typeof validTime !== 'number' && typeof validTime !== 'undefined')
            ) throw new BadRequestError()

            const invite = await inviteService.createInvite(communityId, userId, validTime ?? null, maxUses ?? null)
            return res.json(invite)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/:communityId/members', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.communityId)
            if (isNaN(communityId)) throw new BadRequestError()

            const members = await communityService.getCommunityMembers(communityId, userId)
            return res.json(members)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/:communityId/members/:userId', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.communityId)
            const kickedId = parseInt(req.params.userId)
            if (isNaN(communityId) || isNaN(kickedId)) throw new BadRequestError()
            await communityService.kickUser(communityId, kickedId, userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/:communityId/albums', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.communityId)
            if (isNaN(communityId)) throw new BadRequestError()
            return await albumService.getByCommunity(communityId, userId)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.post('/:communityId/albums', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.communityId)
            const name = req.body.name

            if (isNaN(communityId) || typeof name !== 'string') throw new BadRequestError()

            const album = await albumService.create(communityId, name, userId)
            return res.json(album)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    app.use('/communities', router)
    return app
}