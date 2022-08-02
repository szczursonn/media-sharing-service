export type User = {
    id: number,
    username: string,
    avatarUrl: string | null
}

export type UserSession = {
    id: number,
    deviceName: string | null,
    createdAt: string
}

export type OAuth2Provider = 'discord' | 'google' | 'github'