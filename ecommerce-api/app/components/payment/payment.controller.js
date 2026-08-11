const PaymentService = require("./payment.service.js");

class PaymentController
{
    controller()
    {
        this.service = new PaymentService();
    }

    async initiatePayment(req, res)
    {
        const result = await this.service.initiatePayment(req.user.id, req.params.orderId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async handleWebhook(req, res)
    {
        await this.service.handleWebhook(req.body, req.headers);
        return res.status(200).json({
            success: true,
            data: null
        });
    }

    async getMyPaymentById(req, res)
    {
        const result = await this.service.getMyPaymentById(req.user.id, req.params.paymentId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getById(req, res)
    {
        const result = await this.service.getById(req.params.paymentId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async listPayments(req, res)
    {
        const result = await this.service.listPayments(req.query);
        return res.status(200).json({
            success: true,
            data: result
        });
    }
}

module.exports = PaymentController;