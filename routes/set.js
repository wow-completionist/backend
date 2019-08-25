const uuidv4 = require('uuid/v4');
const bodyParser = require('body-parser');
const util = require('../lib/util');
const logger = require('../lib/logger');
const SetModel = require('../models/set');
const UserModel = require('../models/user');
const endpoints = require('../config/routes');

module.exports = function setupSetRoutes(router) {
    router.get(
        endpoints.GET_SET_LIST,
        util.routeLogs('GET_SET_LIST'),
        async function getSetListEndpoint (req, res) {
            logger.info('GET_SET_LIST Request received', req)
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

    router.post(
        endpoints.POST_SET,
        bodyParser.json(),
        util.routeLogs('POST_SET'),
        async function postSetEndpoint (req, res) {
            try {
                logger.info('POST_SET Request received', req)

                // Permission check
                if (!req.body || !req.headers.id) {
                    return res.status(400).send({ error: 'Malformed request.' });
                }
                const userData = await UserModel.findOne({ id: req.headers.id });
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    return res.status(403).send({ error: 'Permission denied.' });
                }

                const newSet = req.body.data

                // Could not get mongoose to validate the unique slug, so must check manually
                const dupeCheck = await SetModel.find({ name: newSet.name });
                if (dupeCheck.length > 0) {
                    return res.status(400).send({ err:`A set with the name "${dupeCheck[0].name}" already exists.` })
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

    // Changes to a set record from frontend admin
    router.post(
        endpoints.POST_SET_UPDATE,
        bodyParser.json(),
        util.routeLogs('POST_SET_UPDATE'),
        async function postSetUpdateEndpoint (req, res) {
            try {
                const { body: updates = {} } = req;
                const { visualID, slot } = updates;
                const { id: userId } = req.headers;
                const { setId: updateSetId } = req.params;

                // Validate request
                if (!userId) {
                    return res.status(400).send({ error: 'Malformed request. Missing user ID.' });
                }

                // Permission check
                const userData = await UserModel.findOne({ id: userId });
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    return res.status(403).send({ error: 'Permission denied.' });
                }

                const updateSet = await SetModel.findOne({ setId: updateSetId });
                if (!updateSet) {
                    logger.info(`Status 400: Set ID "${updateSetId}" not found in database.`)
                    return res.status(400).send({ err:`Set ID "${updateSetId}" not found in database.` })
                }

                if (!visualID && !slot) {
                    const result = await SetModel.updateOne({ setId: updateSetId }, updates);
                    logger.info(`Set update result: ${JSON.stringify(result, null, 2)}`);
                    return res.status(200).send(result);
                }

                if (!visualID && !slot) {
                    logger.info(`Status 400: Missing update data. | body: ${updates}`);
                    return res.status(400).send({ err:'Insufficient data to update.' })
                }

                const update = {};
                update[slot] = visualID;
                const result = await SetModel.updateOne({ setId: updateSetId }, { $set: update });

                logger.info(`Set update result: ${JSON.stringify(result, null, 2)}`);

                return res.status(200).send(result);
            }
            catch (err) {
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    router.delete(
        endpoints.DELETE_VISUAL_FROM_SET,
        util.routeLogs('DELETE_VISUAL_FROM_SET'),
        async function postSetUpdateEndpoint (req, res) {
            try {
                const { id: userId } = req.headers;
                const { setId, slot, visualID } = req.params;

                // Validate request
                if (!userId) {
                    return res.respond(400, { error: 'Malformed request. Missing user ID.' });
                }
                if (!setId || !slot || !visualID) {
                    return res.respond(400, { error: 'Malformed request. Missing one or more params.' });
                }

                // Permission check
                const userData = await UserModel.findOne({ id: userId });
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    return res.respond(403, { error: 'Permission denied.' });
                }

                const updateSet = await SetModel.findOne({ setId });
                if (!updateSet) {
                    return res.respond(400, { err:`Set ID "${updateSetId}" not found in database.` });
                }

                if (!updateSet[slot] || !updateSet[slot] == visualID) {
                    return res.respond(400, { err:`Visual ID "${visualID}" is not assigned to slot "${slot}" in set "${setId}"` });
                }

                const update = {};
                update[slot] = null;
                const result = await SetModel.updateOne({ setId }, { $set: update });

                logger.info(`Set update result: ${JSON.stringify(result, null, 2)}`);

                return res.respond(200, result);
            }
            catch (err) {
                logger.error(err);
                res.respond(400, { err });
            }
        }
    )

    return router
}
