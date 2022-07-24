import { DataSource } from "typeorm";
import { User } from "../models/User";
import { UserConnection } from "../models/UserConnection";
import { UserConnectionType } from "../types";

export class UserStorage {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async getById(userId: number): Promise<User | null> {
        return await this.dataSource.manager.findOneBy(User, {
            id: userId
        })
    }

    public async getByConnection(foreignId: string, type: UserConnectionType): Promise<User | null> {
        const connection = await this.dataSource.manager.findOneBy(UserConnection, {
            foreignId,
            type
        })
        return await connection?.user ?? null
    }

    public async save(user: User): Promise<User> {
        return await this.dataSource.manager.save(user)
    }

    public async saveConnection(connection: UserConnection): Promise<UserConnection> {
        return await this.dataSource.manager.save(connection)
    }

    public async saveWithConnection(user: User, connection: UserConnection): Promise<User> {
        return await this.dataSource.transaction(async transaction => {
            const savedUser = await transaction.save(user)
            connection.userId = savedUser.id
            await transaction.save(connection)
            
            return await transaction.findOneByOrFail(User, {
                id: savedUser.id
            })
        })
    }

    public async remove(userId: number): Promise<void> {
        await this.dataSource.manager.delete(User, {
            id: userId
        })
    }

    public async removeConnection(userId: number, type: UserConnectionType): Promise<void> {

        await this.dataSource.manager.delete(UserConnection, {
            userId,
            type
        })
    }
}