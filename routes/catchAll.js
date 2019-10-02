const logger = require( '../lib/logger')

module.exports = function setupCatchAllRoute (router) {
    router.all(
        '/',
        function rootEndpoint (req, res) {
            logger.info(`Request received on root: ${req.method} ${req.url}`, req)
            const welcome = {
                status: '200',
                message: 'Welcome to Completionist Guru',
                method: req.method,
                url: req.url
            }
            return res.status(200).send(welcome)
        }
    )

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
