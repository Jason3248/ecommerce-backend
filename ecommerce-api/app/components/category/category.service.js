const { Category } = require("ecommerce-data-model");
const { NotFoundError } = require("../../lib/errors");

class CategoryService
{
    async listCategories()
    {
        const categories = await Category.findAll();
        return categories;
    }

    async getById(categoryId)
    {
        const category = await Category.findByPk(categoryId);
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
            throw new ConflictError('Category already exists');
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