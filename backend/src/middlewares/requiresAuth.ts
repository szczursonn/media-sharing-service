import { Request, Response } from "express";
import { UnauthenticatedError } from "../errors";
import { AuthService } from "../services/AuthService";
import { genericErrorResponse } from "../utils";
import { extractToken } from "../utils/extractToken";

export type requiresAuth = (next: (req: Request, res: Response, userId: number, sessionId: number)=>void) => (req: Request, res: Response) => void

export const createRequiresAuth: (authService: AuthService)=>requiresAuth = (authService: AuthService) => (next: (req: Request, res: Response, userId: number, sessionId: number)=>void) => async (req: Request, res: Response) => {
    try {
        const token = extractToken(req)
        if (!token) throw new UnauthenticatedError()
        
        const [userId, sessionId] = await authService.validate(token)
        return next(req, res, userId, sessionId)
    } catch (err) {
        return genericErrorResponse(res, err)
    }
}