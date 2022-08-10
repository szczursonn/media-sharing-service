import chalk from 'chalk'

enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    DEBUG = 'DEBUG'
}

class Logger {
    private constructor() {}
    public static debugEnabled = true

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

    private static _log(msg: any, label: LogLevel) {
        const timestamp = `[${new Date().toISOString()}]`

        const _msg = (msg instanceof Error) ? `${msg.name}: ${msg.stack}` : `${msg}`

        console.log(`${this.formatDate(timestamp)}${this.colorLabel(label)} ${_msg}`)
    }

    public static info(msg: any) {
        this._log(msg, LogLevel.INFO)
    }

    public static warn(msg: any) {
        this._log(msg, LogLevel.WARN)
    }

    public static err(msg: any) {
        this._log(msg, LogLevel.ERROR)
    }

    public static fatal(msg: any) {
        this._log(msg, LogLevel.FATAL)
    }

    public static debug(msg: any) {
        if(this.debugEnabled) this._log(msg, LogLevel.DEBUG)
    }

}

export default Logger