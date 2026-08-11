const ProductService = require("./product.service.js");
class ProductController
{
    constructor()
    {
        this.service = new ProductService();
    }

    async listProducts(req, res)
    {
        const result = await this.service.listProducts(req.query);
        return res.status(200).json({
            success: true,
            data: result
        })
    }

    async getById(req, res)
    {
        const result = await this.service.getById(req.params.productId);
        return res.status(200).json({
            success: true,
            data: result
        })
    }

    async createProduct(req, res)
    {
        const result = await this.service.createProduct(req.body);
        return res.status(200).json({
            success: true,
            data: result
        })
    }

    async updateProduct(req, res)
    {
        const result = await this.service.updateProduct(req.params.productId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async updateInventory(req, res)
    {
        const result = await this.service.updateInventory(req.params.productId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async deleteProduct(req, res)
    {
        await this.service.deleteProduct(req.params.productId);
        return res.status(200).json({
            success: true,
            data: null
        });
    }

    async restoreProduct(req, res)
    {
        const result = await this.service.restoreProduct(req.params.productId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }
}

module.exports = ProductController;