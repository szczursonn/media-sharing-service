import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { CannotRemoveLastUserConnectionError } from "../errors"
import { UserConnection } from "../models/UserConnection"
import { AuthService } from "./AuthService"
import { MockOAuth2Provider } from "./OAuth2Providers"

describe('AuthService tests', () => {

    let dataSource: DataSource
    let authService: AuthService
    
    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            authService = new AuthService({
                dataSource: ds,
                jwtSecret: 'abcd',
                discordOAuth2Provider: new MockOAuth2Provider()
            })
            done()
        })
    })

    it('allows to remove user connection', async () => {
        await authService.removeConnection(2, 'github')

        const connectionCount = await dataSource.manager.countBy(UserConnection, {
            userId: 2
        })
        
        expect(connectionCount).toBe(1)
    })

    it('disallows to remove last user connection', async () => {
        await expect(authService.removeConnection(1, 'discord')).rejects.toThrowError(CannotRemoveLastUserConnectionError)

        const connectionCount = await dataSource.manager.countBy(UserConnection, {
            userId: 1
        })
        expect(connectionCount).toBe(1)
    })

    it('allows to get user connections', async () => {
        const connections1 = await authService.getUserConnections(1)
        const connections2 = await authService.getUserConnections(2)

        expect(connections1.length).toBe(1)
        expect(connections2.length).toBe(2)
    })
})
