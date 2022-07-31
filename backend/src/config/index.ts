import { config } from "dotenv";
config()

export const loadConfig = () => {
    let port: number | undefined = parseInt(process.env['PORT'] ?? '')
    if (isNaN(port)) {
        port = undefined
    }

    return {
        port,
        jwtSecret: process.env['JWT_SECRET'],
        discord: {
            clientId: process.env['DISCORD_CLIENTID'],
            clientSecret: process.env['DISCORD_CLIENTSECRET'],
            redirectUri: process.env['DISCORD_REDIRECTURI']
        },
        github: {
            clientId: process.env['GITHUB_CLIENTID'],
            clientSecret: process.env['GITHUB_CLIENTSECRET'],
            redirectUri: process.env['GITHUB_REDIRECTURI']
        },
        google: {
            clientId: process.env['GOOGLE_CLIENTID'],
            clientSecret: process.env['GOOGLE_CLIENTSECRET'],
            redirectUri: process.env['GOOGLE_REDIRECTURI']
        },
        database: {

        },
        mediaStorage: {
            type: process.env['MEDIASTORAGE_TYPE'],
            googleBucketName: process.env['GOOGLE_STORAGE_BUCKETNAME'],
            localDirectory: process.env['LOCALSTORAGE_DIR']
        },
        enviroment: process.env['NODE_ENV'] === 'production' ? 'production' : 'development'
    }
}