import cors from 'cors'
import express from 'express'
import { createTestDataSource } from './createDataSource'
import Logger from './Logger'
import { createRequiresAuth } from './middlewares'
import { setupAuthRoutes, setupUserRoutes } from './routes'
import { AuthService } from './services/AuthService'
import { MockOAuth2Provider } from './services/OAuth2Providers'
import { SessionStorage } from './services/SessionStorage'
import { UserStorage } from './services/UserStorage'

export const createServer = async ({
    userStorage,
    authService
}: {
    userStorage: UserStorage
    authService: AuthService
}) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(Logger.middleware())

    const requiresAuth = createRequiresAuth(authService)
    
    setupAuthRoutes(app, requiresAuth, authService)
    setupUserRoutes(app, requiresAuth, authService, userStorage)

    return app
}

export const createTestServer = async () => {
    const dataSource = await createTestDataSource()
    const userStorage = new UserStorage(dataSource)
    const sessionStorage = new SessionStorage(dataSource)

    const authService = new AuthService({
        userStorage,
        sessionStorage,
        jwtSecret: 'abcdefg',
        discordOAuth2Provider: new MockOAuth2Provider(),
        googleOAuth2Provider: undefined,
        githubOAuth2Provider: new MockOAuth2Provider()
    })

    const app = await createServer({
        userStorage,
        authService
    })

    return {
        app,
        dataSource,
        authService,
        userStorage,
        sessionStorage
    }
}