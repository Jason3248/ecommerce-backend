const { Payment, Order, sequelize, OrderItem, Cart, Product, CartItem } = require("ecommerce-data-model");
const { NotFoundError, BusinessRuleError, InvalidOrderStateError, ConflictError, ValidationError } = require("../../lib/errors");
const { createPaymentRequest, verifyWebhookSignature } = require("../../lib/payment-gateway/paymentGatewayHelper.js");
const {Op} = require("sequelize");
const PAYABLE_STATES = ['PAYMENT_PENDING', 'PAYMENT_FAILED'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 30;


class PaymentService
{

    #pagination(query)
    {
        let page = parseInt(query.page, 10);
        let pageSize = parseInt(query.pageSize, 10);
        if (!Number.isInteger(page) || page < 1) page = 1;
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
        if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
        return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
    }

    async initiatePayment(userId, orderId)
    {
        const order = await Order.findOne({
            where: {
                id: orderId,
                userId
            }
        });
        if (!order)
        {
            throw new NotFoundError('Order not found');
        }
        if (!PAYABLE_STATES.includes(order.status))
        {
            throw new InvalidOrderStateError('The Payment for this order cannot be made at this stage');
        }
        let payment = await Payment.findOne({
            where: { orderId },
            order: [['createdAt', 'DESC']]
        });
        if (payment && payment.status === "SUCCESS")
        {
            throw new ConflictError('The payment for this order has already been made successfully');
        }
        if (!payment || payment.status === "FAILED")
        {
            payment = await Payment.create({
                userId,
                orderId,
                amount: order.totalAmount,
                status: 'PENDING'
            });
        }
        const { gatewayReference, redirectUrl } = await createPaymentRequest({
            orderId: order.id,
            amount: order.totalAmount
        });

        await payment.update({ gatewayReference });
        return {
            paymentId: payment.id,
            gatewayReference,
            redirectUrl,
            amount: payment.amount
        }
    }

    // async handleWebhook(payload, headers)
    // {
    //     if (!verifyWebhookSignature(headers))
    //     {
    //         throw new ValidationError('Invalid webhook signature');
    //     }
    //     const { gatewayReference, status } = payload;
    //     if (!gatewayReference || !['SUCCESS', 'FAILED'].includes(status))
    //     {
    //         throw new ValidationError('Malformed webhook payload');
    //     }
    //     const payment = await Payment.findOne({
    //         where: {
    //             gatewayReference
    //         }
    //     });
    //     if (!payment)
    //     {
    //         throw new NotFoundError('Payment with the gateway reference not available');
    //     }
    //     if (payment.status !== 'PENDING')
    //     {
    //         return null;
    //     }
    //     if (status === 'FAILED')
    //     {
    //         await sequelize.transaction(async (t) =>
    //         {
    //             await payment.update({ status: 'FAILED' }, { transaction: t });
    //             await Order.update({ status: 'PAYMENT_FAILED' }, {
    //                 where: {
    //                     id: payment.orderId
    //                 },
    //                 transaction: t
    //             });
    //         });
    //         return null;
    //     }
    //     const order = await Order.findByPk(payment.orderId, {
    //         include: [
    //             {
    //                 model: OrderItem,
    //                 as: 'items'
    //             }
    //         ]
    //     });
    //     if (!order)
    //     {
    //         throw new NotFoundError('Order not found for this payment');
    //     }
    //     const cart = await Cart.findOne({ where: { userId: payment.userId } });
    //     await sequelize.transaction(async (t) =>
    //     {
    //         await payment.update({ status: 'SUCCESS', completedAt: new Date() }, { transaction: t });
    //         await order.update({ status: 'PAID' }, { transaction: t });
    //         for (const item of order.items)
    //         {
    //             await Product.decrement('stockQuantity', {
    //                 by: item.quantity,
    //                 where: { id: item.productId },
    //                 transaction: t
    //             });
    //         }
    //         if (cart)
    //         {
    //             const orderItemIds = order.items.map(item => item.productId);
    //             for (const productId of orderItemIds)
    //             {
    //                 await CartItem.destroy(
    //                     {
    //                         where: { cartId: cart.id, productId },
    //                         transaction: t
    //                     })
    //             }
    //         }
    //     });
    //     return null;
    // }

    async handleWebhook(rawBody, headers)
    {
        if (!verifyWebhookSignature(rawBody, headers['x-razorpay-signature']))
        {
            throw new ValidationError('Invalid webhook signature');
        }
        const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
        const event = payload.event;
        const paymentEntity = payload.payload?.payment?.entity;
        const orderEntity = payload.payload?.order?.entity;
        const gatewayReference = paymentEntity?.order_id || orderEntity?.id;
        const method = payload.payload?.payment?.entity?.method.toUpperCase();
        console.log(gatewayReference);
        let status = null;
        if (event === 'payment.captured' || event === 'order.paid')
        {
            status = 'SUCCESS';
        } else if (event === 'payment.failed')
        {
            status = 'FAILED';
        }
        if (!status || !gatewayReference)
        {
            return { ignored: true };
        }
        const payment = await Payment.findOne({
            where: {
                gatewayReference
            }
        });
        if (!payment)
        {
            throw new NotFoundError('Payment with the gateway reference not available');
        }
        if (payment.status !== 'PENDING')
        {
            return null;
        }
        if (status === 'FAILED')
        {
            await sequelize.transaction(async (t) =>
            {
                await payment.update({ status: 'FAILED' }, { transaction: t });
                await Order.update({ status: 'PAYMENT_FAILED' }, {
                    where: {
                        id: payment.orderId
                    },
                    transaction: t
                });
            });
            return null;
        }
        const order = await Order.findByPk(payment.orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                }
            ]
        });
        if (!order)
        {
            throw new NotFoundError('Order not found for this payment');
        }
        const cart = await Cart.findOne({ where: { userId: payment.userId } });
        await sequelize.transaction(async (t) =>
        {
            await payment.update({ status: 'SUCCESS', method, completedAt: new Date() }, { transaction: t });
            await order.update({ status: 'PAID' }, { transaction: t });
            for (const item of order.items)
            {
                await Product.decrement('stockQuantity', {
                    by: item.quantity,
                    where: { id: item.productId },
                    transaction: t
                });
            }
            if (cart)
            {
                const orderItemIds = order.items.map(item => item.productId);
                for (const productId of orderItemIds)
                {
                    await CartItem.destroy(
                        {
                            where: { cartId: cart.id, productId },
                            transaction: t
                        })
                }
            }
        });
        return null;
    }
    async getMyPaymentById(userId, paymentId)
    {
        const payment = await Payment.findOne({ where: { id: paymentId, userId } });
        if (!payment)
        {
            throw new NotFoundError('Payment not found');
        }
        return payment;
    }

    async getById(paymentId)
    {
        const payment = await Payment.findByPk(paymentId);
        if (!payment)
        {
            throw new NotFoundError('Payment not found');
        }
        return payment;
    }

    async listPayments(query)
    {
        const { page, pageSize, offset, limit } = this.#pagination(query);
        const where = {};
        if (query.status) where.status = query.status.toUpperCase();

        const { rows, count } = await Payment.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
        return {
            rows, count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }
}


module.exports = PaymentService;