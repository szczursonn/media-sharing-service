import 'reflect-metadata'
import { createDataSource } from './createDataSource'
import { createServer } from "./createServer"
import Logger from "./Logger"
import { DiscordOAuth2Provider, MockOAuth2Provider } from './services/OAuth2Providers'
import { loadConfig } from './config'
import { UserStorage } from './services/UserStorage'
import { AuthService } from './services/AuthService'
import { SessionStorage } from './services/SessionStorage'
import { UserService } from './services/UserService'
import { CommunityStorage } from './services/CommunityStorage'
import { CommunityService } from './services/CommunityService'
import { GithubOAuth2Provider } from './services/OAuth2Providers/GithubOAuth2Provider'

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
        Logger.fatal('JWT Secret not supplied')
        process.exit(-1)
    }

    const dataSource = await createDataSource()
    Logger.info('Connected to database')
    
    const userStorage = new UserStorage(dataSource)
    const sessionStorage = new SessionStorage(dataSource)
    const communityStorage = new CommunityStorage(dataSource)

    const discordOAuth2Provider = (config.discord.clientId && config.discord.clientSecret && config.discord.redirectUri)
        ? new DiscordOAuth2Provider({
            clientId: config.discord.clientId,
            clientSecret: config.discord.clientSecret,
            redirectUri: config.discord.redirectUri
        })
        : undefined
    if (!discordOAuth2Provider) Logger.warn('Discord OAuth2 configuration missing, will be unavailable')

    const googleOAuth2Provider = undefined
    if (!googleOAuth2Provider) Logger.warn('Google OAuth2 not implemented, will be unavailable')

    const githubOAuth2Provider = (config.github.clientId && config.github.clientSecret && config.github.redirectUri)
        ? new GithubOAuth2Provider(config.github.clientId, config.github.clientSecret, config.github.redirectUri)
        : undefined
    if (!githubOAuth2Provider) Logger.warn('Github OAuth2 configuration missing, will be unavailable')

    const authService = new AuthService({
        userStorage,
        sessionStorage,
        jwtSecret: config.jwtSecret,
        discordOAuth2Provider,
        googleOAuth2Provider,
        githubOAuth2Provider
    })
    const userService = new UserService({
        userStorage,
        communityStorage
    })
    const communityService = new CommunityService(communityStorage)

    const app = await createServer({
        authService,
        userService,
        communityService
    })
        
    app.listen(config.port, () => {
        Logger.info(`DONE in ${((Date.now()-startDate)/1000).toFixed(2)}s, Express app listening on port ${config.port}`)
    })
}

main().catch(err=>{
    Logger.fatal(`Failed to start the app: ${err}`)
    process.exit(-1)
})
