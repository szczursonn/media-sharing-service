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

export type UserConnection = {
    foreignId: string,
    foreignUsername: string,
    createdAt: string,
    type: OAuth2Provider
}

export type Community = {
    id: number,
    name: string,
    createdAt: string
}

export type Album = {
    id: number,
    name: string
}

export type OAuth2Provider = 'discord' | 'google' | 'github'