const express = require('express');
const logger = require('../lib/logger');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const endpoints = require('../config/routes');
const util = require('../lib/util');
const SetModel = require('../models/set');
const UserModel = require('../models/user');

module.exports = function deliverFrontEndBundle(router) {
    router.get(
        '/',
        async function getSetListEndpoint (req, res) {
            logger.info('GET_SET_LIST Request received', req)
            return res.status(200).send()
        }
    )
}