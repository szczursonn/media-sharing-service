import { Express, Router, Request, Response } from 'express'
import { UAParser } from 'ua-parser-js'
import { BadRequestError } from '../errors'
import { requiresAuth } from '../middlewares'
import { AppServices } from '../types'
import { UserConnectionType } from '../types'
import { genericErrorResponse } from '../utils'
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
            throw new BadRequestError()
        }
        
        /**
         * If token was not provided, login/register thru an OAuth2 Provider
         * Else add a connection to the user (allow to login with new OAuth2 Provider)
         */
        const token = extractToken(req)
        try {
            if (!token) {
                const ua = UAParser(req.headers['user-agent'])
                const deviceName = `${ua.os.name ? `${ua.os.name} ${ua.os.version}` : ua.ua} ${ua.device.model || ua.browser.name}`
                
                return res.json(await authService.loginOrRegisterWithOAuth2(code, type, deviceName))
            } else {
                const [userId] = await authService.validate(token)
                await authService.addConnection(userId, code, type)
                return res.sendStatus(204)
            }
        } catch (err) {
            return genericErrorResponse(res, err)
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
            return genericErrorResponse(res, err)
        }
    }))

    router.delete('/sessions/:sessionId', requiresAuth(async (req, res, userId) => {
        try {
            const sessionId = parseInt(req.params.sessionId)
            if (isNaN(sessionId)) throw new BadRequestError()
            await authService.invalidateSession(sessionId, userId)
            return res.sendStatus(204)
        } catch (err) {
            return genericErrorResponse(res, err)
        }
    }))

    router.get('/availability', (req, res) => {
        res.json(authService.getAvailability())
    })

    app.use('/auth', router)
    
    return app
}
