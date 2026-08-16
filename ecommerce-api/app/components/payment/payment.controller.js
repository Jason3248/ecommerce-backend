const logger = require("../../configs/logger.js");
const PaymentService = require("./payment.service.js");
const path = require("path");
require("dotenv").config({path: path.resolve("../../../../.env")});
class PaymentController
{
    constructor()
    {
        this.service = new PaymentService();
    }

    async initiatePayment(req, res)
    {
        logger.info(req.params.orderId);
        const result = await this.service.initiatePayment(req.user.id, req.params.orderId);
        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async handleWebhook(req, res)
    {
        await this.service.handleWebhook(req.rawBody, req.headers);
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

    async getPaymentModal(req, res){
        const { orderId } = req.params;
        res.send(`
        <!DOCTYPE html>
        <html>
            <head>
            <title>Checkout</title>
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </head>
            <script>
                const rzp = new Razorpay({
                key: "${process.env.RAZORPAY_KEY_ID}",
                order_id: "${orderId}",
                name: "Ecommerce",
                handler: (res) => alert("Payment complete: " + res.razorpay_payment_id)
                });
                window.onload = () => rzp.open();
            </script>
            </body>
        </html>
        `);
    }
}

module.exports = PaymentController;