import 'reflect-metadata'
import { createDataSource } from './createDataSource'
import { createServer } from "./createServer"
import Logger from "./Logger"
import { DiscordOAuth2Provider, GithubOAuth2Provider, GoogleOAuth2Provider, MockOAuth2Provider } from './services/OAuth2Providers'
import { loadConfig } from './config'
import { AuthService, OAuth2Provider } from './services/AuthService'
import { UserService } from './services/UserService'
import { CommunityService } from './services/CommunityService'
import { InviteService } from './services/InviteService'
import { AlbumService } from './services/AlbumService'
import { MediaService, MediaStorage } from './services/MediaService'
import { GCPMediaStorage } from './services/MediaStorages/GCPMediaStorage'
import { Storage } from '@google-cloud/storage'
import { LocalMediaStorage } from './services/MediaStorages/LocalMediaStorage'
import { MockMediaStorage } from './services/MediaStorages/MockMediaStorage'
import { DataSource } from 'typeorm'

const DEFAULT_PORT = 3000

const main = async () => {
    const startDate = Date.now()
    Logger.info('Starting app...')
    const config = loadConfig()

    Logger.info(`Enviroment: ${config.enviroment}`)
    if (config.debug) Logger.debugEnabled = false

    if (!config.port) {
        config.port = DEFAULT_PORT
        Logger.warn(`Port defaulted to ${config.port}`)
    }

    if (!config.jwtSecret) {
        Logger.fatal('JWT Secret not supplied [env.JWT_SECRET]')
        process.exit(-1)
    }

    const dbType = config.database.type
    let dataSource: DataSource

    switch (dbType) {
        case 'sqlite':
            dataSource = await createDataSource({
                type: 'sqlite',
                filename: config.database.filename ?? ':memory:'
            }, config.resetDb)
            break
        case 'mariadb':
            const host = config.database.host
            const port = config.database.port
            const username = config.database.username
            const password = config.database.password
            const databaseName = config.database.name
            if (!host) {
                Logger.fatal('Missing configuration: DB_HOST')
                process.exit(-1)
            }
            if (!username) {
                Logger.fatal('Missing configuration: DB_USERNAME')
                process.exit(-1)
            }
            if (!databaseName) {
                Logger.fatal('Missing configuration: DB_NAME')
                process.exit(-1)
            }
            dataSource = await createDataSource({
                type: 'mariadb',
                host,
                port,
                username,
                password,
                databaseName
            }, config.resetDb)
            break
        default:
            Logger.fatal(`Invalid database type: ${dbType}`)
            process.exit(-1)
    }
    Logger.info(`Connected to database (${dataSource.driver.options.type}${config.database.type==='sqlite'?'':`@${config.database.host}`})`)
    
    let discordOAuth2Provider: OAuth2Provider|undefined
    if (config.discord.mock) {
        discordOAuth2Provider = new MockOAuth2Provider()
        Logger.warn('Initialized Mock OAuth2 Provider for Discord')
    } else if (config.discord.clientId && config.discord.clientSecret && config.discord.redirectUri) {
        discordOAuth2Provider = new DiscordOAuth2Provider({
            clientId: config.discord.clientId,
            clientSecret: config.discord.clientSecret,
            redirectUri: config.discord.redirectUri
        })
        Logger.info('Discord OAuth2 configuration OK!')
    } else {
        Logger.warn('Discord OAuth2 configuration missing, will be unavailable')
    }

    let googleOAuth2Provider: OAuth2Provider|undefined
    if (config.google.mock) {
        googleOAuth2Provider = new MockOAuth2Provider()
        Logger.warn('Initialized Mock OAuth2 Provider for Google')
    } else if (config.google.clientId && config.google.clientSecret && config.google.redirectUri) {
        googleOAuth2Provider = new GoogleOAuth2Provider(config.google.clientId, config.google.clientSecret, config.google.redirectUri)
        Logger.info('Google OAuth2 configuration OK!')
    } else {
        Logger.warn('Google OAuth2 configuration missing, will be unavailable')
    }

    let githubOAuth2Provider: OAuth2Provider|undefined
    if (config.github.mock) {
        githubOAuth2Provider = new MockOAuth2Provider()
        Logger.warn('Initialized Mock OAuth2 Provider for Github')
    } else if (config.github.clientId && config.github.clientSecret && config.github.redirectUri) {
        githubOAuth2Provider = new GithubOAuth2Provider(config.github.clientId, config.github.clientSecret, config.github.redirectUri)
        Logger.info('Github OAuth2 configuration OK!')
    } else {
        Logger.warn('Github OAuth2 configuration missing, will be unavailable')
    }

    let mediaStorage: MediaStorage
    switch (config.mediaStorage.type) {
        case 'google':
            if (config.mediaStorage.googleBucketName === undefined) {
                Logger.fatal('Missing google cloud storage bucket name [env.GOOGLE_STORAGE_BUCKETNAME]')
                process.exit(-1)
            }
            mediaStorage = new GCPMediaStorage(new Storage(), config.mediaStorage.googleBucketName)
            Logger.info(`Media Storage configuration OK! (type: GCP Media Storage, bucket: ${config.mediaStorage.googleBucketName})`)
            break
        case 'local':
            if (config.mediaStorage.localDirectory === undefined) {
                Logger.fatal('Missing local media storage directory [env.LOCALSTORAGE_DIR]')
                process.exit(-1)
            }
            mediaStorage = new LocalMediaStorage(config.mediaStorage.localDirectory)
            Logger.info(`Media Storage configuration OK (type: local, directory: ${config.mediaStorage.localDirectory})`)
            break
        case 'mock':
            mediaStorage = new MockMediaStorage()
            Logger.info('Media Storage configuration OK (type: mock)')
            break
        default:
            Logger.fatal(`No such media storage type: ${config.mediaStorage.type}`)
            process.exit(-1)
    }

    const authService = new AuthService({
        dataSource,
        jwtSecret: config.jwtSecret,
        discordOAuth2Provider,
        googleOAuth2Provider,
        githubOAuth2Provider
    })
    const userService = new UserService(dataSource)
    const communityService = new CommunityService(dataSource)
    const inviteService = new InviteService(dataSource)
    const albumService = new AlbumService(dataSource, mediaStorage)
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
    Logger.fatal(`Failed to start the app: `)
    Logger.fatal(err)
    process.exit(-1)
})
