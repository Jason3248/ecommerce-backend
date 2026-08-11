const CategoryService = require("./category.service.js");

class CategoryController
{
    constructor()
    {
        this.service = new CategoryService();
    }

    async listCategories(req, res)
    {
        const result = await this.service.listCategories();
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getById(req, res)
    {
        const result = await this.service.getById(req.params.categoryId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async createCategory(req, res)
    {
        const result = await this.service.createCategory(req.body);
        return res.status(201).json({
            success: true,
            data: result
        })
    }

    async updateCategory(req, res)
    {
        const result = await this.service.updateCategory(req.params.categoryId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async deleteCategory(req, res)
    {
        await this.service.deleteCategory(req.params.categoryId);
        return res.status(200).json({
            success: true,
            data: null
        });
    }

    async restoreCategory(req, res)
    {
        const result = await this.service.restoreCategory(req.params.categoryId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }


}

module.exports = CategoryController;