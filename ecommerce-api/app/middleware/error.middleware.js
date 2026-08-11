const logger = require("../configs/logger.js");
const AppError = require("../lib/errors/AppError.js");


const errorHandler = (err, req, res, next) =>
{
    if (err instanceof AppError)
    {
        if (err.statusCode >= 500)
        {
            logger.error(err.message, { stack: err.stack, code: err.code });
        } else
        {
            logger.warn(err.message, { code: err.code, path: req.originalUrl });
        }

        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
            timestamp: new Date().toISOString()
        });
    }

    // Unrecognized error (raw Sequelize/Postgres error, programming bug, etc.)
    // — never leak internals to the client (SRS §52).
    logger.error('Unhandled error', { stack: err.stack, message: err.message });

    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again later.',
        timestamp: new Date().toISOString()
    });
};


module.exports = errorHandler;
