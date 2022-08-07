import { Response } from "express";
import { AlreadyAMemberError, BadFileError, BadRequestError, CannotRemoveLastUserConnectionError, InsufficientPermissionsError, InvalidSessionError, MissingAccessError, OAuth2AlreadyConnectedError, OAuth2InvalidCodeError, OAuth2ProviderUnavailableError, OwnerCannotLeaveCommunityError, ResourceNotFoundError, UnauthenticatedError } from "../errors";
import Logger from "../Logger";

export const genericErrorResponse = (res: Response, err: any) => {
    switch(err?.constructor) {
        case OAuth2InvalidCodeError:
            return res.status(400).json({
                error: 'invalid_oauth2_code'
            })
        case OAuth2ProviderUnavailableError:
            return res.status(503).json({
                error: 'oauth2_provider_unavailable'
            })
        case OAuth2AlreadyConnectedError:
            return res.status(409).json({
                error: 'oauth2_already_connected'
            })
        case CannotRemoveLastUserConnectionError:
            return res.status(409).json({
                error: 'cannot_remove_last_connection'
            })
        case AlreadyAMemberError:
            return res.status(409).json({
                error: 'already_a_member'
            })
        case OwnerCannotLeaveCommunityError:
            return res.status(409).json({
                error: 'owner_cannot_leave_community'
            })
        case MissingAccessError:
        case ResourceNotFoundError:
            return res.status(404).json({
                error: 'resource_not_found'
            })
        case InsufficientPermissionsError:
            return res.status(403).json({
                error: 'missing_permissions'
            })
        case BadRequestError:
            return res.status(400).json({
                error: 'bad_request'
            })
        case InvalidSessionError:   // if token references non-existent session
        case UnauthenticatedError:
            return res.status(401).json({
                error: 'unauthenticated'
            })
        case BadFileError:
            return res.status(400).json({
                error: 'bad_file'
            })
        default:
            Logger.err(err)
            return res.sendStatus(500)
    }
}