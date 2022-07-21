import { Request, Response } from "express";
import { InvalidSessionError } from "../errors";
import { SessionManager } from "../services/SessionManager";
import { extractToken } from "../utils/extractToken";

export const requiresAuth = (sessionManager: SessionManager, callback: (req: Request, res: Response, userId: number)=>void) => async (req: Request, res: Response) => {
    const token = extractToken(req)
    if (!token) return res.sendStatus(401)
    
    try {
        const userId = await sessionManager.validate(token)
        return callback(req, res, userId)
    } catch (err) {
        if (err instanceof InvalidSessionError) {
            return res.sendStatus(403)
        }
        console.log(String(err))
        return res.sendStatus(500)
    }
}
