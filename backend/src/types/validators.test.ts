import { validateAccessToken, validateTokenPayload } from "./validators"

describe('test validators', () => {
    it('validates AccessToken', () => {
        expect(validateAccessToken({})).toBe(false)
        
        expect(validateAccessToken('a')).toBe(false)

        expect(validateAccessToken(null)).toBe(false)

        expect(validateAccessToken({
            token: 'dgfshiuygdsfgjsfgh'
        })).toBe(true)

        expect(validateAccessToken({
            token: ''
        })).toBe(true)

        expect(validateAccessToken({
            token: undefined
        })).toBe(false)

        expect(validateAccessToken({
            token: new String()
        })).toBe(false)

    })

    it('validates TokenPayload', () => {
        expect(validateTokenPayload({})).toBe(false)
        
        expect(validateTokenPayload('a')).toBe(false)

        expect(validateTokenPayload(null)).toBe(false)

        expect(validateTokenPayload({
            userId: 1,
            sessionId: 1
        })).toBe(true)

        expect(validateTokenPayload({
            userId: NaN,
            sessionId: 1
        })).toBe(false)

        expect(validateTokenPayload({
            userId: 5,
            sessionId: undefined
        })).toBe(false)
    })
})