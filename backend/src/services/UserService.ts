import { CannotRemoveLastUserConnectionError } from "../errors";
import { User } from "../models/User";
import { Community } from "../models/Community";
import { UserConnection } from "../models/UserConnection";
import { UserConnectionType } from "../types";
import { UserStorage } from "./UserStorage";
import { CommunityStorage } from "./CommunityStorage";
import { ResourceNotFoundError } from "../errors"

export class UserService {
    private userStorage: UserStorage
    private communityStorage: CommunityStorage

    public constructor({userStorage, communityStorage}: {userStorage: UserStorage, communityStorage: CommunityStorage}) {
        this.userStorage = userStorage
        this.communityStorage = communityStorage
    }

    public async getUserById(userId: number): Promise<User> {
        const user = await this.userStorage.getById(userId)
        if (!user) throw new ResourceNotFoundError()
        return user
    }

    public async getUserConnections(userId: number): Promise<UserConnection[]> {
        const connections = await this.userStorage.getConnectionsByUserId(userId)
        if (connections.length < 1) throw new ResourceNotFoundError()
        return connections
    }

    public async removeUser(userId: number): Promise<void> {
        const deleted = await this.userStorage.remove(userId)
        if (!deleted) throw new ResourceNotFoundError()
    }

    public async removeConnection(userId: number, type: UserConnectionType): Promise<void> {
        const connections = await this.userStorage.getConnectionsByUserId(userId)

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()
        
        const deleted = await this.userStorage.removeConnection(userId, type)
        if (!deleted) throw new ResourceNotFoundError()
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        const user = await this.userStorage.getById(userId)
        if (user === null) throw new ResourceNotFoundError()

        if (username) user.username = username
        
        return await this.userStorage.save(user)
    }

    public async leaveCommunity(userId: number, communityId: number): Promise<void> {
        const deleted = await this.communityStorage.removeMember(userId, communityId)
        if (!deleted) throw new ResourceNotFoundError()
    }

    public async getUserCommunities(userId: number): Promise<Community[]> {
        return await this.communityStorage.getByUserId(userId)
    }
}