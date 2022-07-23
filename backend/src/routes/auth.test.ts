import supertest from 'supertest'
import { createTestServer } from '../createServer'
import { User } from '../models/User'

describe('OAuth2 tests', () => {
    it('creates a new user from oauth2 provider', async () => {
        const {app} = await createTestServer()
        const res1 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'masn000'
            })
            .expect(200)

        const token = res1.body.token as string
        expect(typeof token).toBe('string')

        const res2 = await supertest(app)
            .get('/user/@me')
            .set('Authorization', `Bearer: ${token}`)
            .expect(200)

        const user = res2.body as User
        
        expect(user).toBeDefined()
    })

    it('disallows to use invalid oauth2 code', async () => {
        const {app} = await createTestServer()
        const res1 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'invalidcode'
            })
            .expect(400)
    })

    it('allows to have multiple user connections and remove one of them', async () => {
        const {app} = await createTestServer()
        const res1 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'masnoooo123'
            })
            .expect(200)

        const token = res1.body.token as string
        expect(typeof token).toBe('string')
        
        const res2 = await supertest(app)
            .post('/auth/github')
            .set('Authorization', `Bearer: ${token}`)
            .set('Content-Type', 'application/json')
            .send({
                code: 'omamaleeee'
            })
            .expect(204)
        
        const res3 = await supertest(app)
            .get('/user/@me')
            .set('Authorization', `Bearer: ${token}`)
            .expect(200)

        const user = res3.body
        expect(user.connections).toBeDefined()
        expect(user.connections instanceof Array).toBeTruthy()
        expect(user.connections.length).toBe(2)

        const res4 = await supertest(app)
            .delete('/auth/github')
            .set('Authorization', `Bearer: ${token}`)
            .expect(204)

    })

    it('disallows to delete last user connection', async () => {
        const {app} = await createTestServer()
        const res1 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'masnoooo123'
            })
            .expect(200)
        
        const token = res1.body.token as string
        expect(typeof token).toBe('string')

        const res2 = await supertest(app)
            .delete('/auth/discord')
            .set('Authorization', `Bearer: ${token}`)
            .expect(409)
    })

    it('disallows to use unavailable oauth2 provider', async () => {
        const {app} = await createTestServer()
        await supertest(app)
            .post('/auth/google')
            .set('Content-Type', 'application/json')
            .send({
                code: 'aaa'
            })
            .expect(503)
    })

    it('allows to login', async () => {
        const {app} = await createTestServer()

        const res1 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'masn000'
            })
            .expect(200)

        const token1 = res1.body.token as string

        const res2 = await supertest(app)
            .post('/auth/discord')
            .set('Content-Type', 'application/json')
            .send({
                code: 'masn000'
            })
            .expect(200)

        const token2 = res2.body.token as string

        expect(token1 === token2).toBe(false)
        
        const res3 = await supertest(app)
            .get('/user/@me')
            .set('Authorization', `Bearer: ${token1}`)
            .expect(200)
        
        const sessions = res3.body.sessions
        
        expect(sessions.length).toBe(2)

    })
})