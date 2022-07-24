export type AccessToken = {
    token: string
}

export type OAuth2Profile = {
    id: string,
    username: string,
    avatarUrl?: string,
    email?: string
}

export type TokenPayload = {
    userId: number,
    sessionId: number
}

export type UserConnectionType = 'google' | 'discord' | 'github'
