const AppError = require("../lib/errors/AppError.js");



const errorHandler = (err, req, res, next) =>
{
    if (!err instanceof AppError)
    {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong. Please try again later',
            timestamp: new Date().toISOString()
        });
    }
    return res.status(err.statusCode).json({
        success: false,
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString()
    })
}


module.exports = errorHandler;
