import { OAuth2InvalidCodeError } from "../../errors"
import { MockOAuth2Provider } from "./"

describe('Mock OAuth2 Provider tests', () => {
    it('returns profile', async () => {
        const provider = thereIsProvider()
        const profile = await provider.exchange('abcdf')
        expect(profile.id).toBe('abcdf')
    })

    it('can throw invalid code error', async () => {
        const provider = thereIsProvider()
        expect(provider.exchange('invalidcode')).rejects.toThrow(OAuth2InvalidCodeError)
    })

    it('doesnt change id but changes username everytime', async () => {
        const provider = thereIsProvider()
        const profile1 = await provider.exchange('abc')
        expect(profile1.id).toBe('abc')
        const profile2 = await provider.exchange('abc')
        expect(profile2.id).toBe('abc')
        expect(profile1.username === profile2.username).toBe(false)
    })
})

const thereIsProvider = () => new MockOAuth2Provider()