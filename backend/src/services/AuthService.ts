import { InvalidSessionError, ResourceNotFoundError, OAuth2ProviderUnavailableError, CannotRemoveLastUserConnectionError } from "../errors";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { UserConnection } from "../models/UserConnection";
import { AccessToken, OAuth2Profile, SessionPublic, TokenPayload, UserConnectionPublic, UserConnectionType } from "../types";
import jwt from 'jsonwebtoken'
import { validateTokenPayload } from "../types/validators";
import { DataSource } from "typeorm";

export interface OAuth2Provider {
    exchange(code: string): Promise<OAuth2Profile>
}

export class AuthService {
    private dataSource: DataSource
    private jwtSecret: string
    private discordOAuth2Provider?: OAuth2Provider
    private googleOAuth2Provider?: OAuth2Provider
    private githubOAuth2Provider?: OAuth2Provider

    public constructor({dataSource, jwtSecret, discordOAuth2Provider, googleOAuth2Provider, githubOAuth2Provider}: {
        dataSource: DataSource,
        jwtSecret: string,
        discordOAuth2Provider?: OAuth2Provider,
        googleOAuth2Provider?: OAuth2Provider,
        githubOAuth2Provider?: OAuth2Provider
    }) {
        this.dataSource = dataSource
        this.jwtSecret = jwtSecret
        this.discordOAuth2Provider = discordOAuth2Provider
        this.googleOAuth2Provider = googleOAuth2Provider
        this.githubOAuth2Provider = githubOAuth2Provider
    }

    public async loginOrRegisterWithOAuth2(code: string, type: UserConnectionType): Promise<AccessToken> {
        const oauthProvider = this.getOAuth2Service(type)

        const profile = await oauthProvider.exchange(code)
        
        const user = await (await this.dataSource.manager.findOneBy(UserConnection, {foreignId: profile.id}))?.user ?? await this.createUserFromOAuth2(profile, type)
        
        const [_, token] = await this.createSession(user.id)

        return token
    }

    public async addConnection(userId: number, code: string, type: UserConnectionType): Promise<UserConnectionPublic> {
        const oauthProvider = this.getOAuth2Service(type)

        const profile = await oauthProvider.exchange(code)
        
        const connection = new UserConnection()
        connection.foreignId = profile.id
        connection.foreignUsername = profile.username
        connection.type = type
        connection.userId = userId
        
        const saved = await this.dataSource.manager.save(connection)

        return saved.public()
    }

    public async validate(token: string): Promise<[number, number]> {
        const payload = jwt.verify(token, this.jwtSecret) as TokenPayload
        if (!validateTokenPayload(payload)) throw new Error()

        const session = await this.dataSource.manager.findOneBy(Session, {
            id: payload.sessionId
        })
        if (!session) throw new InvalidSessionError()

        return [payload.userId, payload.sessionId]
    }

    public async getUserSessions(userId: number): Promise<SessionPublic[]> {

        const sessions = await this.dataSource.manager.findBy(Session, {
            userId
        })

        return sessions.map(s=>s.public())
    }

    public async invalidateSession(sessionId: number, userId: number): Promise<void> {
        const session = await this.dataSource.manager.findOneBy(Session, {
            userId,
            id: sessionId
        })
        if (!session) throw new ResourceNotFoundError()

        if (session.userId !== userId) throw new Error()

        await this.dataSource.manager.delete(Session, {
            userId,
            id: sessionId
        })
    }

    public async getUserConnections(userId: number): Promise<UserConnectionPublic[]> {
        const connections = await this.dataSource.manager.findBy(UserConnection, {
            userId
        })
        if (connections.length === 0) throw new ResourceNotFoundError()
        return connections.map(c=>c.public())
    }

    public async removeConnection(userId: number, type: UserConnectionType): Promise<void> {

        const c = await this.dataSource.manager.countBy(UserConnection, {
            userId,
            type
        })
        if (c === 0) throw new ResourceNotFoundError()

        const connections = await this.dataSource.manager.findBy(UserConnection, {
            userId
        })

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()
        
        await this.dataSource.manager.delete(UserConnection, {
            userId,
            type
        })
    }

    public getAvailability(): { [key in UserConnectionType]: boolean } {
        return {
            discord: !!this.discordOAuth2Provider,
            google: !!this.googleOAuth2Provider,
            github: !!this.githubOAuth2Provider
        }
    }

    private async createUserFromOAuth2(profile: OAuth2Profile, type: UserConnectionType): Promise<User> {
        return await this.dataSource.transaction(async (transaction) => {
            const user = new User()
            user.username = profile.username
            user.avatarUrl = profile.avatarUrl
            const savedUser = await transaction.save(user)
                
            const connection = new UserConnection()
            connection.foreignId = profile.id
            connection.foreignUsername = profile.username
            connection.type = type
            connection.userId = savedUser.id
            await transaction.save(connection)
            
            return savedUser
        })
    }

    private async createSession(userId: number): Promise<[Session, AccessToken]> {
        const newSession = new Session()
        newSession.userId = userId
        const session = await this.dataSource.manager.save(newSession)
        
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