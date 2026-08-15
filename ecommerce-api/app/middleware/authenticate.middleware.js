const jwt = require("jsonwebtoken");
const { UnauthorizedError, ForbiddenError } = require("../lib/errors/index.js");
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



module.exports = authenticate;
