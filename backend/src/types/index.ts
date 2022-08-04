import { Media } from '../models/Media'
import { AlbumService } from '../services/AlbumService'
import { AuthService } from '../services/AuthService'
import { CommunityService } from '../services/CommunityService'
import { InviteService } from '../services/InviteService'
import { MediaService } from '../services/MediaService'
import { UserService } from '../services/UserService'

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

export type AppServices = {
    authService: AuthService,
    communityService: CommunityService,
    inviteService: InviteService,
    userService: UserService,
    albumService: AlbumService,
    mediaService: MediaService
}

export type MediaType = 'image' | 'video'

// WIP - TYPES TO BE RETURNED FROM SERVICES INSTEAD OF TYPEORM CLASSES

export type UserPublic = {
    id: number
    username: string
    avatarUrl: string | null
    createdAt: string
}

export type CommunityPublic = {
    id: number
    name: string
    ownerId: number
    createdAt: string
}

export type UserConnectionPublic = {
    type: UserConnectionType
    foreignId: string
    foreignUsername: string
    createdAt: string
}

export type SessionPublic = {
    id: number
    deviceName: string|null
    createdAt: string
}

export type CommunityMemberPublic = {
    user: UserPublic
    canUpload: boolean
    joinedAt: string
}

export type CommunityInvitePublic = {
    id: string
    inviter: UserPublic | null
    community: CommunityPublic
    maxUses: number | null
    expiresAt: string | null
}

export type AlbumPublic = {
    id: number,
    name: string,
    cover: null
}

export type MediaPublic = {
    filename: string,
    authorId: number,
    type: MediaType,
    createdAt: string
}