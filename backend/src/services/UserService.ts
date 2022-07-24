import { User } from "../models/User";
import { UserStorage } from "./UserStorage";

export class UserService {
    private userStorage: UserStorage

    public constructor({userStorage}: {userStorage: UserStorage}) {
        this.userStorage = userStorage
    }

    public async getUserById(userId: number): Promise<User | null> {
        return await this.userStorage.getById(userId)
    }

    public async removeUser(userId: number): Promise<void> {
        return await this.userStorage.remove(userId)
    }

    public async modifyUser(userId: number, {username}: {username?: string}): Promise<User> {
        throw new Error()
    }
}