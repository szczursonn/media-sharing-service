import cors from 'cors'
import express from 'express'
import { createTestDataSource } from './createDataSource'
import Logger from './Logger'
import { createRequiresAuth, httpLogger } from './middlewares'
import { setupAuthRoutes, setupUserRoutes } from './routes'
import { AuthService } from './services/AuthService'
import { MockOAuth2Provider } from './services/OAuth2Providers'
import { SessionStorage } from './services/SessionStorage'
import { UserService } from './services/UserService'
import { UserStorage } from './services/UserStorage'

export const createServer = async ({
    userService,
    authService
}: {
    userService: UserService
    authService: AuthService
}) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(httpLogger)

    const requiresAuth = createRequiresAuth(authService)
    
    setupAuthRoutes(app, requiresAuth, authService)
    setupUserRoutes(app, requiresAuth, userService)

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
    const userService = new UserService({
        userStorage
    })

    const app = await createServer({
        userService,
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