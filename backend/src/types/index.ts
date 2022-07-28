import { AuthService } from './services/AuthService'
import { CommunityService } from './services/CommunityService'
import { InviteService } from './services/InviteService'
import { UserService } from './services/UserService'

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
    userService: UserService
}

export type MediaType = 'image' | 'video'

// WIP - TYPES TO BE RETURNED FROM SERVICES INSTEAD OF TYPEORM CLASSES

type User = {
    id: number
    username: string
    avatarUrl: string | null
    connections: UserConnection[] | null
    sessions: Session[] | null
    createdAt: Date
}

type Community = {
    id: number
    name: string
    ownerId: number
    createdAt: Date
}

type UserConnection = {
    type: UserConnectionType
    foreignId: string
    foreignUsername: string
    createdAt: Date
}

type Session = {
    id: number
    deviceName: string
    createdAt: Date
}

type CommunityMember = {
    user: User
    canUpload: boolean
    joinedAt: Date
}

// GET /invites/:id
type CommunityInvitePublicInfo = {
    id: string
    inviter: User | null
    community: Community
}

// GET /communities/:communityId/invites
type CommunityInvite = {
    id: string
    inviter: User | null
    uses: number
    maxUses: number | null
    expiresAt: Date | null
}