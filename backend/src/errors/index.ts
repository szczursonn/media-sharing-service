import { UserConnectionType } from "../types"

export class OAuth2ProviderUnavailableError extends Error {
    public type: UserConnectionType
    
    public constructor(type: UserConnectionType) {
        super(`${type} OAuth2 Provider not available`)
        this.type = type
    }
}

export class OAuth2InvalidCodeError extends Error {}

export class CannotRemoveLastUserConnectionError extends Error {}

export class InvalidSessionError extends Error {}

export class ResourceNotFoundError extends Error {}

export class InsufficientPermissionsError extends Error {}