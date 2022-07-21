import { OAuth2Profile } from "../../types";
import { OAuth2Provider } from "../AuthService";

export class MockOAuth2Provider implements OAuth2Provider {
    private counter: number

    public constructor() {
        this.counter = 1
    }

    public async exchange(code: string): Promise<OAuth2Profile> {
        return {
            id: (this.counter++).toString(),
            username: `maciek-${this.counter}-${code}`
        }
    }
    
}