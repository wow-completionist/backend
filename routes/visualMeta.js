const express = require('express');
const logger = require('../lib/logger');
const dumpLib = require('../lib/dump');
const VisualMetaModel = require('../models/visualMeta');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

module.exports = function setupItemRoutes(router) {
    router.get(
        endpoints.GET_VISUAL_META,
        async function getVisualMetaEndpoint (req, res) {
            logger.info('GET_VISUAL_META Request received', req)
            try {
                const findResult = await VisualMetaModel.find({}).lean();
                logger.info(`found: ${findResult.length} items`, req);
                return res.status(200).send(findResult);
            }
            catch (err) {
                return res.status(500).send(err);
            }
        }
    )

    router.post(endpoints.POST_VISUAL_META,
        bodyParser.json(),
        async function postItemUpdateEndpoint (req, res) {
            try {
                logger.info(`POST_ITEM_UPDATE Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const {visualID} = req.params;
                const incomingVisualMeta = req.body;

                incomingVisualMeta.visualID = visualID;

                const result = await VisualMetaModel
                    .findOneAndUpdate({ visualID }, incomingVisualMeta, {upsert: true, new: true});

                return res.status(200).send(result);
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )


    return router
}
