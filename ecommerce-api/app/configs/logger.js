const winston = require("winston");

const { combine, errors, timestamp, json } = winston.format;

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;