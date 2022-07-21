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
        database: {

        },
        enviroment: process.env['NODE_ENV'] === 'production' ? 'production' : 'development'
    }
}