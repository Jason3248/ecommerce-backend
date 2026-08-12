const CartService = require("./cart.service.js");

class CartController
{
    constructor()
    {
        this.service = new CartService();
    }

    async getCart(req, res)
    {
        const result = await this.service.getCart(req.user.id);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async addItem(req, res)
    {
        const result = await this.service.addItem(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async updateItemQuantity(req, res)
    {
        const result = await this.service.updateItemQuantity(req.user.id, req.params.itemId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async removeItem(req, res)
    {
        await this.service.removeItem(req.user.id, req.params.itemId);
        return res.status(200).json({
            success: true,
            data: null
        });
    }

}

module.exports = CartController;