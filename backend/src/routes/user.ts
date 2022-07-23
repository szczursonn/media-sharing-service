import { Express, Router } from 'express'
import Logger from '../Logger'
import { UserStorage } from '../services/UserStorage'
import { requiresAuth } from '../middlewares'
import { AuthService } from '../services/AuthService'

export const setupUserRoutes = (app: Express, requiresAuth: requiresAuth, authService: AuthService, userStorage: UserStorage) => {

    const router = Router()

    router.get('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const isMe = req.params.id === '@me'
            const queryId = isMe  ? userId : parseInt(req.params.id)
            const user = await userStorage.getById(queryId)
            if (!user) return res.sendStatus(404)

            return res.json(await user.toDisplay(isMe))
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/:id', requiresAuth(async (req, res, userId) => {
        try {
            const id = parseInt(req.params.id)
            if (isNaN(id)) return res.sendStatus(400)
            if (id !== userId) return res.sendStatus(401)
            await userStorage.remove(id)
            res.sendStatus(204)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    app.use('/user', router)

    return app
}
