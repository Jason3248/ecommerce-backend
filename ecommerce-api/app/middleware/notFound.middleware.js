const notFoundHandler = (req, res, next) =>
{
    res.status(404).json({
        success: false,
        code: 'PATH_NOT_FOUND',
        message: `No route matches ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString()
    });
};

module.exports = notFoundHandler;