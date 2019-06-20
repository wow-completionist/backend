const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const itemRoutes = require('../routes/item');
const setRoutes = require('../routes/set');
const userRoutes = require('../routes/user');
const loginRoutes = require('../routes/login');
const signupRoutes = require('../routes/signup');
const visualMetaRoutes = require('../routes/visualMeta')
const catchAll = require('../routes/catchAll');

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        // Too late to send error to user
        return next(err)
    }
    logger.info(`Request Error in: ${req.method} ${req.url} params:${JSON.stringify(req.params)}`)
    logger.error(err.stack)
    res.status(err.status || 400)
    return res.send({ error: err })
}

class ExpressApp {
    constructor () {
        this.app = express()
        this.app.use(cors())
        this.mountRoutes()
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new ExpressApp()
        }

        return this._instance.app
    }

    mountRoutes () {
        let router = express.Router()
        logger.info('STARTUP: Defining endpoints')

        router = itemRoutes(router)
        router = setRoutes(router)
        router = userRoutes(router)
        router = loginRoutes(router)
        router = signupRoutes(router)
        router = visualMetaRoutes(router)

        // Add more route files here or automate

        router = catchAll(router)

        this.app.use('/', router)

        this.app.use(errorHandler)
    }
}

module.exports = ExpressApp.getInstance()
