import { NextFunction, Request, Response } from 'express'
import Logger from '../Logger'

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    const isJson = req.headers['content-type'] === 'application/json'
    Logger.debug(`[${req.ip}]: ${req.method} ${req.originalUrl} , ${isJson ? `body: ${JSON.stringify(req.body)}` : req.headers['content-type']}`)
    next()
}