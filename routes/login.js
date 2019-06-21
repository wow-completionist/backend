/* eslint-disable camelcase */
const express = require('express');
const querystring = require('querystring');
const request = require('request')

const logger = require('../lib/logger');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const auth = require('../lib/auth');

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:4000/callback';

module.exports = function setupRoutes(router) {
    router.get(
        '/login',
        async function (req, res) {
            res.redirect('https://us.battle.net/oauth/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: process.env.WOW_CLIENT_ID,
                    scope: 'user-read-private user-read-email',
                    redirect_uri
                })
            )
        }
    )

    router.get('/callback', function (req, res) {
        let code = req.query.code || null
        let authOptions = {
            url: 'https://us.battle.net/oauth/token',
            form: {
                code: code,
                redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(
                    process.env.WOW_CLIENT_ID + ':' + process.env.WOW_CLIENT_SECRET
                ).toString('base64'))
            },
            json: true
        }
        request.post(authOptions, function (error, response, body) {
            var access_token = body.access_token
            let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
            res.redirect(uri + '?access_token=' + access_token)
        })
    })

    // router.post(
        //     endpoints.POST_LOGIN,
        //     bodyParser.json(),
        //     async function postLoginEndpoint (req, res) {
        //         try {
        //             logger.info('POST_LOGIN Request received')
        //             logger.info(`req.body: ${JSON.stringify(req.body)}`)

        //             const userResult = await UserModel.findOne({email: req.body.email})

        //             if (!userResult) {
        //                 const msg = 'User not found or wrong password.' //obfuscate problem
        //                 const logId = logger.info(msg)
        //                 return res.status(200).send({msg, logId})
        //             }

        //             logger.info(`User find result: ${JSON.stringify(userResult)}`)

        //             if (!userResult.comparePassword(req.body.password)) {
        //                 const msg = 'User not found or wrong password.' //obfuscate problem
        //                 const logId = logger.info(msg)
        //                 return res.status(200).send({msg, logId})
        //             }

        //             const userData = userResult.toObject()

        //             delete userData.passwordHash
        //             delete userData.__v
        //             delete userData._id

        //             const token = auth.createToken(userData.userId);

        //             return res.status(200).send({token, ...userData})
        //         } catch(error) {
        //             const logId = logger.error(error)
        //             return res.status(500).send({msg:'Unexpected server error.', logId})
        //         }
        //     }
    // )

    return router
}
