import { Session } from "../models/Session"
import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { CannotRemoveLastUserConnectionError, OAuth2InvalidCodeError, OAuth2ProviderUnavailableError, ResourceNotFoundError } from "../errors"
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

    it('allows to register with OAuth2 provider', async () => {
        await authService.loginOrRegisterWithOAuth2('abc', 'discord')

        const connection = await dataSource.manager.findOneBy(UserConnection, {
            foreignId: 'abc',
            type: 'discord'
        })
        expect(connection === null).toBe(false)

        const sessions = await dataSource.manager.findBy(Session, {
            userId: connection!.userId
        })
        expect(sessions.length).toBe(1)

    })

    it('allows to login with OAuth2 provider', async () => {
        await authService.loginOrRegisterWithOAuth2('afro#1234', 'discord')

        const sessions = await dataSource.manager.findBy(Session, {
            userId: 4
        })

        expect(sessions.length).toBe(2)
    })

    it('disallows to login/register with unavailable oauth2 provider', async () => {
        await expect(authService.loginOrRegisterWithOAuth2('goblinek666', 'google')).rejects.toThrowError(OAuth2ProviderUnavailableError)
    })

    it('disallows to login/register with invalid code', async () => {
        await expect(authService.loginOrRegisterWithOAuth2('invalidcode', 'discord')).rejects.toThrowError(OAuth2InvalidCodeError)
    })

    it('allows to add new connections to user', async () => {
        await authService.addConnection(2, 'marcinekk', 'discord')

        const connectionCount = await dataSource.manager.countBy(UserConnection, {
            userId: 2
        })

        expect(connectionCount).toBe(3)
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

    it('allows to get user sessions', async () => {
        const sessions = await authService.getUserSessions(2)
        expect(sessions.length).toBe(2)
    })

    it('allows to invalidate session', async () => {
        await authService.invalidateSession(4, 2)
        const sessions = await dataSource.manager.findBy(Session, {
            userId: 2
        })
        expect(sessions.length).toBe(1)
    })

    it('disallows to invalidate non-existent session', async () => {
        await expect(authService.invalidateSession(999, 1)).rejects.toThrowError(ResourceNotFoundError)
    })
})
