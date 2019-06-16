// Colors: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'

function output(consoleFn, color, text, req) {
    const logId = Math.random().toString(36).substring(2, 9).toUpperCase();

    if (process.env.NODE_LOGGER_CONSOLE ==='true' || process.env.NODE_ENV !== 'test') {
        if (req) {
            text += ` | params: ${JSON.stringify(req.params)} | token: ${JSON.stringify(req.token)}`
        }

        text += ` | logId: ${logId}\n`
        consoleFn(color, text)
    }

    return logId;
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