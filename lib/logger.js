// Colors: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'

function output(consoleFn, color, text, req) {
    if (process.env.NODE_LOGGER_CONSOLE ==='true' || process.env.NODE_ENV !== 'test') {
        if (req) {
            text += ` | headers: ${JSON.stringify(req.headers)} | params: ${JSON.stringify(req.params)} | query: ${JSON.stringify(req.query)} | body: ${JSON.stringify(req.body)}`
        }

        text += '\n---------------------------------------------------------------'
        consoleFn(color, text)
    }
}

const logger = {
    info: (text, req) => {
        return output(console.log, FgGreen, text, req)
    },

    error: (text, req) => {
        return output(console.error, FgRed, text, req)
    }
}

module.exports = logger;
