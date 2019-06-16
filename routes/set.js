const express = require('express');
const logger = require('../lib/logger');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const endpoints = require('../config/routes');
const SetModel = require('../models/set');

module.exports = function setupSetRoutes(router) {
    router.get(
        endpoints.GET_SET_LIST,
        async function getSetListEndpoint (req, res) {
            logger.info('GET_SET_LIST Request received')
            try {
                const findResult = await SetModel.find({}).lean();
                logger.info(`Found: ${findResult.length} sets`, req);
                return res.status(200).send(findResult);
            }
            catch (err) {
                return res.status(500).send(err);
            }
        }
    )

    router.post(endpoints.POST_SET,
        bodyParser.json(),
        async function postSetEndpoint (req, res) {
            try {
                logger.info(`POST_SET Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const newSet = req.body

                // Could not get mongoose to validate the unique slug, so must check manually
                const dupeCheck = await SetModel.find({ name: newSet.name });
                if (dupeCheck.length > 0) {
                    return res.status(400).send({err:`A set with the name "${dupeCheck[0].name}" already exists.`})
                }

                newSet.setId = uuidv4();
                const result = await SetModel.create(newSet);

                logger.info(`Set create result: ${JSON.stringify(result, null, 2)}`);

                return res.status(201).send(result);
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.post(endpoints.POST_SET_UPDATE,
        bodyParser.json(),
        async function postSetUpdateEndpoint (req, res) {
            try {
                logger.info(`POST_SET Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const updateSetId = req.params.setId;
                const {visualID} = req.body;

                const updateSet = await SetModel.findOne({ setId: updateSetId });
                if (!updateSet) {
                    return res.status(400).send({err:`Set ID "${updateSetId}" not found in database.`})
                }

                if (updateSet.visuals && updateSet.visuals.includes(visualID)) {
                    return res.status(400).send({err:`Visual ID "${visualID}" already in Set ID "${updateSetId}"`})
                }
                const result = await SetModel.updateOne({setId: updateSetId}, { $push: { visuals: visualID } });

                logger.info(`Set update result: ${JSON.stringify(result, null, 2)}`);

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
