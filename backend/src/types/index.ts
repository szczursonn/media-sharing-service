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