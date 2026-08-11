const crypto = require("node:crypto");
const logger = require("../../configs/logger.js");
const createPaymentRequest = ({ orderId, amount }) =>
{
    const gatewayReference = crypto.randomBytes(12).toString('hex')
    logger.info(
        `sCreated payment request for order ${orderId}, ` +
        `amount ${amount} -> ${gatewayReference}`
    );
    return {
        gatewayReference,
        redirectUrl: `https://stub-payment-gateway.local/pay/${gatewayReference}`
    };
}


const verifyWebhookSignature = (headers) =>
{
    const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!configuredSecret)
    {
        logger.info(
            "PAYMENT_WEBHOOK_SECRET not set — webhook signature check SKIPPED"
        );
        return true;
    }
    return headers['x-webhook-signature'] === configuredSecret
}


module.exports = {
    createPaymentRequest,
    verifyWebhookSignature
}