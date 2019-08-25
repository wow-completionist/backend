const app = require('../../lib/app');
const request = require('supertest');
const { expect } = require('chai');

describe('Bad route |', () => {
    it('GET /foo | returns an error', async () => {
        const res = await request(app).get('/foo')

        expect(res.status).to.equal(404)
        expect(res.body).to.deep.equal({
            status: '404',
            message: 'Route not found',
            method: 'GET',
            url: '/foo'
        })
    })
})
