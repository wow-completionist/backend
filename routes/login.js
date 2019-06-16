const express = require('express');
const logger = require('../lib/logger');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const auth = require('../lib/auth');

module.exports = function setupRoutes (router) {
    router.post(
        endpoints.POST_LOGIN,
        bodyParser.json(),
        async function postLoginEndpoint (req, res) {
            try {
                logger.info('POST_LOGIN Request received')
                logger.info(`req.body: ${JSON.stringify(req.body)}`)

                const userResult = await UserModel.findOne({email: req.body.email})

                if (!userResult) {
                    const msg = 'User not found or wrong password.' //obfuscate problem
                    const logId = logger.info(msg)
                    return res.status(200).send({msg, logId})
                }

                logger.info(`User find result: ${JSON.stringify(userResult)}`)

                if (!userResult.comparePassword(req.body.password)) {
                    const msg = 'User not found or wrong password.' //obfuscate problem
                    const logId = logger.info(msg)
                    return res.status(200).send({msg, logId})
                }

                const userData = userResult.toObject()

                delete userData.passwordHash
                delete userData.__v
                delete userData._id

                const token = auth.createToken(userData.userId);

                return res.status(200).send({token, ...userData})
            } catch(error) {
                const logId = logger.error(error)
                return res.status(500).send({msg:'Unexpected server error.', logId})
            }
        }
    )

    return router
}
