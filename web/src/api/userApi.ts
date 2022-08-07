import { customFetch } from "."
import { AppError } from "../errors"
import { Community, OAuth2Provider, User, UserConnection, UserSession } from "../types"

const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('token')
    if (!token) throw new AppError('unauthenticated')

    const res = await customFetch('/users/@me', {method: 'GET'})

    const body = await res.json()
    return body as User
}

const loginOrRegisterWithOAuth2Provider = async (code: string, type: OAuth2Provider): Promise<void> => {
    const res = await customFetch(`/auth/${type}`, {method: 'POST', auth: false, body: JSON.stringify({code})})
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('sessionId', data.sessionId)
}

const updateUser = async (username: string): Promise<User> => {
    const res = await customFetch('/users/@me', {method: 'PATCH', body: JSON.stringify({username})})

    const body = await res.json()
    return body as User
}

const addConnection = async (code: string, type: OAuth2Provider): Promise<void> => {
    await customFetch(`/auth/${type}`, {method: 'POST', body: JSON.stringify({code})})
}

const getUserSessions = async () => {
    const res = await customFetch('/auth/sessions', {method: 'GET'})

    const body = await res.json()
    return body as UserSession[]
}

const invalidateSession = async (sessionId: number) => {
    await customFetch(`/auth/sessions/${sessionId}`, {method: 'DELETE'})
}

const invalidateCurrentSession = async () => {
    try {
        const sessionId = localStorage.getItem('sessionId')
        if (!sessionId) throw new AppError('unauthenticated')
        await invalidateSession(parseInt(sessionId))
    } catch (err) {

    }
    localStorage.removeItem('sessionId')
    localStorage.removeItem('token')
}

const getUserConnections = async () => {
    const res = await customFetch('/users/@me/connections', {method: 'GET'})

    const body = await res.json()
    return body as UserConnection[]
}

const removeUserConnection = async (type: OAuth2Provider) => {
    await customFetch(`/users/@me/connections/${type}`, {method: 'DELETE'})
}

const getUserCommunities = async () => {
    const res = await customFetch('/users/@me/communities', {method: 'GET'})

    const body = await res.json()
    return body as Community[]
}

const deleteCurrentUser = async () => {
    await customFetch('/users/@me', {method: 'DELETE'})
}

const userApi = {
    getCurrentUser,
    loginOrRegisterWithOAuth2Provider,
    updateUser,
    addConnection,
    getUserSessions,
    invalidateSession,
    invalidateCurrentSession,
    getUserConnections,
    removeUserConnection,
    getUserCommunities,
    deleteCurrentUser
}

export default userApi