const { UnauthorizedError, ForbiddenError } = require("../lib/errors");
const logger = require("../configs/logger.js")

const authorize = (req, res, next) =>
{
    logger.info(req.user);
    if (!req.user)
    {
        throw new UnauthorizedError('Authentication required');
    }
    if (req.user.role !== "ADMIN")
    {
        throw new ForbiddenError('Admin access required');
    }
    next();
}

module.exports = authorize;