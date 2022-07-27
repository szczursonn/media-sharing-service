import cors from 'cors'
import express from 'express'
import { createTestDataSource } from './createDataSource'
import { createRequiresAuth, httpLogger } from './middlewares'
import { setupAuthRoutes, setupInviteRoutes, setupUserRoutes } from './routes'
import { setupCommunityRoutes } from './routes/community'
import { AuthService } from './services/AuthService'
import { CommunityService } from './services/CommunityService'
import { InviteService } from './services/InviteService'
import { MockOAuth2Provider } from './services/OAuth2Providers'
import { UserService } from './services/UserService'

export const createServer = async ({
    authService,
    userService,
    communityService,
    inviteService
}: {
    authService: AuthService
    userService: UserService
    communityService: CommunityService
    inviteService: InviteService
}) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(httpLogger)

    const requiresAuth = createRequiresAuth(authService)
    
    setupAuthRoutes(app, requiresAuth, authService)
    setupUserRoutes(app, requiresAuth, userService)
    setupCommunityRoutes(app, requiresAuth, communityService)
    setupInviteRoutes(app, inviteService)

    return app
}

export const createTestServer = async () => {
    const dataSource = await createTestDataSource()
    
    const authService = new AuthService({
        dataSource,
        jwtSecret: 'abcdefg',
        discordOAuth2Provider: new MockOAuth2Provider(),
        googleOAuth2Provider: undefined,
        githubOAuth2Provider: new MockOAuth2Provider()
    })
    const userService = new UserService(dataSource)
    const communityService = new CommunityService(dataSource)
    const inviteService = new InviteService(dataSource)

    const app = await createServer({
        userService,
        authService,
        communityService,
        inviteService
    })

    return {
        app,
        dataSource,
        authService,
        userService,
        communityService
    }
}