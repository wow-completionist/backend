const request = require('supertest');
const { expect } = require('chai');
const app = require('../../lib/app');
const endpoints = require('../../config/routes');
const { resetMongoose, setFixtureUser, createToken } = require( '../base');

describe('User route |', () => {
    afterEach(resetMongoose);

    it('GET /users | returns a list of users', async () => {
        const token = createToken()
        await setFixtureUser({ id:'12345', token })

        const result = await request(app)
            .get(endpoints.GET_USER_LIST)
            .set({ authorization: `Bearer ${token}` })

        expect(result.status).to.equal(200)

        const adminIndex = result.body.findIndex((user) => user.id === '12345')
        expect(result.body[adminIndex]).to.not.have.property('token');
    })

    it('GET /user/:userId | returns specified user', async () => {
        const token = createToken()
        await setFixtureUser({ id: '11111', token })

        const testRoute = endpoints.GET_USER_BY_ID.replace(':userId', '11111')
        const result = await request(app)
            .get(testRoute)
            .set({ authorization: `Bearer ${token}` })

        expect(result.status).to.equal(200)

        expect(result.body).to.not.have.property('token');
    })

    it('POST /collected | adds collected sourceIDs to user record', async () => {
        const token = createToken()
        await setFixtureUser({ id: '11111', token })

        const newSources = [ 123,124,125 ];

        const testRoute = endpoints.POST_COLLECTED;
        const res = await request(app).post(testRoute)
            .send(newSources)
            .set({ authorization: `Bearer ${token}` })

        expect(res.status).to.equal(200);

        expect(res.body.message).to.equal('Saved 3 sourceIDs for user:11111');
    })
})
