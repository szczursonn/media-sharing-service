import { CannotRemoveLastUserConnectionError, InvalidOAuth2CodeError, UnauthenticatedError, UnavailableOAuth2ProviderError } from "./errors"
import { Community, OAuth2Provider, User, UserConnection, UserSession } from "./types"

export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('token')
    console.log(`GET USER, token: ${!!token}`)
    if (!token) throw new UnauthenticatedError()

    const res = await customFetch('/users/@me', {method: 'GET'})

    const body = await res.json()
    return body as User
}

export const loginOrRegisterWithOAuth2Provider = async (code: string, type: OAuth2Provider): Promise<void> => {
    const res = await customFetch(`/auth/${type}`, {method: 'POST', auth: false, body: JSON.stringify({code})})
    const data = await res.json()
    localStorage.setItem('token', data.token)
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


const API_URL = process.env.REACT_APP_API_URL

const customFetch = async (uri: string, {method, auth=true, body=undefined}: {method: string, auth?: boolean, body?: BodyInit|null}) => {

    const token = localStorage.getItem('token')

    if (auth && !token) throw new UnauthenticatedError()

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
            throw new UnauthenticatedError()
        }
        if (error === 'invalid_oauth2_code') throw new InvalidOAuth2CodeError()
        if (error === 'oauth2_provider_unavailable') throw new UnavailableOAuth2ProviderError()
        if (error === 'cannot_remove_last_connection') throw new CannotRemoveLastUserConnectionError()

        throw new Error(error)
    }

    return res
}