export type User = {
    id: number,
    username: string,
    avatarUrl: string | null,
    createdAt: string
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
    ownerId: number,
    createdAt: string
}

export type Album = {
    id: number,
    name: string,
    cover: null
}

export type Media = {
    filename: string,
    authorId: number,
    type: 'image' | 'video',
    createdAt: string
}

export type Invite = {
    id: string
    inviter: User | null
    community: Community
    maxUses: number | null
    expiresAt: string | null
}

export type OAuth2Provider = 'discord' | 'google' | 'github'