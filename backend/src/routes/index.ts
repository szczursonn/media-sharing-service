import { setupCommunityRoutes } from './community'
import { AppServices } from '../types'
import { setupUserRoutes } from './user'
import { setupInviteRoutes } from './invite'
import { setupAuthRoutes } from './auth'
import { Express } from 'express'
import { requiresAuth } from '../middlewares'
import { setupAlbumRoutes } from './album'

export const setupRoutes = (app: Express, requiresAuth: requiresAuth, services: AppServices) => {
    setupAuthRoutes(app, requiresAuth, services)
    setupUserRoutes(app, requiresAuth, services)
    setupCommunityRoutes(app, requiresAuth, services)
    setupInviteRoutes(app, requiresAuth, services)
    setupAlbumRoutes(app, requiresAuth, services)
    return app
}