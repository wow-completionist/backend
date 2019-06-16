const express = require('express');
const logger = require('../lib/logger');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const uuidv4 = require('uuid/v4');

module.exports = function setupRoutes (router) {
    router.post(
        endpoints.POST_SIGNUP,
        bodyParser.json(),
        async function postSignupEndpoint (req, res) {
            try {
                logger.info('POST_SIGNUP Request received')
                logger.info(`req.body.email:${JSON.stringify(req.body.email)}` +
                `| req.body.userName:${JSON.stringify(req.body.userName)}` +
                `| req.body.password included? ${!!JSON.stringify(req.body.password)}`)

                const newUser = {
                    email: req.body.email,
                    userName: req.body.userName,
                    password: req.body.password,
                    userId: ''
                }

                const userFound = await UserModel.findOne({$or: [{email: newUser.email}, {userName: newUser.userName} ]})
                if (userFound) {
                    const msg = 'That user name or email address has already been taken. Both User Name and email must be unique. If you\'ve forgotten your password, you can recover it here: <> '
                    const success = false
                    const logId = logger.info(msg)
                    return res.status(200).send({msg, success, logId})
                }

                newUser.userId = uuidv4();
                await UserModel.create(newUser);

                const msg = `User "${newUser.userName}" created. Your account must be activated before you can log in. You will receive an activation email within a few minutes. Please follow the instructions in the activation email.`
                const success = true
                const logId = logger.info(msg)
                return res.status(201).send({msg, success, logId})
            } catch (error) {
                const errorId = logger.error(error)
                return res.status(500).send({error: `Unexpected error. Please see log ${errorId}`})
            }
        }
    )

    return router
}
