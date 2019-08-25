const logger = require( '../lib/logger')

module.exports = function setupCatchAllRoute (router) {
    router.all(
        '*',
        function catchAllEndpoint (req, res) {
            logger.info(`Bad Route Request received: ${req.method} ${req.url}`, req)
            const error = {
                status: '404',
                message: 'Route not found',
                method: req.method,
                url: req.url
            }
            return res.status(404).send(error)
        }
    )

    return router
}
