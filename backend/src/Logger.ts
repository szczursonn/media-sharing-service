import chalk from 'chalk'
import { NextFunction, Request, Response } from 'express'

enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    DEBUG = 'DEBUG'
}

class Logger {
    private constructor() {}

    private static colorLabel(label: LogLevel): string {
        switch (label) {
            case LogLevel.INFO:
                return chalk.bgGreen(label)
            case LogLevel.WARN:
                return chalk.bgYellow(label)
            case LogLevel.ERROR:
                return chalk.bgRedBright(label)
            case LogLevel.FATAL:
                return chalk.bgRed(label)
            case LogLevel.DEBUG:
                return chalk.bgMagenta(label)
        }
    }

    private static formatDate(timestamp: string) {
        return chalk.bgWhite.black(timestamp)
    }

    private static _log(msg: string, label: LogLevel) {
        const timestamp = `[${new Date().toISOString()}]`

        console.log(`${this.formatDate(timestamp)}${this.colorLabel(label)} ${msg}`)
    }

    public static info(msg: string) {
        this._log(msg, LogLevel.INFO)
    }

    public static warn(msg: string) {
        this._log(msg, LogLevel.WARN)
    }

    public static err(msg: string) {
        this._log(msg, LogLevel.ERROR)
    }

    public static fatal(msg: string) {
        this._log(msg, LogLevel.FATAL)
    }

    public static debug(msg: string) {
        this._log(msg, LogLevel.DEBUG)
    }

    public static middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            Logger.debug(`HTTP ${req.method} : ${req.path}`)
            next()
        }
    }

}

export default Logger