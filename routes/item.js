const express = require('express');
const logger = require('../lib/logger');
const dumpLib = require('../lib/dump');
const ItemModel = require('../models/item');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

module.exports = function setupItemRoutes(router) {
    router.get(
        endpoints.GET_SOURCE_LIST,
        async function getItemListEndpoint (req, res) {
            logger.info('GET_SOURCE_LIST Request received', req)
            try {
                const findResult = await ItemModel.find({}).lean();
                logger.info(`found: ${findResult.length} items`, req);
                return res.status(200).send(findResult);
            }
            catch (err) {
                return res.status(500).send(err);
            }
        }
    )

    router.post(endpoints.POST_DUMP,
        bodyParser.json({limit: '100MB'}),
        async function postItemEndpoint (req, res) {
            try {
                logger.info('POST_DUMP Request received')

                // Permission check
                if (!req.body || !req.headers.id) {
                    return res.status(400).send({ error: 'Malformed request.' });
                }
                const userData = await UserModel.findOne({id: req.headers.id});
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    return res.status(403).send({ error: 'Permission denied.' });
                }

                const result = await dumpLib(req.body.data);

                logger.info(`Result: ${JSON.stringify(result)}`);

                res.status(201).send(result);
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    return router
}
