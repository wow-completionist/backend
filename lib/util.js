const logger = require('./logger');

module.exports = {
    routeLogs: function(endpoint) {
        return function (req, res, next) {
            logger.info(`${endpoint} Request Received`, req);
            res.respond = function (status, message) {
                let text = JSON.stringify(message);
                if (text.length > 1000) {
                    text = `${text.slice(0,1000)}... (abridged for logging)`;
                }
                logger.info(`${status} returned for ${endpoint} request with message "${text}"`);
                res.status(status).send(message);
            }
            next();
        }
    }
};
