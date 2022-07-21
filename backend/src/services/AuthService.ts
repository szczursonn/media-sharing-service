import { CannotRemoveLastUserConnectionError, OAuth2ProviderUnavailableError } from "../errors";
import { User } from "../models/User";
import { UserConnection, UserConnectionType } from "../models/UserConnection";
import { AccessToken, OAuth2Profile } from "../types";
import { SessionManager } from "./SessionManager";
import { UserStorage } from "./UserStorage";

export interface OAuth2Provider {
    exchange(code: string): Promise<OAuth2Profile>
}

export class AuthService {
    private sessionManager: SessionManager
    private userStorage: UserStorage
    private discordOAuth2Provider?: OAuth2Provider
    private googleOAuth2Provider?: OAuth2Provider
    private githubOAuth2Provider?: OAuth2Provider

    public constructor({sessionManager, userStorage, discordOAuth2Provider, googleOAuth2Provider, githubOAuth2Provider}: {
        sessionManager: SessionManager,
        userStorage: UserStorage,
        discordOAuth2Provider?: OAuth2Provider,
        googleOAuth2Provider?: OAuth2Provider,
        githubOAuth2Provider?: OAuth2Provider
    }) {
        this.sessionManager = sessionManager
        this.userStorage = userStorage
        this.discordOAuth2Provider = discordOAuth2Provider
        this.googleOAuth2Provider = googleOAuth2Provider
        this.githubOAuth2Provider = githubOAuth2Provider
    }

    public async loginOrRegisterWithOAuth2(code: string, type: UserConnectionType): Promise<AccessToken> {
        const oauthProvider = this.getOAuth2Service(type)

        const profile = await oauthProvider.exchange(code)
        
        const user = await this.userStorage.getByConnection(profile.id, type) ?? await this.createUserFromOAuth2(profile, type)
        
        const session = await this.sessionManager.createSession(user.id)

        return this.sessionManager.generateSessionToken(session.id, user.id)
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

    public async removeConnection(userId: number, type: UserConnectionType) {
        const user = await this.userStorage.getById(userId)
        if (!user) throw new Error()

        const connections = await user.connections

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()
        await this.userStorage.removeConnection(userId, type)
    }

    public getAvailability() {
        return {
            discord: !!this.discordOAuth2Provider,
            google: !!this.googleOAuth2Provider
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

    private getOAuth2Service(type: UserConnectionType): OAuth2Provider {
        switch (type) {
            case UserConnectionType.Discord:
                if (!this.discordOAuth2Provider) throw new OAuth2ProviderUnavailableError(UserConnectionType.Discord)
                return this.discordOAuth2Provider
            case UserConnectionType.Google:
                if (!this.googleOAuth2Provider) throw new OAuth2ProviderUnavailableError(UserConnectionType.Google)
                return this.googleOAuth2Provider
            case UserConnectionType.Github:
                if (!this.githubOAuth2Provider) throw new OAuth2ProviderUnavailableError(UserConnectionType.Github)
                return this.githubOAuth2Provider
        }
    }
}