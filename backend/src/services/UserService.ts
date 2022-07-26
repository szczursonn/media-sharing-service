import { CannotRemoveLastUserConnectionError } from "../errors";
import { User } from "../models/User";
import { Community } from "../models/Community";
import { UserConnection } from "../models/UserConnection";
import { UserConnectionType } from "../types";
import { UserStorage } from "./UserStorage";
import { CommunityStorage } from "./CommunityStorage";

export class UserService {
    private userStorage: UserStorage
    private communityStorage: CommunityStorage

    public constructor({userStorage}: {userStorage: UserStorage, communityStorage: CommunityStorage}) {
        this.userStorage = userStorage
    }

    public async getUserById(userId: number): Promise<User | null> {
        return await this.userStorage.getById(userId)
    }

    public async getUserConnections(userId: number): Promise<UserConnection[]> {
        return await this.userStorage.getConnectionsByUserId(userId)
    }

    public async removeUser(userId: number): Promise<void> {
        return await this.userStorage.remove(userId)
    }

    public async removeConnection(userId: number, type: UserConnectionType) {
        const connections = await this.userStorage.getConnectionsByUserId(userId)

        if (connections.length < 2) throw new CannotRemoveLastUserConnectionError()

        return await this.userStorage.removeConnection(userId, type)
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        const user = await this.userStorage.getById(userId)
        if (user === null) throw new Error()

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