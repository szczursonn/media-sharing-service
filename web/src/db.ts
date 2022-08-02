import { UnauthenticatedError } from "./errors"
import { OAuth2Provider, User, UserSession } from "./types"

const BASE_URL = 'http://localhost:3000'

export const getCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('token')
    if (!token) throw new UnauthenticatedError()

    const res = await fetch(`${BASE_URL}/users/@me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    const body = await res.json()
    return body as User
}

export const loginOrRegisterWithOAuth2Provider = async (code: string, type: OAuth2Provider) => {
    const res = await fetch(`${BASE_URL}/auth/${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({code})
    })
    const data = await res.json()
    localStorage.setItem('token', data.token)
}

export const getUserSessions = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new UnauthenticatedError()

    const res = await fetch(`${BASE_URL}/auth/sessions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    const body = await res.json()
    return body as UserSession[]
}

export const invalidateSession = async (sessionId: number) => {
    const token = localStorage.getItem('token')
    if (!token) throw new UnauthenticatedError()

    await fetch(`${BASE_URL}/auth/sessions/${sessionId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        method: 'DELETE'
    })
}