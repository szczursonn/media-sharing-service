import { Request } from "express";

export const extractToken = (req: Request) => req.headers.authorization?.substring(7)?.trim()