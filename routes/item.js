const express = require('express');
const logger = require('../lib/logger');
const dumpLib = require('../lib/dump');
const ItemModel = require('../models/item');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

module.exports = function setupItemRoutes(router) {
    router.get(
        endpoints.GET_ROOT,
        function getRootEndpoint (req, res) {
            logger.info('GET_ROOT Request received', req)
            return res.status(200).send(endpoints)
        }
    )

    router.get(
        endpoints.GET_ITEM_LIST,
        async function getItemListEndpoint (req, res) {
            logger.info('GET_ITEM_LIST Request received')
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

    router.post(endpoints.POST_ITEM,
        bodyParser.json(),
        async function postItemEndpoint (req, res) {
            try {
                logger.info(`POST_ITEM Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const newItem = req.body

                // Could not get mongoose to validate the unique slug, so must check manually
                const dupeCheck = await ItemModel.find({ name: newItem.name });
                if (dupeCheck.length > 0) {
                    return res.status(400).send({err:`An item with the name "${dupeCheck[0].name}" already exists.`})
                }

                const result = await ItemModel.create(newItem);
                logger.info(`Item create result: ${JSON.stringify(result, null, 2)}`);
                res.status(201).send(result);
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.post(endpoints.POST_ITEM_UPDATE,
        bodyParser.json(),
        async function postItemUpdateEndpoint (req, res) {
            try {
                logger.info(`POST_ITEM_UPDATE Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const updateSourceID = req.params.sourceID;
                const updateData = req.body;

                const item = await ItemModel.findOne({ sourceID: updateSourceID });
                if (!item) {
                    return res.status(404).send({error: `Source ID: ${updateSourceID} not found in database. New sources must be scraped.`})
                }

                const result = await ItemModel.updateOne({ sourceID: updateSourceID }, updateData);

                return res.status(201).send({sourceID: updateSourceID, name: newName});
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.post(endpoints.POST_FETCH_ITEM_NAME,
        bodyParser.json(),
        async function postItemUpdateEndpoint (req, res) {
            try {
                logger.info(`POST_ITEM_UPDATE Request received | req.body: ${JSON.stringify(req.body)}`, req)

                const updateSourceID = req.params.sourceID

                const item = await ItemModel.findOne({ sourceID: updateSourceID });
                if (!item) {
                    return res.status(404).send({error: `Source ID: ${updateSourceID} not found in database. New sources must be scraped.`})
                }
                if (item.name && item.name !== '') {
                    return res.status(400).send({error: `Source ID: ${updateSourceID} already has name: "${item.name}".`})
                }

                const reqUrl = 'https://www.wowhead.com/item=' + item.itemID;
                let newName;
                try {
                    const wowheadResult = await axios.get(reqUrl)
                    const regexResult = wowheadResult.data.match(/<script type="application\/ld\+json">(.*)<\/script>/)
                    const wowheadData = JSON.parse(regexResult[1]);
                    if (wowheadData.name === 'Items') {
                        newName = '<unknown>';
                    } else {
                        newName = wowheadData.name;
                    }
                } catch (err) {
                    return res.status(500).send({error: `Bad fetch for info on Source ID: ${updateSourceID}. Sorry!`})
                }

                const result = await ItemModel.updateOne({ sourceID: updateSourceID }, {name: newName});

                return res.status(201).send({sourceID: updateSourceID, name: newName});
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.post(endpoints.POST_DUMP,
        bodyParser.json({limit: '100MB'}),
        async function postItemEndpoint (req, res) {
            try {
                logger.info('POST_DUMP Request received', req)

                const result = await dumpLib(req.body);

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
