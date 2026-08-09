const { Category } = require("ecommerce-data-model");

class CategoryService
{
    async listCategories()
    {
        const categories = await Category.findAll();
        return {

        }
    }
}
module.exports = CategoryService;