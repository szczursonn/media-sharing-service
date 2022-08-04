import 'reflect-metadata'
import { createDataSource } from './createDataSource'
import { createServer } from "./createServer"
import Logger from "./Logger"
import { DiscordOAuth2Provider, GithubOAuth2Provider, GoogleOAuth2Provider, MockOAuth2Provider } from './services/OAuth2Providers'
import { loadConfig } from './config'
import { AuthService } from './services/AuthService'
import { UserService } from './services/UserService'
import { CommunityService } from './services/CommunityService'
import { InviteService } from './services/InviteService'
import { AlbumService } from './services/AlbumService'
import { MediaService, MediaStorage } from './services/MediaService'
import { GCPMediaStorage } from './services/MediaStorages/GCPMediaStorage'
import { Storage } from '@google-cloud/storage'
import { LocalMediaStorage } from './services/MediaStorages/LocalMediaStorage'
import { MockMediaStorage } from './services/MediaStorages/MockMediaStorage'

const DEFAULT_PORT = 3000

const main = async () => {
    const startDate = Date.now()
    Logger.info('Starting app...')
    const config = loadConfig()

    if (!config.port) {
        config.port = DEFAULT_PORT
        Logger.warn(`Port defaulted to ${config.port}`)
    }

    if (!config.jwtSecret) {
        Logger.fatal('JWT Secret not supplied [env.JWT_SECRET]')
        process.exit(-1)
    }

    const dataSource = await createDataSource()
    Logger.info(`Connected to database (type: ${dataSource.driver.options.type})`)
    
    const discordOAuth2Provider = (config.discord.clientId && config.discord.clientSecret && config.discord.redirectUri)
        ? new DiscordOAuth2Provider({
            clientId: config.discord.clientId,
            clientSecret: config.discord.clientSecret,
            redirectUri: config.discord.redirectUri
        })
        : undefined
    if (!discordOAuth2Provider) Logger.warn('Discord OAuth2 configuration missing, will be unavailable')
    else Logger.info('Discord OAuth2 OK!')

    const googleOAuth2Provider = (config.google.clientId && config.google.clientSecret && config.google.redirectUri)
        ? new GoogleOAuth2Provider(config.google.clientId, config.google.clientSecret, config.google.redirectUri)
        : undefined
    if (!googleOAuth2Provider) Logger.warn('Google OAuth2 configuration missing, will be unavailable')
    else Logger.info('Google OAuth2 OK!')

    const githubOAuth2Provider = (config.github.clientId && config.github.clientSecret && config.github.redirectUri)
        ? new GithubOAuth2Provider(config.github.clientId, config.github.clientSecret, config.github.redirectUri)
        : undefined
    if (!githubOAuth2Provider) Logger.warn('Github OAuth2 configuration missing, will be unavailable')
    else Logger.info('Github OAuth2 OK!')

    let mediaStorage: MediaStorage

    switch (config.mediaStorage.type) {
        case 'google':
            if (config.mediaStorage.googleBucketName === undefined) {
                Logger.fatal('Missing google cloud storage bucket name [env.GOOGLE_STORAGE_BUCKETNAME]')
                process.exit(-1)
            }
            mediaStorage = new GCPMediaStorage(new Storage(), config.mediaStorage.googleBucketName)
            Logger.info(`Initialized GCP Media Storage (bucket: ${config.mediaStorage.googleBucketName})`)
            break
        case 'local':
            if (config.mediaStorage.localDirectory === undefined) {
                Logger.fatal('Missing local media storage directory [env.LOCALSTORAGE_DIR]')
                process.exit(-1)
            }
            mediaStorage = new LocalMediaStorage(config.mediaStorage.localDirectory)
            Logger.info(`Initialized Local Media Storage (directory: ${config.mediaStorage.localDirectory})`)
            break
        case 'mock':
            mediaStorage = new MockMediaStorage()
            Logger.info('Initialized Mock Media Storage')
            break
        default:
            Logger.fatal(`No such media storage type: ${config.mediaStorage.type}`)
            process.exit(-1)
    }

    const authService = new AuthService({
        dataSource,
        jwtSecret: config.jwtSecret,
        discordOAuth2Provider: new MockOAuth2Provider(),    // dev tmp
        googleOAuth2Provider,
        githubOAuth2Provider
    })
    const userService = new UserService(dataSource)
    const communityService = new CommunityService(dataSource)
    const inviteService = new InviteService(dataSource)
    const albumService = new AlbumService(dataSource)
    const mediaService = new MediaService(dataSource, mediaStorage)

    const app = await createServer({
        authService,
        userService,
        communityService,
        inviteService,
        albumService,
        mediaService
    })
        
    app.listen(config.port, () => {
        Logger.info(`DONE in ${((Date.now()-startDate)/1000).toFixed(2)}s, Express app listening on port ${config.port}`)
    })
}

main().catch(err=>{
    Logger.fatal(`Failed to start the app: ${err}`)
    process.exit(-1)
})
