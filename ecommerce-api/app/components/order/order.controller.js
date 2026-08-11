const { Order } = require("ecommerce-data-model");
const OrderService = require("./order.service");

class OrderController
{
    constructor()
    {
        this.service = new OrderService();
    }
    async listMyOrders(req, res)
    {
        const result = await this.service.listMyOrders(req.user.id, req.query);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getMyOrderById(req, res)
    {
        const result = await this.service.getMyOrderById(req.user.id, req.params.orderId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async createOrder(req, res)
    {
        const result = await this.service.createOrder(req.user.id);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async cancelMyOrder(req, res)
    {
        const result = await this.service.cancelMyOrder(req.params.orderId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async listOrders(req, res)
    {
        const result = await this.service.listOrders(req.query);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getById(req, res)
    {
        const result = await this.service.getById(req.params.orderId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async updateOrderStatus(req, res)
    {
        const result = this.service.updateOrderStatus(req.params.orderId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }
}


module.exports = OrderController;