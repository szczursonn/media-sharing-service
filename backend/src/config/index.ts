import { config } from "dotenv";
config()

export const loadConfig = () => {
    let port: number | undefined = parseInt(process.env['PORT'] ?? '')
    if (isNaN(port)) {
        port = undefined
    }
    let dbPort: number | undefined = parseInt(process.env['DB_PORT'] ?? '')
    if (isNaN(dbPort)) {
        dbPort = undefined
    }

    return {
        port,
        jwtSecret: process.env['JWT_SECRET'],
        discord: {
            clientId: process.env['DISCORD_CLIENTID'],
            clientSecret: process.env['DISCORD_CLIENTSECRET'],
            redirectUri: process.env['DISCORD_REDIRECTURI'],
            mock: process.env['DISCORD_MOCK'] === 'true'
        },
        github: {
            clientId: process.env['GITHUB_CLIENTID'],
            clientSecret: process.env['GITHUB_CLIENTSECRET'],
            redirectUri: process.env['GITHUB_REDIRECTURI'],
            mock: process.env['GITHUB_MOCK'] === 'true'
        },
        google: {
            clientId: process.env['GOOGLE_CLIENTID'],
            clientSecret: process.env['GOOGLE_CLIENTSECRET'],
            redirectUri: process.env['GOOGLE_REDIRECTURI'],
            mock: process.env['GOOGLE_MOCK'] === 'true'
        },
        database: {
            type: process.env['DB_TYPE'],
            filename: process.env['DB_FILENAME'],
            host: process.env['DB_HOST'],
            port: dbPort,
            username: process.env['DB_USERNAME'],
            password: process.env['DB_PASSWORD'],
            name: process.env['DB_NAME']
        },
        mediaStorage: {
            type: process.env['MEDIASTORAGE_TYPE'],
            googleBucketName: process.env['GOOGLE_STORAGE_BUCKETNAME'],
            localDirectory: process.env['LOCALSTORAGE_DIR']
        },
        enviroment: process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
        debug: process.env['DEBUG'] === 'true',
        resetDb: process.env['RESET_DB'] === 'true'
    }
}