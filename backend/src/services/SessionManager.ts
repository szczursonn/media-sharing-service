import { DataSource } from "typeorm";
import { Session } from "../models/Session";
import jwt from 'jsonwebtoken'
import { InvalidSessionError } from "../errors";
import { AccessToken, TokenPayload } from "../types";
import { validateTokenPayload } from "../types/validators";

export class SessionManager {
    private dataSource: DataSource
    private jwtSecret: string

    public constructor(dataSource: DataSource, jwtSecret: string) {
        this.dataSource = dataSource,
        this.jwtSecret = jwtSecret
    }
    
    public async createSession(userId: number): Promise<Session> {
        const session = new Session()
        session.userId = userId
        const savedSession = this.dataSource.manager.save(Session, session)
        return savedSession
    }

    public generateSessionToken(sessionId: number, userId: number): AccessToken {
        const payload: TokenPayload = {
            userId,
            sessionId
        }
        const token = jwt.sign(payload, this.jwtSecret)
        return {
            token
        }
    }

    public async invalidateSession(sessionId: number) {
        await this.dataSource.manager.delete(Session, {
            id: sessionId
        })
    }

    public async validate(token: string): Promise<number> {
        const payload = jwt.verify(token, this.jwtSecret) as TokenPayload
        if (!validateTokenPayload(payload)) throw new Error()
        const session = await this.dataSource.manager.findOneBy(Session, {
            id: payload.sessionId,
            userId: payload.userId
        })

        if (!session) throw new InvalidSessionError()

        return payload.userId
    }
}