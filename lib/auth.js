const UserModel = require('../models/user');
const logger = require('./logger');

function getTokenSecret () {
    if (process.env.NODE_ENV === 'test') return 'test-secret'
    if (process.env.TOKEN_SECRET) return process.env.TOKEN_SECRET
    throw new Error('Server does not have a TOKEN_SECRET for creating a hash!')
}
// for local testing use `export TOKEN_SECRET=localTokenSecret`
async function tokenCheck (req, res, next) {
    req.token = {
        verified: false
    }

    if (req.headers.authorization) {
        const [ bearer, token ] = req.headers.authorization.split(' ')
        if (bearer === 'Bearer') {
            try {
                const userFound = await UserModel.findOne({ token }).lean();
                logger.info(`Token verified for user id: ${userFound.id}`);
                req.token = {
                    verified: true,
                    tokenUser: userFound
                }
            } catch (error) {
                logger.info(`Token check failed in auth.js: ${error}`, req)
                return res.status(401).send()
            }
        }
    }
    next();
}

function createToken (userId) {
    const token = jwt.sign(userId, getTokenSecret());
    return token
}

module.exports = {
    tokenCheck,
    createToken
}
