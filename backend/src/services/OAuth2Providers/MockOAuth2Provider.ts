import { OAuth2InvalidCodeError } from "../../errors";
import { OAuth2Profile } from "../../types";
import { OAuth2Provider } from "../AuthService";

export class MockOAuth2Provider implements OAuth2Provider {
    private counter: number

    public constructor() {
        this.counter = 1
    }

    public async exchange(code: string): Promise<OAuth2Profile> {
        if (code === 'invalidcode') throw new OAuth2InvalidCodeError()
        return {
            id: code,
            username: `maciek-${++this.counter}-${code}`
        }
    }
    
}