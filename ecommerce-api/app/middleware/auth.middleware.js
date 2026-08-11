const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../lib/errors");
const { User } = require("ecommerce-data-model");
require('dotenv').config(__dirname, '../../../.env');
const logger = require("../configs/logger.js")

const authenticate = async (req, res, next) =>
{
    logger.info("request received");
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
    {
        throw new UnauthorizedError('Missing authorization header');
    }

    const token = header.slice('Bearer '.length);
    let decodedToken = '';
    try
    {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error)
    {
        throw new UnauthorizedError('Invalid or expired token');
    }
    const user = await User.findByPk(decodedToken.userId);
    if (!user)
    {
        throw new UnauthorizedError('User no longer exists');
    }
    if (user.isBlocked)
    {
        throw new ForbiddenError('This account has been blocked');
    }
    req.user = {
        id: user.id,
        role: user.role
    }
    next();
}

const requireAdmin = (req, res, next) =>
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


module.exports = {
    authenticate,
    requireAdmin
}
