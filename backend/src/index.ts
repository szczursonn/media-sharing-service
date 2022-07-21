import 'reflect-metadata'
import { createDataSource } from './createDataSource'
import { createServer } from "./createServer"
import Logger from "./Logger"
import { SessionManager } from './services/SessionManager'
import { MockOAuth2Provider } from './services/OAuth2Providers/MockOAuth2Provider'
import { DiscordOAuth2Provider } from './services/OAuth2Providers/DiscordOAuth2Provider'
import { loadConfig } from './config'
import { UserStorage } from './services/UserStorage'
import { AuthService } from './services/AuthService'

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

    const sessionManager = new SessionManager(dataSource, config.jwtSecret)

    const discordOAuth2Provider = (config.discord.clientId && config.discord.clientSecret && config.discord.redirectUri)
        ? new DiscordOAuth2Provider({
            clientId: config.discord.clientId,
            clientSecret: config.discord.clientSecret,
            redirectUri: config.discord.redirectUri
        })
        : undefined
    if (!discordOAuth2Provider) Logger.warn('Discord OAuth2 configuration missing, will be unavailable')

    const googleOAuth2Provider = new MockOAuth2Provider()

    const githubOAuth2Provider = new MockOAuth2Provider()

    const authService = new AuthService({
        sessionManager,
        userStorage,
        discordOAuth2Provider,
        googleOAuth2Provider,
        githubOAuth2Provider
    })

    const app = await createServer({
        userStorage,
        sessionManager,
        authService
    })
        
    app.listen(config.port, () => {
        Logger.info(`DONE in ${((Date.now()-startDate)/1000).toFixed(2)}s, Express app listening on port ${config.port}`)
    })
}

main().catch(err=>{
    Logger.fatal(`Failed to start the app: ${err}`)
    process.exit(-1)
})
