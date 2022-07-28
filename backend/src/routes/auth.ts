import { Express, Router, Request, Response } from 'express'
import { OAuth2InvalidCodeError, OAuth2ProviderUnavailableError } from '../errors'
import Logger from '../Logger'
import { requiresAuth } from '../middlewares'
import { AppServices } from '../types'
import { UserConnectionType } from '../types'
import { extractToken } from '../utils/extractToken'

export const setupAuthRoutes = (app: Express, requiresAuth: requiresAuth, {authService}: AppServices): Express => {

    /**
     * Prefix: /auth
     * Routes:
     * - POST /<oauth2provider> - login/register with oauth2 provider ex. google, discord
     * - GET /sessions - returns current user sessions
     * - DELETE /sessions/<sessionId> - terminates session
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

    const router = Router()

    router.post('/discord', oauthExchange('discord'))

    router.post('/google', oauthExchange('google'))

    router.post('/github', oauthExchange('github'))
    
    router.get('/sessions', requiresAuth(async (req, res, userId) => {
        try {
            const sessions = await authService.getUserSessions(userId)
            return res.json(sessions)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.delete('/sessions/:sessionId', requiresAuth(async (req, res, userId) => {
        try {
            const sessionId = parseInt(req.params.sessionId)
            if (isNaN(sessionId)) return res.sendStatus(400)
            await authService.invalidateSession(sessionId, userId)
            return res.sendStatus(204)
        } catch (err) {
            Logger.err(String(err))
            return res.sendStatus(500)
        }
    }))

    router.get('/availability', (req, res) => {
        res.json(authService.getAvailability())
    })

    app.use('/auth', router)
    
    return app
}
