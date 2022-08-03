import { Express, Router } from 'express'
import { BadRequestError, ResourceNotFoundError } from '../errors'
import { CannotRemoveLastUserConnectionError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { AppServices } from '../types'
import { genericErrorResponse } from '../utils'

/**
 * Prefix: /users
 * GET /<userId> - returns user
 * GET /@me - returns current user
 * PATCH /@me - modifies current user
 * DELETE /@me - deletes current user
 * GET /@me/connections - retuns current user connections
 * DELETE /@me/connections/<userConnection> - removes a user connection
 * GET /@me/communities - return communities that the current user is in
 * DELETE /@me/communities/<communityId> - leaves the community
 */

export const setupUserRoutes = (app: Express, requiresAuth: requiresAuth, {userService, inviteService, authService, communityService}: AppServices) => {
    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const isMe = req.params.id === '@me'
            const queryId = isMe  ? userId : parseInt(req.params.id)
            const user = await userService.getUserById(queryId)
            return res.json(user)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/@me/connections', requiresAuth(async (req, res, userId) => {
        try {
            return res.json(await authService.getUserConnections(userId))
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/@me/connections/:connection', requiresAuth(async (req, res, userId) => {
        try {
            const type = req.params.connection
            if (type !== 'discord' && type !== 'google' && type !== 'github') throw new BadRequestError()
            await authService.removeConnection(userId, type)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/@me/communities', requiresAuth(async (req, res, userId) => {
        try {
            return res.json(await communityService.getUserCommunities(userId))
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/@me/communities/:id', requiresAuth(async (req, res, userId) => {
        try {
            const communityId = parseInt(req.params.id)
            if (isNaN(communityId)) throw new BadRequestError()
            await userService.leaveCommunity(userId, communityId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.patch('/@me', requiresAuth(async (req, res, userId) => {
        try {
            const newUsername = typeof req.body.userame === 'string' ? req.body.username as string : undefined

            const user = await userService.modifyUser(userId, {username: newUsername})
            return res.json(user)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
        
    }))

    router.delete('/@me', requiresAuth(async (req, res, userId) => {
        try {
            await userService.removeUser(userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    app.use('/users', router)
    return app
}
