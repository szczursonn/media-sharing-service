import cors from 'cors'
import express from 'express'
import { createTestDataSource } from './createDataSource'
import Logger from './Logger'
import { setupAuthRoutes } from './routes/auth'
import { setupUserRoutes } from './routes/user'
import { AuthService } from './services/AuthService'
import { MockOAuth2Provider } from './services/OAuth2Providers/MockOAuth2Provider'
import { SessionManager } from './services/SessionManager'
import { UserStorage } from './services/UserStorage'

export const createServer = async ({
    userStorage,
    sessionManager,
    authService
}: {
    userStorage: UserStorage,
    sessionManager: SessionManager
    authService: AuthService
}) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(Logger.middleware())
    
    setupAuthRoutes(app, sessionManager, authService)
    setupUserRoutes(app, sessionManager, userStorage)

    return app
}

export const createTestServer = async () => {
    const dataSource = await createTestDataSource()
    const userStorage = new UserStorage(dataSource)
    const sessionManager = new SessionManager(dataSource, 'abcdefgh')
    const app = await createServer({
        userStorage,
        sessionManager,
        authService: new AuthService({
            sessionManager,
            userStorage,
            discordOAuth2Provider: new MockOAuth2Provider(),
            googleOAuth2Provider: undefined,
            githubOAuth2Provider: new MockOAuth2Provider()
        })
    })

    return {
        app,
        dataSource,
        sessionManager,
        userStorage
    }
}