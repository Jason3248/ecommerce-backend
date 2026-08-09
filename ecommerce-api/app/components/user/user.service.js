const { User } = require("ecommerce-data-model");
const { NotFoundError, UnauthorizedError } = require("../../lib/errors");

const SALT_ROUNDS = 10;
class UserService
{
    async getProfile(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        return user;

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
        return user;
    }


    async updateProfile(userId, { firstName, lastName })
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        await user.update({ firstName, lastName });
        return user;
    }
}

module.exports = UserService;