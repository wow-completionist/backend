const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../lib/logger');
const uuidv4 = require('uuid/v4');
const UserModel = require('../models/user');

let mongoMemoryDB;

async function startMongoose() {
    try {
        mongoMemoryDB = new MongoMemoryServer({
            instance: {
                port: 27017,
                dbName: 'backend-starter-test'
            },
            binary: {
                version: '3.4.15'
            }
        });

        await mongoMemoryDB.runningInstance;
        logger.info('STARTUP: mongoMemoryDB running')

        const mongoUri = 'mongodb://localhost:27017/backend-starter'
        mongoose.connect(mongoUri, { useNewUrlParser: true })
        mongoose.set('useCreateIndex', true); // silences a warning, sigh
        mongoose.set('useFindAndModify', false);

        mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

        return new Promise((resolve)=> {
            mongoose.connection.once('open', function() {
                logger.info('STARTUP: Connected to database')
                resolve();
            })

        })
    } catch (err) {
        console.error('\n-- Error starting MongoMemoryServer. Check for installation error or another Mongo DB already using port 27017.\n');
        process.exit(1);
    }
}

async function stopMongoose() {
    await mongoose.disconnect();
    await mongoMemoryDB.stop();
}

async function resetMongoose() {
    try {
        const promises = Object.keys(mongoose.connection.models).map(model => mongoose.connection.models[model].deleteMany({}));
        await Promise.all(promises);
    } catch (error) {
        console.log('Cannot reset mongo database:');
        console.log(error);
        console.log(mongoose.connection);
        process.exit(1);
    }
}

async function initApp() {
    await startMongoose();

}

async function closeApp() {
    await stopMongoose()
}

async function setFixtureUser(customProperties = {}) {
    const defaults = {
        id: uuidv4()
    }

    const modifiedFixture = Object.assign(defaults, customProperties)
    return await UserModel.create(modifiedFixture);
}

function createToken () {
    return uuidv4();
}

// These can sometimes catch and display errors that are otherwise swallowed in the Milton log
process.on('uncaughtException', (reason) => {
    console.log('\n -- uncaughtException --');
    console.log(reason);
});
process.on('unhandledRejection', (reason) => {
    console.log('\n -- unhandledRejection --');
    console.log(reason);
    if (reason.name === 'MongoError') {
        console.log('**');
        console.log('** This could be a problem with MongoDB Memory Server.');
        console.log('** Make sure you export the environment variable `MONGOMS_VERSION=3.4.15`');
        console.log('** before `npm install`.');
        console.log('**');
    }
});

module.exports = {
    initApp,
    closeApp,
    startMongoose,
    stopMongoose,
    resetMongoose,
    setFixtureUser,
    createToken
};