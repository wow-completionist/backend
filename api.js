const app = require('./lib/app');
const logger = require('./lib/logger');
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/completionist'

mongoose.connect(mongoUri, { useNewUrlParser: true })
mongoose.set('useCreateIndex', true); // silences a warning, sigh
mongoose.set('useFindAndModify', false);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
    logger.info('STARTUP: Connected to database')

    const port = Number(process.env.PORT) || 4000

    app.listen(port, (err) => {
        if (err) {
            return logger.error(err)
        }

        logger.info(`STARTUP: Listening on port ${port}`)

        return;
    })
})
