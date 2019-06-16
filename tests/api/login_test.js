const request = require( 'supertest');
const jwt = require( 'jsonwebtoken');
const {expect} = require('chai');
const app = require( '../../lib/app');
const endpoints = require( '../../config/routes');
const { resetMongoose, setFixtureUser } = require( '../base');

describe('Login route |', () => {
    afterEach(resetMongoose);

    it('POST /login | returns a token when successful', async () => {
        await setFixtureUser({email:'standard@user.mail', password:'standard user password'});

        const res = await request(app).post(endpoints.POST_LOGIN)
            .send({ email: 'standard@user.mail', password: 'standard user password'})

        expect(res.status).to.equal(200)
        expect(res.body).to.haveOwnProperty('token')
        expect(res.body).to.haveOwnProperty('userId')
        const verified = jwt.verify(res.body.token, 'test-secret')
        expect(verified).to.match(/^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i);
        try {
            jwt.verify(res.body.token, 'not-the-secret')
        }
        catch (error) {
            expect(error.toString()).to.equal('JsonWebTokenError: invalid signature')
        }
    })
})
