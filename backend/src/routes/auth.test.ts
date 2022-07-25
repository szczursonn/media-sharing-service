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
            .get('/users/@me')
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

    it('allows to add multiple user connections thru oauth2 providers', async () => {
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
            .get('/users/@me/connections')
            .set('Authorization', `Bearer: ${token}`)
            .expect(200)

        const connections = res3.body
        expect(connections).toBeDefined()
        expect(connections instanceof Array).toBeTruthy()
        expect(connections.length).toBe(2)
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
            .get('/auth/sessions')
            .set('Authorization', `Bearer: ${token1}`)
            .expect(200)
        
        const sessions = res3.body
        
        expect(sessions.length).toBe(2)

    })

    it('allows to terminate session', async () => {
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
            .get('/auth/sessions')
            .set('Authorization', `Bearer: ${token1}`)
            .expect(200)
        
        const sessionId = res2.body[0].id

        const res3 = await supertest(app)
            .delete(`/auth/sessions/${sessionId}`)
            .set('Authorization', `Bearer: ${token1}`)
            .expect(204)
        
        const res4 = await supertest(app)
            .get('/auth/sessions')
            .set('Authorization', `Bearer: ${token1}`)
            .expect(403)
    })
})