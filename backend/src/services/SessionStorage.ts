import { DataSource } from "typeorm";
import { Session } from "../models/Session";

export class SessionStorage {
    private dataSource: DataSource

    public constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    public async save(session: Session): Promise<Session> {
        return await this.dataSource.manager.save(Session, session)
    }

    public async delete(sessionId: number) {
        await this.dataSource.manager.delete(Session, {
            id: sessionId
        })
    }

    public async getById(sessionId: number): Promise<Session | null> {
        return await this.dataSource.manager.findOneBy(Session, {
            id: sessionId
        })
    }

    public async getUserSessions(userId: number): Promise<Session[]> {
        return await this.dataSource.manager.findBy(Session, {
            userId
        })
    }

}