'use strict';

const { format, transports, createLogger } = require('winston');
const { combine, timestamp, simple, splat } = format;

const DATE_PATTERS = 'YYYY-MM-DD-HH';

function fancyLogging(level, logArguments) {
    const placeholders = [];
    const parameters = [];
    for (const arg of logArguments) {
        if (typeof arg === 'object') {
            placeholders.push('%j');
        } else {
            placeholders.push('%s');
        }
        parameters.push(arg);
    }

    logger.log(level, placeholders.join(', '), ...parameters);
}

module.exports = {
    error() {
        fancyLogging('error', arguments);
    },
    info() {
        fancyLogging('info', arguments);
    },
    debug() {
        fancyLogging('debug', arguments);
    },
};

const logger = createLogger({
    format: combine(splat(), timestamp(), simple()),
    transports: [
        new transports.Console({
            level: getLogLevel(),
            datePattern: DATE_PATTERS,
        }),
    ],
});

function getLogLevel() {
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

// error: 0,
// warn: 1,
// info: 2,
// verbose: 3,
// debug: 4,
// silly: 5
