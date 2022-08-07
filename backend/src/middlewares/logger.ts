import { NextFunction, Request, Response } from 'express'
import Logger from '../Logger'

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
    Logger.debug(`HTTP REQ [${req.ip}]: ${req.method} ${req.path}`)
    next()
}