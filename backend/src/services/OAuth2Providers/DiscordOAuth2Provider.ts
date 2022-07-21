import { OAuth2InvalidCodeError } from "../../errors"
import { OAuth2Provider } from "../AuthService"
import fetch from 'node-fetch'
import { OAuth2Profile } from "../../types"

export class DiscordOAuth2Provider implements OAuth2Provider {
    private clientId: string
    private clientSecret: string
    private redirectUri: string

    public constructor({clientId, clientSecret, redirectUri}: {clientId: string, clientSecret: string, redirectUri: string}) {
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.redirectUri = redirectUri
    }
    public async exchange(code: string): Promise<OAuth2Profile> {
        const token = await this.getToken(code)
        return await this.getProfile(token)
    }

    public async getToken(code: string): Promise<string> {
        const body = new URLSearchParams({
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': this.redirectUri
        })

        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST'
        })

        const tokenData = await tokenResponse.json()

        if (tokenData['error']) {
            const errorDesc = tokenData['error_description']
            if (errorDesc === 'Invalid \"code\" in request.') throw new OAuth2InvalidCodeError()
            throw new Error(errorDesc)
        }

        const access_token = tokenData['access_token']
        const scope = tokenData['scope']

        if (typeof scope !== 'string' || !scope.includes('identify') || typeof access_token !== 'string') {
            throw new Error()
        }

        return access_token
    }

    public async getProfile(token: string): Promise<OAuth2Profile> {

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const userData = await userResponse.json()

        if (userData['error']) {
            throw new Error(userData['error'])
        }

        return {
            id: userData['id'],
            username: `${userData['username']}#${userData['discriminator']}`,
            email: userData['email'],
            avatarUrl: userData['avatar'] ? `https://cdn.discordapp.com/avatars/${userData['id']}/${userData['avatar']}.png` : `https://cdn.discordapp.com/embed/avatars/${userData['discriminator']}.png`
        } as OAuth2Profile
        
    }
}
