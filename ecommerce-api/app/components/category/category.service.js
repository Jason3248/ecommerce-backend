const { Category } = require("ecommerce-data-model");
const { NotFoundError } = require("../../lib/errors");

const SORTABLE_FIELDS = {
    name_asc: ['name', 'ASC'],
    name_desc: ['name', 'DESC'],
}

const DEFAULT_SORT = ['name', 'ASC'];

class CategoryService
{

    async listCategories(role)
    {
        const categories = await Category.findAll({ paranoid: role !== 'ADMIN' });
        return categories;
    }


    async getById(categoryId, role)
    {
        const category = await Category.findByPk(categoryId, { paranoid: role !== 'ADMIN' });
        if (!category)
        {
            throw new NotFoundError('Product not found');
        }
        return category;
    }


    async createCategory({ name })
    {
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory)
        {
            throw new ConflictError('Category with this name already exists');
        }
        const createdCategory = await Category.create({ name });
        return createdCategory;
    }

    async updateCategory(categoryId, { name })
    {
        const category = await Category.findByPk(categoryId);
        if (!category)
        {
            throw new NotFoundError('Category not found');
        }
        if (name && name !== category.name)
        {
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory)
            {
                throw new ConflictError('A category with this name already exists');
            }
        }
        await category.update({ ...(name !== undefined && { name }) });
        return category;
    }


    async deleteCategory(categoryId)
    {
        const category = await Category.findByPk(categoryId);
        if (!category)
        {
            throw new NotFoundError('Category not found');
        }
        // if (categoy)
        await category.destroy();
    }


    async restoreCategory(categoryId)
    {
        const category = await Category.findByPk(categoryId, { paranoid: false });
        if (!category)
        {
            throw new NotFoundError('Category not found');
        }
        await category.restore();
        return category;
    }
}
module.exports = CategoryService;