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

    public constructor({userStorage}: {userStorage: UserStorage, communityStorage: CommunityStorage}) {
        this.userStorage = userStorage
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
        // TODO: throw on noop
        return await this.userStorage.remove(userId)
    }

    public async removeConnection(userId: number, type: UserConnectionType) {
        const connections = await this.userStorage.getConnectionsByUserId(userId)

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()
        // TODO: throw on noop
        return await this.userStorage.removeConnection(userId, type)
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        const user = await this.userStorage.getById(userId)
        if (user === null) throw new ResourceNotFoundError()

        if (username) user.username = username
        
        return await this.userStorage.save(user)
    }

    public async leaveCommunity(userId: number, communityId: number): Promise<void> {
        // TODO: throw if nothing was deleted
        await this.communityStorage.removeMember(userId, communityId)
    }

    public async getUserCommunities(userId: number): Promise<Community[]> {
        return await this.communityStorage.getByUserId(userId)
    }
}