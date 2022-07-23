import { Request, Response } from "express";
import { InvalidSessionError } from "../errors";
import { AuthService } from "../services/AuthService";
import { extractToken } from "../utils/extractToken";

export type requiresAuth = (next: (req: Request, res: Response, userId: number, sessionId: number)=>void) => (req: Request, res: Response) => void

export const createRequiresAuth: (authService: AuthService)=>requiresAuth = (authService: AuthService) => (next: (req: Request, res: Response, userId: number, sessionId: number)=>void) => async (req: Request, res: Response) => {
    const token = extractToken(req)
    if (!token) return res.sendStatus(401)
    
    try {
        const [userId, sessionId] = await authService.validate(token)
        return next(req, res, userId, sessionId)
    } catch (err) {
        if (err instanceof InvalidSessionError) {
            return res.sendStatus(403)
        }
        console.log(String(err))
        return res.sendStatus(500)
    }
}