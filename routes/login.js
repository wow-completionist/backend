/* eslint-disable camelcase */
const querystring = require('querystring');
const request = require('request-promise-native')

const logger = require('../lib/logger');
const UserModel = require('../models/user');
const endpoints = require('../config/routes');
const util = require('../lib/util');

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:4000/callback';

module.exports = function setupLoginRoutes (router) {
    router.get(
        endpoints.POST_LOGIN,
        util.routeLogs('POST_LOGIN'),
        async function (req, res) {
            logger.info('Login requested - redirecting to battle.net', req);
            res.redirect('https://us.battle.net/oauth/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: process.env.WOW_CLIENT_ID,
                    scope: 'wow.profile',
                    redirect_uri,
                    state: 'edfrgth45678'
                })
            )
        }
    )

    router.get(
        endpoints.GET_CALLBACK,
        util.routeLogs('GET_CALLBACK'),
        async function getCallback(req, res) {
        logger.info('Callback received from battle.net, now confirming', req)
        let code = req.query.code || null
        let authOptions = {
            url: 'https://us.battle.net/oauth/token',
            form: {
                code: code,
                redirect_uri,
                grant_type: 'authorization_code',
                scope: 'wow.profile',

            },
            headers: {
                Authorization: 'Basic ' + (new Buffer(
                    process.env.WOW_CLIENT_ID + ':' + process.env.WOW_CLIENT_SECRET
                ).toString('base64'))
            },
            json: true
        }

        let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
        let response;
        try {
            response = await request.post(authOptions)
            logger.info(`Confirmation response from bnet: ${JSON.stringify(response)}`)
        } catch (error) {
            logger.error('Error during callback confirmation with battle.net');
            logger.error(error);
            return res.redirect(uri + '/login_failed')
        }

        var accessToken = response.access_token;

        let result;
        let userData
        try {
            result = await request.get('https://us.battle.net/oauth/userinfo?access_token=' + accessToken)
            userData = JSON.parse(result);
            logger.info(`User Data from battle.net: ${JSON.stringify(userData)}`)
        } catch (err) {
            logger.error(`Error fetching user data from battle.net: ${err}`);
            logger.error(err);
            return res.redirect(uri + '/login_failed')
        }

        // create account for user
        try {
            userData.token = accessToken;
            const userFound = await UserModel.findOneAndUpdate({ id: userData.id }, userData, {upsert: true, new: true}).lean();
            logger.info(`User record updated: ${JSON.stringify(userFound)}`)
        } catch (err) {
            console.log(`Error creating db account for user ${result}`)
            console.log(err);
            return res.redirect(uri + '/login_failed')
        }

        logger.info(`Redirecting browser to ${uri} with token ${accessToken}`)
        return res.redirect(`${uri}/login_success?access_token=${accessToken}&id=${userData.id}&battletag=${encodeURIComponent(userData.battletag)}`)
    })

    router.get(
        endpoints.GET_USER_CHARACTERS,
        util.routeLogs('GET_USER_CHARACTERS'),
        async function (req, res) {
            logger.info('Wow Character Data requested', req);
            let accessToken = req.query.access_token || null

            let response;
            try {
                response = await request.get('https://us.api.blizzard.com/wow/user/characters?access_token=' + accessToken)
            } catch (error) {
                logger.error('Error during callback confirmation with battle.net');
                console.error(error);
                return res.status(error.statusCode || 400).send({err:error})
            }

            logger.info('Successful call to get character info')
            logger.info(response)
            return res.status(200).send(response)

        }
    )

    return router
}
