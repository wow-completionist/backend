const request = require( 'supertest');
const jwt = require( 'jsonwebtoken');
const app = require( '../../lib/app');
const endpoints = require( '../../config/routes');
const UserModel = require( '../../models/user');
const { resetMongoose, setFixtureUser } = require( '../base');
const {expect} = require('chai');

describe('Signup route |', () => {
    afterEach(resetMongoose);

    it('POST /signup | returns 201 when successful', async () => {
        const newUser = {
            email: 'new@email.com',
            userName: 'New User',
            password: 'new user password'
        }

        const res = await request(app).post(endpoints.POST_SIGNUP).send(newUser)

        expect(res.status).to.equal(201)
        expect(res.body.success).to.equal(true)

        const foundUser = await UserModel.find({'email': 'new@email.com'})

        expect(foundUser.length).to.equal(1);

        expect(foundUser[0]).to.have.property('email', newUser.email);
        expect(foundUser[0]).to.have.property('userName', newUser.userName);

        const newUserId = foundUser[0].userId;

        const res2 = await request(app).post(endpoints.POST_LOGIN)
            .send({ email: 'new@email.com', password: 'new user password'})

        expect(res2.status).to.equal(200)
        expect(res2.body).to.haveOwnProperty('token')

        const verified = jwt.verify(res2.body.token, 'test-secret')
        expect(verified).to.equal(newUserId)
    })

    it('POST /signup | returns 200 when user already exists', async () => {
        await setFixtureUser({email:'standard@user.mail', password:'new user password'});

        const newUser = {
            email: 'standard@user.mail',
            userName: 'Standard User',
            password: 'new user password'
        }

        const res = await request(app).post(endpoints.POST_SIGNUP).send(newUser)

        expect(res.status).to.equal(200)
        expect(res.body.msg).to.equal('That user name or email address has already been taken. Both User Name and email must be unique. If you\'ve forgotten your password, you can recover it here: <> ')
        expect(res.body.success).to.equal(false)
    })
})
