import { InvalidSessionError, OAuth2ProviderUnavailableError } from "../errors";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { UserConnection } from "../models/UserConnection";
import { AccessToken, OAuth2Profile, TokenPayload, UserConnectionType } from "../types";
import { SessionStorage } from "./SessionStorage";
import { UserStorage } from "./UserStorage";
import jwt from 'jsonwebtoken'
import { validateTokenPayload } from "../types/validators";

export interface OAuth2Provider {
    exchange(code: string): Promise<OAuth2Profile>
}

export class AuthService {
    private userStorage: UserStorage
    private sessionStorage: SessionStorage
    private jwtSecret: string
    private discordOAuth2Provider?: OAuth2Provider
    private googleOAuth2Provider?: OAuth2Provider
    private githubOAuth2Provider?: OAuth2Provider

    public constructor({userStorage, sessionStorage, jwtSecret, discordOAuth2Provider, googleOAuth2Provider, githubOAuth2Provider}: {
        userStorage: UserStorage,
        sessionStorage: SessionStorage,
        jwtSecret: string,
        discordOAuth2Provider?: OAuth2Provider,
        googleOAuth2Provider?: OAuth2Provider,
        githubOAuth2Provider?: OAuth2Provider
    }) {
        this.userStorage = userStorage
        this.sessionStorage = sessionStorage
        this.jwtSecret = jwtSecret
        this.discordOAuth2Provider = discordOAuth2Provider
        this.googleOAuth2Provider = googleOAuth2Provider
        this.githubOAuth2Provider = githubOAuth2Provider
    }

    public async loginOrRegisterWithOAuth2(code: string, type: UserConnectionType): Promise<AccessToken> {
        const oauthProvider = this.getOAuth2Service(type)

        const profile = await oauthProvider.exchange(code)
        
        const user = await this.userStorage.getByConnection(profile.id, type) ?? await this.createUserFromOAuth2(profile, type)
        
        const [_, token] = await this.createSession(user.id)

        return token
    }

    public async addConnection(userId: number, code: string, type: UserConnectionType): Promise<UserConnection> {
        const oauthProvider = this.getOAuth2Service(type)

        const profile = await oauthProvider.exchange(code)

        const connection = new UserConnection()
        connection.foreignId = profile.id
        connection.foreignUsername = profile.username
        connection.type = type
        connection.userId = userId
        
        return await this.userStorage.saveConnection(connection)
    }

    public async validate(token: string): Promise<[number, number]> {
        const payload = jwt.verify(token, this.jwtSecret) as TokenPayload
        if (!validateTokenPayload(payload)) throw new Error()
        const session = await this.sessionStorage.getById(payload.sessionId)
        if (!session) throw new InvalidSessionError()

        return [payload.userId, payload.sessionId]
    }

    public async getUserSessions(userId: number): Promise<Session[]> {
        return await this.sessionStorage.getUserSessions(userId)
    }

    public async invalidateSession(sessionId: number, userId: number) {
        const session = await this.sessionStorage.getById(sessionId)
        if (!session) throw new Error()

        if (session.userId !== userId) throw new Error()

        await this.sessionStorage.delete(sessionId)
    }

    public getAvailability(): { [key in UserConnectionType]: boolean } {
        return {
            discord: !!this.discordOAuth2Provider,
            google: !!this.googleOAuth2Provider,
            github: !!this.githubOAuth2Provider
        }
    }

    private async createUserFromOAuth2(profile: OAuth2Profile, type: UserConnectionType): Promise<User> {
        const user = new User()
        user.username = profile.username
        user.avatarUrl = profile.avatarUrl
            
        const connection = new UserConnection()
        connection.foreignId = profile.id
        connection.foreignUsername = profile.username
        connection.type = type
        
        return await this.userStorage.saveWithConnection(user, connection)
    }

    private async createSession(userId: number): Promise<[Session, AccessToken]> {
        const newSession = new Session()
        newSession.userId = userId
        const session = await this.sessionStorage.save(newSession)
        
        const payload: TokenPayload = {
            userId: userId,
            sessionId: session.id
        }
        const token = jwt.sign(payload, this.jwtSecret)

        return [session, {token}]
    }

    private getOAuth2Service(type: UserConnectionType): OAuth2Provider {
        switch (type) {
            case 'discord':
                if (!this.discordOAuth2Provider) throw new OAuth2ProviderUnavailableError('discord')
                return this.discordOAuth2Provider
            case 'google':
                if (!this.googleOAuth2Provider) throw new OAuth2ProviderUnavailableError('google')
                return this.googleOAuth2Provider
            case 'github':
                if (!this.githubOAuth2Provider) throw new OAuth2ProviderUnavailableError('github')
                return this.githubOAuth2Provider
        }
    }
}