import { AppError } from "../errors"

const API_URL = process.env.REACT_APP_API_URL

export const customFetch = async (uri: string, {method, auth=true, body=undefined}: {method: string, auth?: boolean, body?: BodyInit|null}) => {

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