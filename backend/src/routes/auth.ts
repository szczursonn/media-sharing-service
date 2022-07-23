import { Express, Router, Request, Response } from 'express'
import { CannotRemoveLastUserConnectionError, OAuth2InvalidCodeError, OAuth2ProviderUnavailableError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { UserConnectionType } from '../models/UserConnection'
import { AuthService } from '../services/AuthService'
import { extractToken } from '../utils/extractToken'

export const setupAuthRoutes = (app: Express, requiresAuth: requiresAuth, authService: AuthService): Express => {

    /**
     * Prefix: /auth
     * Routes:
     * - POST /<oauth2provider> - login/register with oauth2 provider ex. google, discord
     * - DELETE /<oauth2provider> - disconnect oauth2 provider from the account
     * - DELETE / - end session
     * - GET /availability - returns info about oauth2 provider availability
     */

    const oauthExchange = (type: UserConnectionType) => async (req: Request, res: Response) => {
        const code = req.body?.code
        if (typeof code !== 'string') {
            return res.sendStatus(400)
        }
        
        /**
         * If token was not provided, login/register thru an OAuth2 Provider
         * Else add a connection to the user (allow to login with new OAuth2 Provider)
         */
        const token = extractToken(req)
        try {
            if (!token) {
                return res.json(await authService.loginOrRegisterWithOAuth2(code, type))
            } else {
                const [userId] = await authService.validate(token)
                await authService.addConnection(userId, code, type)
                return res.sendStatus(204)
            }
        } catch (err) {
            if (err instanceof OAuth2ProviderUnavailableError) {
                return res.sendStatus(503)
            }
            if (err instanceof OAuth2InvalidCodeError) {
                return res.sendStatus(400)
            }
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }

    const removeConnection = (type: UserConnectionType) => requiresAuth(async (req, res, userId) => {
        try {
            await authService.removeConnection(userId, type)
            return res.sendStatus(204)
        } catch (err) {
            if (err instanceof CannotRemoveLastUserConnectionError) {
                return res.sendStatus(409)
            }
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    })

    const router = Router()

    router.post('/discord', oauthExchange(UserConnectionType.Discord))
    router.delete('/discord', removeConnection(UserConnectionType.Discord))

    router.post('/google', oauthExchange(UserConnectionType.Google))
    router.delete('/google', removeConnection(UserConnectionType.Google))

    router.post('/github', oauthExchange(UserConnectionType.Github))
    router.delete('/github', removeConnection(UserConnectionType.Github))
    
    router.delete('/', requiresAuth(async (req, res, userId) => {
        const sessionId = req.body.sessionId

        if (typeof sessionId !== 'number') return res.sendStatus(400)

        try {
            await authService.invalidateSession(sessionId, userId)
        } catch (err) {
            return res.sendStatus(500)
        }
    }))

    router.get('/availability', (req, res) => {
        res.json(authService.getAvailability())
    })

    app.use('/auth', router)
    
    return app
}
