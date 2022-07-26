import { DataSource } from "typeorm";
import { Community } from "../models/Community";
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

    public async getConnectionsByUserId(userId: number): Promise<UserConnection[]> {
        return await this.dataSource.manager.findBy(UserConnection, {
            userId
        })
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

    public async remove(userId: number): Promise<boolean> {
        const {affected: delResult} = await this.dataSource.transaction(async (transaction) => {
            const communities = await transaction.findBy(Community, {
                ownerId: userId
            })

            await Promise.all(communities.map(async (community) => {
                const members = await community.users
                const newOwner = members.find(m=>m.id!==userId)
                if (newOwner === undefined) {
                    await transaction.remove(community)
                } else {
                    community.ownerId = newOwner.id
                    await transaction.save(community)
                }
            }))

            return await transaction.delete(User, {
                id: userId
            })
        })
        if (typeof delResult === 'number' && delResult === 0) return false
        return true
    }

    public async removeConnection(userId: number, type: UserConnectionType): Promise<boolean> {

        const {affected: delResult} = await this.dataSource.manager.delete(UserConnection, {
            userId,
            type
        })

        if (typeof delResult === 'number' && delResult === 0) return false
        return true
    }
}