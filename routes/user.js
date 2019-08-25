const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');

const logger = require('../lib/logger');
const auth = require('../lib/auth');
const UserModel = require('../models/user');
const endpoints = require('../config/routes');
const util = require('../lib/util');

module.exports = function setupUserRoutes (router) {
    router.get(
        endpoints.GET_USER_LIST,
        util.routeLogs('GET_USER_LIST'),
        auth.tokenCheck,
        async function getUserListEndpoint (req, res) {
            // TODO: Add admin check

            try {
                const findResult = await UserModel
                    .find({})
                    .select('-token')

                logger.info(`found: ${findResult.length} users`);
                return res.status(200).send(findResult);
            }
            catch (err) {
                res.status(500).send(err);
            }
        }
    )

    router.get(
        endpoints.GET_USER_BY_ID,
        util.routeLogs('GET_USER_BY_ID'),
        auth.tokenCheck,
        async function getUserByIdEndpoint (req, res) {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).send({error: 'Missing userId.'})
            }

            if (!req.token.verified) {
                logger.info('Unauthorized request', req)
                return res.status(401).send()
            }

            if (req.token.tokenUser.id != userId) {}

            try {
                const findResult = await UserModel.findOne({ id: userId }).lean();

                if (!findResult) {
                    logger.error(`User not found:${userId}`)
                    return res.status(400).send({error: `userId:${userId} not found in DB.`})
                }

                delete findResult.token;

                return res.respond(200, findResult);
            }
            catch (err) {
                return res.respond(500, err);
            }
        }
    )

    router.post(
        endpoints.POST_USER,
        util.routeLogs('POST_USER'),
        bodyParser.json(),
        async function postUserEndpoint (req, res) {
            const newUserId = uuidv4()

            const newUser = new UserModel({userId: newUserId, ...req.body})
            try {
                const result = await newUser.save();
                logger.info(`User create result: ${JSON.stringify(result)}`);
                const { userId, userName, email, createdAt } = result
                res.status(201).send({ userId, userName, email, createdAt });
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.post(
        endpoints.POST_COLLECTED,
        bodyParser.json(),
        util.routeLogs('POST_COLLECTED'),
        auth.tokenCheck,
        async function postUserEndpoint (req, res) {
            try {
                const { id: userId } = req.token.tokenUser;
                const collected = req.body;

                if (!collected || collected.length === 0) {
                    logger.info('Missing data in collected property')
                    return res.status(400).send({error: 'Missing data in collected property'})
                }

                await UserModel.findOneAndUpdate({ id: userId }, { collected });

                logger.info(`Saved ${collected.length} sourceIDs`)

                res.status(200).send({message: `Saved ${collected.length} sourceIDs for user:${userId}`});
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    return router
}
