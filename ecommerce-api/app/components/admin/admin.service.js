const { NotFoundError, ConflictError, BusinessRuleError, ForbiddenError } = require("../../lib/errors");
const { Op } = require("sequelize");
const { User, SystemConfig } = require("ecommerce-data-model");
const bcrypt = require("bcrypt");
const { log } = require("winston");
const logger = require("../../configs/logger");

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 30;
const SALT_ROUNDS = 10;

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
        let page = parseInt(query.page);
        let pageSize = parseInt(query.pageSize);
        if (!Number.isInteger(page) || page < 1) page = 1;
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
        if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
        return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
    }
    #buildWhere(query)
    {
        const where = {};
        if (query.firstName)
        {
            where.name = { [Op.ilike]: `%${query.name}%` }
        }
        if (query.lastName)
        {
            where.sku = { [Op.ilike]: `%${query.sku}%` }
        }
        if (query.role)
        {
            where.sku = { [Op.ilike]: `%${query.role}%` }
        }
        if (query.isBlocked)
        {
            where.isBlocked = query.isBlocked
        }
        return where;
    }

    #toSafeUser(userInstance)
    {
        const { id, name, email, role, isEmailVerified, isBlocked, createdAt } =
            userInstance.toJSON ? userInstance.toJSON() : userInstance;
        return { id, name, email, role, isEmailVerified, isBlocked, createdAt };
    }

    async listUsers(query)
    {
        const { page, pageSize, offset, limit } = this.#pagination(query);
        const where = this.#buildWhere(query);
        const order = [SORTABLE_FIELDS[query.sortBy] || DEFAULT_SORT]
        const { rows, count } = await User.findAndCountAll({
            where,
            limit,
            offset,
            order
        });
        return {
            rows: rows.map(user => this.#toSafeUser(user)),
            count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }

    async getById(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        return this.#toSafeUser(user);
    }

    async blockUser(userId, currentAdminId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (user.isBlocked)
        {
            throw new ForbiddenError('User is already blocked');
        }
        if (String(userId) === String(currentAdminId))
        {
            throw new ForbiddenError('You cannot block your own account');
        }
        if (user.role === "ADMIN")
        {
            throw new ForbiddenError('You cannot block an Admin account');
        }
        await user.update({ isBlocked: true })
        return this.#toSafeUser(user);
    }

    async unblockUser(userId)
    {
        const user = await User.findByPk(userId);
        // logger.info(user);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (!user.isBlocked)
        {
            throw new BusinessRuleError('User is not blocked');
        }
        await user.update({ isBlocked: false })
        return this.#toSafeUser(user);
    }

    async deleteUser(userId, currentAdminId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }
        if (user.isBlocked)
        {
            throw new ForbiddenError('This user has been already deleted')
        }
        if (String(userId) === String(currentAdminId))
        {
            throw new ForbiddenError('You cannot delete your own account');
        }
        if (user.role === "ADMIN")
        {
            throw new ForbiddenError('You cannot delete an Admin account');
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
        return this.#toSafeUser(user);
    }

    async listConfig()
    {
        const configs = await SystemConfig.findAll({ order: [['key', 'ASC']] });
        return configs;
    }

    async updateConfig(key, { value })
    {
        const existing = await SystemConfig.findOne({ where: { key } });
        if (existing)
        {
            await existing.update({ value });
            return existing;
        }
        return SystemConfig.create({ key, value });
    }

    async createAdmin({ firstName, lastName, email, password })
    {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser)
        {
            throw new ConflictError('An admin with the email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const admin = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'ADMIN'
        });
        return this.#toSafeUser(user);
    }
}


module.exports = AdminService;