const request = require('supertest');
const {expect} = require('chai');
const app = require('../../lib/app');
const endpoints = require('../../config/routes');
const { resetMongoose, setFixtureUser, createToken } = require( '../base');

describe('User route |', () => {
    afterEach(resetMongoose);

    it('GET /users | returns a list of users', async () => {
        const admin = await setFixtureUser({userName: 'Admin User', email: 'admin@user.mail'})
        const token = createToken(admin.userId)

        const result = await request(app)
            .get(endpoints.GET_USER_LIST)
            .set({authorization: `Bearer ${token}`})

        expect(result.status).to.equal(200)

        const adminIndex = result.body.findIndex((item) => item.userName === 'Admin User')
        expect(result.body[adminIndex].userName).to.equal('Admin User')
        expect(result.body[adminIndex].email).to.equal('admin@user.mail')
        expect(result.body[adminIndex]).to.not.have.property('passwordHash');
        expect(result.body[adminIndex]).to.not.have.property('password');
    })

    it('GET /user/:userId | returns specified user', async () => {
        const user = await setFixtureUser({userName: 'Standard User', email: 'standard@user.mail'})
        const token = createToken(user.userId)

        const testRoute = endpoints.GET_USER_BY_ID.replace(':userId', user.userId)
        const result = await request(app)
            .get(testRoute)
            .set({authorization: `Bearer ${token}`})

        expect(result.status).to.equal(200)

        expect(result.body.userName).to.equal('Standard User')
        expect(result.body).to.not.have.property('password');
        expect(result.body.email).to.equal('standard@user.mail')
    })

    it('POST /user | creates new user in DB', async () => {
        const fixtureUser = {
            userName: 'New User',
            password: 'MyPaSsWoRd',
            email: 'new_user@test.mail'
        }

        const testRoute = endpoints.POST_USER;
        const res = await request(app).post(testRoute).send(fixtureUser);

        expect(res.status).to.equal(201);

        expect(res.body).to.not.have.property('password');
        expect(res.body.userName).to.equal(fixtureUser.userName);
        expect(res.body.email).to.equal(fixtureUser.email);
        expect(res.body).to.have.property('userId');
        expect(res.body).to.have.property('createdAt');
    })

    it('POST /collected | adds collected sourceIDs to user record', async () => {
        const user = await setFixtureUser()
        const token = createToken(user.userId)

        const testString = '123:124:125';

        const testRoute = endpoints.POST_COLLECTED;
        const res = await request(app).post(testRoute)
            .send({collected: testString})
            .set({authorization: `Bearer ${token}`})

        expect(res.status).to.equal(200);

        expect(res.body.message).to.equal('Saved 3 sourceIDs');
    })
})
