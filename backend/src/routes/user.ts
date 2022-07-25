import { Express, Router } from 'express'
import { CannotRemoveLastUserConnectionError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { UserService } from '../services/UserService'

/**
 * Prefix: /users
 * GET /<userId> - returns user
 * GET /@me - returns current user
 * PATCH /@me - modifies current user
 * DELETE /@me - deletes current user
 * GET /@me/connections - retuns current user connections
 * DELETE /@me/connections/<userConnection>
 */

export const setupUserRoutes = (app: Express, requiresAuth: requiresAuth, userService: UserService) => {
    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const isMe = req.params.id === '@me'
            const queryId = isMe  ? userId : parseInt(req.params.id)
            const user = await userService.getUserById(queryId)
            if (!user) return res.sendStatus(404)

            return res.json(user.toDisplay())
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.get('/@me/connections', requiresAuth(async (req, res, userId) => {
        try {
            return res.json(await userService.getUserConnections(userId))
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/@me/connections/:connection', requiresAuth(async (req, res, userId) => {
        try {
            const type = req.params.connection
            if (type !== 'discord' && type !== 'google' && type !== 'github') return res.sendStatus(400)
            await userService.removeConnection(userId, type)
        } catch (err) {
            if (err instanceof CannotRemoveLastUserConnectionError) {
                return res.sendStatus(409)
            }
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.patch('/@me', requiresAuth(async (req, res, userId) => {
        try {
            const newUsername = typeof req.body.userame === 'string' ? req.body.username as string : undefined

            const user = await userService.modifyUser(userId, {username: newUsername})
            return res.json(user)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
        
    }))

    router.delete('/@me', requiresAuth(async (req, res, userId) => {
        try {
            await userService.removeUser(userId)
            res.sendStatus(204)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/users', router)
    return app
}
