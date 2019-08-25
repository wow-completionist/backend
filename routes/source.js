const logger = require('../lib/logger');
const importLib = require('../lib/import');
const SourceModel = require('../models/source');
const UserModel = require('../models/user');
const bodyParser = require('body-parser');
const endpoints = require('../config/routes');
const util = require('../lib/util');

module.exports = function setupSourceRoutes(router) {
    router.get(
        endpoints.GET_SOURCE_LIST,
        util.routeLogs('GET_SOURCE_LIST'),
        async function getSourceListEndpoint (req, res) {
            try {
                const findResult = await SourceModel.find({}).lean();
                logger.info(`found: ${findResult.length} items`, req);
                return res.status(200).send(findResult);
            }
            catch (err) {
                return res.status(500).send(err);
            }
        }
    )

    router.post(
        endpoints.POST_IMPORT,
        bodyParser.json({limit: '100MB'}),
        util.routeLogs('POST_IMPORT'),
        async function postImportEndpoint (req, res) {
            try {
                // Permission check
                if (!req.body || !req.headers.id) {
                    return res.status(400).send({ error: 'Malformed request.' });
                }
                const userData = await UserModel.findOne({id: req.headers.id});
                if (!userData || (userData.role !== 'write' && userData.role !== 'admin')) {
                    return res.status(403).send({ error: 'Permission denied.' });
                }

                const result = await importLib(req.body.data);

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
