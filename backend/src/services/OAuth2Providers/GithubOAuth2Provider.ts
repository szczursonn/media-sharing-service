import { OAuth2Profile } from "../../types";
import { OAuth2InvalidCodeError } from "../../errors"
import { OAuth2Provider } from "../AuthService";
import fetch from 'node-fetch'
import Logger from "../../Logger";

export class GithubOAuth2Provider implements OAuth2Provider {
    private clientId: string
    private clientSecret: string
    private redirectUri: string

    public constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.redirectUri = redirectUri
    }

    public async exchange(code: string): Promise<OAuth2Profile> {
        const body = new URLSearchParams({
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': this.redirectUri
        })

        const res1 = await fetch('https://github.com/login/oauth/access_token', {
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            method: 'POST'
        })

        const body1 = await res1.json()
        if (body1.error) {
            if (body1.error === 'bad_verification_code') throw new OAuth2InvalidCodeError()
            throw new Error()
        }
        
        const token = body1['access_token']

        if (typeof token !== 'string') throw new Error()
        
        const res2 = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const profile = await res2.json()

        return {
            id: profile.id,
            username: profile.login,
            avatarUrl: profile.avatar_url,
            email: profile.email ?? undefined
        }
    }
}