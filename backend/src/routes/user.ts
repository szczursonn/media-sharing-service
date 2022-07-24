import { Express, Router } from 'express'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { UserService } from '../services/UserService'

/**
 * GET /<userId> - returns user
 * GET /@me - returns current user
 * PATCH /@me - modifies current user
 * DELETE /@me - deletes current user
 */

export const setupUserRoutes = (app: Express, requiresAuth: requiresAuth, userService: UserService) => {

    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const isMe = req.params.id === '@me'
            const queryId = isMe  ? userId : parseInt(req.params.id)
            const user = await userService.getUserById(queryId)
            if (!user) return res.sendStatus(404)

            return res.json(await user.toDisplay(isMe))
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.patch('/@me', requiresAuth(async (req, res, userId) => {
        res.sendStatus(500)
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

    app.use('/user', router)

    return app
}
