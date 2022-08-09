import cors from 'cors'
import express from 'express'
import { createTestDataSource } from './createDataSource'
import { createRequiresAuth, httpLogger } from './middlewares'
import { setupRoutes } from './routes'
import { AlbumService } from './services/AlbumService'
import { AuthService } from './services/AuthService'
import { CommunityService } from './services/CommunityService'
import { InviteService } from './services/InviteService'
import { MediaService } from './services/MediaService'
import { MockMediaStorage } from './services/MediaStorages/MockMediaStorage'
import { MockOAuth2Provider } from './services/OAuth2Providers'
import { UserService } from './services/UserService'
import { AppServices } from './types'

export const createServer = async (services: AppServices) => {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(httpLogger)

    const requiresAuth = createRequiresAuth(services.authService)
    
    setupRoutes(app, requiresAuth, services)

    return app
}

export const createTestServer = async () => {
    const dataSource = await createTestDataSource()
    
    const mediaStorage = new MockMediaStorage()

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
    const albumService = new AlbumService(dataSource, mediaStorage)
    const mediaService = new MediaService(dataSource, mediaStorage)

    const app = await createServer({
        userService,
        authService,
        communityService,
        inviteService,
        albumService,
        mediaService
    })

    return {
        app,
        dataSource,
        authService,
        userService,
        communityService
    }
}