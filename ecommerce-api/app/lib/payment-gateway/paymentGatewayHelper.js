const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../../configs/logger.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../../../env') })
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentRequest = async ({ orderId, amount }) =>
{
    try
    {
        const amountInSubUnits = Math.round(Number(amount) * 100);
        const options = {
            amount: amountInSubUnits,
            currency: 'INR',
            receipt: `rcpt_${orderId}`.slice(0, 40), // Razorpay receipt max length is 40 chars
            notes: {
                internalOrderId: orderId.toString(),
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);
        logger.info(
            `Created Razorpay order for internal order ${orderId}, ` +
            `amount ${amount} (${amountInSubUnits} paise) -> ${razorpayOrder.id}`
        );
        return {
            gatewayReference: razorpayOrder.id, // e.g., 'order_EKwxwAgItmmGAv'
            // For backend-only API testing, Razorpay Checkout uses the order ID directly,
            // but we provide a consistent return object for your service:
            redirectUrl: `https://api.razorpay.com/v1/checkout/public?order_id=${razorpayOrder.id}`
        };
    } catch (error)
    {
        logger.error(`Error creating Razorpay order: ${error.message}`);
        throw error;
    }
}


const verifyWebhookSignature = (rawBody, signature) =>
{
    const configuredSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!configuredSecret)
    {
        logger.warn('RAZORPAY_WEBHOOK_SECRET not set, skipping verification.');
        return true;
    }
    if (!signature || !rawBody)
    {
        return false;
    }
    const expectedSignature = crypto.createHmac('sha256', configuredSecret).update(rawBody).digest('hex');

    return expectedSignature === signature;
}

module.exports = {
    createPaymentRequest,
    verifyWebhookSignature
}