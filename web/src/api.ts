import { AppError } from "./errors"
import { Album, Community, Invite, Member, OAuth2Provider, User, UserConnection, UserSession } from "./types"

export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('token')
    if (!token) throw new AppError('unauthenticated')

    const res = await customFetch('/users/@me', {method: 'GET'})

    const body = await res.json()
    return body as User
}

export const loginOrRegisterWithOAuth2Provider = async (code: string, type: OAuth2Provider): Promise<void> => {
    const res = await customFetch(`/auth/${type}`, {method: 'POST', auth: false, body: JSON.stringify({code})})
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('sessionId', data.sessionId)
}

export const updateUser = async (username: string): Promise<User> => {
    const res = await customFetch('/users/@me', {method: 'PATCH', body: JSON.stringify({username})})

    const body = await res.json()
    return body as User
}

export const addConnection = async (code: string, type: OAuth2Provider): Promise<void> => {
    await customFetch(`/auth/${type}`, {method: 'POST', body: JSON.stringify({code})})
}

export const getUserSessions = async () => {
    const res = await customFetch('/auth/sessions', {method: 'GET'})

    const body = await res.json()
    return body as UserSession[]
}

export const invalidateSession = async (sessionId: number) => {
    await customFetch(`/auth/sessions/${sessionId}`, {method: 'DELETE'})
}

export const invalidateCurrentSession = async () => {
    try {
        const sessionId = localStorage.getItem('sessionId')
        if (!sessionId) throw new AppError('unauthenticated')
        await invalidateSession(parseInt(sessionId))
    } catch (err) {

    }
    localStorage.removeItem('sessionId')
    localStorage.removeItem('token')
}

export const getUserConnections = async () => {
    const res = await customFetch('/users/@me/connections', {method: 'GET'})

    const body = await res.json()
    return body as UserConnection[]
}

export const removeUserConnection = async (type: OAuth2Provider) => {
    await customFetch(`/users/@me/connections/${type}`, {method: 'DELETE'})
}

export const getUserCommunities = async () => {
    const res = await customFetch('/users/@me/communities', {method: 'GET'})

    const body = await res.json()
    return body as Community[]
}

export const createNewCommunity = async (name: string) => {
    const res = await customFetch('/communities', {method: 'POST', body: JSON.stringify({name})})

    const body = await res.json()
    return body as Community
}

export const getCommunityAlbums = async (communityId: number) => {
    const res = await customFetch(`/communities/${communityId}/albums`, {method: 'GET'})

    const body = await res.json()
    return body as Album[]
}

export const createNewAlbum = async (communityId: number, name: string) => {
    const res = await customFetch(`/communities/${communityId}/albums`, {method: 'POST', body: JSON.stringify({name})})

    const body = await res.json()
    return body as Album
}

export const getInvite = async (inviteId: string) => {
    const res = await customFetch(`/invite/${inviteId}`, {method: 'GET', auth: false})

    const body = await res.json()
    return body as Invite
}

export const acceptInvite = async (inviteId: string) => {
    const res = await customFetch(`/invite/${inviteId}`, {method: 'POST'})

    const body = await res.json()
    return body as Community
}

export const getCommunityMembers = async (communityId: number) => {
    const res = await customFetch(`/communities/${communityId}/members`, {method: 'GET'})

    const body = await res.json()
    return body as Member[]
}

const API_URL = process.env.REACT_APP_API_URL

const customFetch = async (uri: string, {method, auth=true, body=undefined}: {method: string, auth?: boolean, body?: BodyInit|null}) => {

    const token = localStorage.getItem('token')

    if (auth && !token) throw new AppError('unauthenticated')

    const headers: any = auth ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    } : {
        'Content-Type': 'application/json'
    }

    const res = await fetch(`${API_URL}${uri}`, {
        headers,
        method,
        body
    })

    if (!res.ok) {
        const {error} = await res.json()
        
        if (error === 'unauthenticated') {
            localStorage.removeItem('token')
            throw new AppError('unauthenticated')
        }
        if (error === 'invalid_oauth2_code') throw new AppError('invalid_oauth2_code')
        if (error === 'oauth2_provider_unavailable') throw new AppError('unavailable_oauth2_provider')
        if (error === 'cannot_remove_last_connection') throw new AppError('cannot_remove_last_user_connection')
        if (error === 'resource_not_found') throw new AppError('resource_not_found')
        
        throw new Error(error)
    }

    return res
}