process.env.NODE_ENV = 'test';

const fs = require('fs');
const base = require('./base'); // test utils

describe('Starter Test Suite', function () {
    this.timeout(60000);
    const start = new Date();

    before(base.initApp);

    after(async () => {
        await base.closeApp();
        const length = new Date() - start;
        const minutes = Math.floor(length / 60000);
        const seconds = ((length % 60000) / 1000).toFixed(0);
        console.info(`Tests completed in ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    });

    const apiList = fs.readdirSync('./tests/api').filter(file => file.match(/_test.js$/));
    apiList.forEach(file => require(`./api/${file}`)); // eslint-disable-line global-require

    const libList = fs.readdirSync('./tests/lib').filter(file => file.match(/_test.js$/));
    libList.forEach(file => require(`./lib/${file}`)); // eslint-disable-line global-require
});
