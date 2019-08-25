const logger = require('../lib/logger');
const VisualMetaModel = require('../models/visualMeta');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const util = require('../lib/util');


module.exports = function setupVidualMetaRoutes(router) {
    router.get(
        endpoints.GET_VISUAL_META,
        util.routeLogs('GET_VISUAL_META'),
        async function getVisualMetaEndpoint (req, res) {
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

    router.post(
        endpoints.POST_VISUAL_META,
        util.routeLogs('POST_VISUAL_META'),
        bodyParser.json(),
        async function postItemUpdateEndpoint (req, res) {
            try {
                logger.info('POST_VISUAL_META Request received', req)

                // Permission check
                if (!req.body || !req.headers.id) {
                    logger.info('POST_VISUAL_META missing body or id.')
                    return res.status(400).send({ error: 'Malformed request.' });
                }
                const userData = await UserModel.findOne({id: req.headers.id});
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    logger.info(`POST_VISUAL_META permission denied for id:${id}`)
                    return res.status(403).send({ error: 'Permission denied.' });
                }

                const {visualID} = req.params;
                const incomingVisualMeta = req.body;

                incomingVisualMeta.visualID = visualID;

                const result = await VisualMetaModel.findOneAndUpdate(
                    { visualID },
                    incomingVisualMeta,
                    { upsert: true, new: true }
                );

                return res.status(200).send(result);
            }
            catch (err) {
                logger.error('Unexpected error in POST_VISUAL_META');
                logger.error(err);
                res.status(400).send({ err });
            }
        }
    )

    return router
}
