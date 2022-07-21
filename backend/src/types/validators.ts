export const validateTokenPayload = (p: any) => {
    if (
        typeof p === 'object' &&
        p !== null &&
        typeof p.userId === 'number' &&
        !isNaN(p.userId) &&
        typeof p.sessionId === 'number' &&
        !isNaN(p.sessionId)
    ) return true
    return false
}

export const validateAccessToken = (t: any) => {
    if (
        typeof t === 'object' &&
        t !== null &&
        typeof t.token === 'string'
    ) return true
    return false
}