const { NotFoundError, ConflictError, BusinessRuleError } = require("../../lib/errors");
const { Op } = require(Sequelize);
const { User } = require("ecommerce-data-model");

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 30;

const SORTABLE_FIELDS = {
    firstName_asc: ['firstName', 'ASC'],
    firstName_desc: ['firstName', 'DESC'],
    lastName_asc: ['lastName', 'ASC'],
    lastName_desc: ['lastName', 'DESC'],
    createdAt_asc: ['createdAt', 'ASC'],
    createdAt_desc: ['createdAt', 'DESC']
};

const DEFAULT_SORT = ['firstName', 'ASC']

class AdminService
{
    #pagination(query)
    {
        const page = parseInt(query.page);
        const pageSize = parseInt(query.pageSize);
        if (!Number.isInteger(page) || page < 1) page = 1;
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
        if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
        return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
    }

    async listUsers(query)
    {
        const { page, pageSize, offset, limit } = #pagination(query);
        const where = {
            role: 'CUSTOMER'
        };
        if (query.isBlocked === "true")
        {
            where.isBlocked = true
        }
        const order = [SORTABLE_FIELDS[query.sortBy]] || [DEFAULT_SORT]
        const { rows, count } = await User.findandCountAll({
            where,
            limit,
            offset,
            order
        });
        return {
            rows,
            count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }

    async getUserById(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async blockUser(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (user.isBlocked)
        {
            throw new BusinessRuleError('User is already blocked');
        }
        await user.update({ isBlocked: true })
        return user;
    }

    async unblockUser(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (!user.isBlocked)
        {
            throw new BusinessRuleError('User is not blocked');
        }
        await user.update({ isBlocked: false })
        return user;
    }

    async deleteUser(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        await user.destroy();
        return null;
    }

    async restoreUser(userId)
    {
        const user = await User.findByPk(userId, { paranoid: false });
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (!user.deletedAt)
        {
            throw new BusinessRuleError('User not deleted');
        }
        await user.restore();
        return user;
    }
}


module.exports = AdminService;