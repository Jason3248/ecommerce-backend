const { User } = require("ecommerce-data-model");
const { NotFoundError, UnauthorizedError, ValidationError } = require("../../lib/errors");
const logger = require("../../configs/logger");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
class UserService
{
    #toSafeUser(userInstance)
    {
        const { id, firstName, lastName,  email, role, isEmailVerified } =
            userInstance.toJSON ? userInstance.toJSON() : userInstance;
        return { id, firstName, lastName,  email, role, isEmailVerified };
    }
    async getProfile(userId)
    {
        const user = await User.findByPk(userId);
        logger.info("request received");
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        return this.#toSafeUser(user);

    }

    async changePassword(userId, { currentPassword, newPassword })
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        const currentPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!currentPasswordMatch)
        {
            throw new UnauthorizedError('Current password is invalid');
        }
        const newHashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.update({ password: newHashedPassword });
        return this.#toSafeUser(user);
    }


    async updateProfile(userId, { firstName, lastName } = {})
    {
        logger.info(firstName)
        if(!firstName && !lastName){
            throw new ValidationError('Please provide at least one name field');
        }
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        await user.update({ firstName, lastName });
        return this.#toSafeUser(user);
    }
}

module.exports = UserService;