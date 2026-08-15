const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../../configs/logger.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../../../env') });


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
            receipt: `rcpt_${orderId}`.slice(0, 40),
            notes: {
                internalOrderId: orderId
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);
        logger.info(
            `Created Razorpay order for order ${orderId}, ` +
            `amount ${amount} (${amountInSubUnits} paise) -> ${razorpayOrder.id}`
        );
        return {
            gatewayReference: razorpayOrder.id,
            redirectUrl: `http://localhost:${process.env.PORT || 3000}/api/pay/${razorpayOrder.id}`
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
    // console.log(signature);
    // console.log(rawBody);
    if (!signature || !rawBody)
    {
        return false;
    }
try {
        return Razorpay.validateWebhookSignature(rawBody, signature, configuredSecret);
    } catch (err) {
        logger.error(`Signature validation failed: ${err.message}`);
        return false;
    }
}

module.exports = {
    createPaymentRequest,
    verifyWebhookSignature
}