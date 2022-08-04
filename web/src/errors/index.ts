export type AppErrorType = 'unauthenticated' | 'invalid_oauth2_code' | 'unavailable_oauth2_provider' | 'cannot_remove_last_user_connection' | 'resource_not_found'

export class AppError extends Error {
    public readonly type: AppErrorType

    public constructor(type: AppErrorType) {
        super(type)
        this.type = type
    }
}