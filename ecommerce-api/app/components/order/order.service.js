const { Order, Cart, sequelize, CartItem, OrderItem, Product, Payment } = require("ecommerce-data-model");
const { NotFoundError, ForbiddenError, ValidationError, BusinessRuleError, OutOfStockError } = require("../../lib/errors");
const { Op } = require("sequelize");

const CANCELLABLE_STATES = ['PAYMENT_PENDING', 'PROCESSING', 'SHIPPED']

const VALID_STATUS_TRANSITIONS = {
    PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
    PAID: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    PAYMENT_FAILED: []
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 30;

class OrderService
{
    async #getConfigNumber(key)
    {
        const config = await SystemConfig.findOne({ where: { key } });
        if (!config) return 0;
        const parsed = Number(config.value);
        return parsed;
    }

    #pagination(query)
    {
        let page = parseInt(query.page, 10);
        let pageSize = parseInt(query.pageSize, 10);
        if (!Number.isInteger(page) || page < 1) page = 1;
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
        if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
        return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
    }

    async createOrder(userId)
    {
        const cart = await Cart.findOne({
            where: { userId },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });
        if (!cart || cart.items.length === 0)
        {
            throw new BusinessRuleError('Your Cart is empty');
        }

        for (const item of cart.items)
        {
            const product = item.product;
            if (!product)
            {
                throw new BusinessRuleError(`The product ${product.name} is no longer available for purchase`);
            }
            if (item.quantity > product.stockQuantity)
            {
                throw new OutOfStockError(
                    `Only ${product.stockQuantity} unit of "${product.name}" are available`
                );
            }
        }

        const orderItemsData = cart.items.map(item =>
        {
            const unitPrice = parseFloat(item.product.price);
            const lineTotal = Number((item.quantity * unitPrice).toFixed(2));
            return {
                productId: item.productId,
                quantity: item.quantity,
                productName: item.product.name,
                productSku: item.product.sku,
                unitPrice,
                lineTotal
            }
        });
        const subTotal = Number(orderItemsData.reduce((acc, curr) => acc + curr.lineTotal, 0).toFixed(2));
        const taxPercentage = await this.#getConfigNumber('TAX_PERCENTAGE');
        const shippingCharge = await this.#getConfigNumber('SHIPPING_CHARGE');
        const freeShippingThreshold = await this.#getConfigNumber('FREE_SHIPPING_THRESHOLD');
        const taxAmount = Number(((subtotalAmount * taxPercentage) / 100).toFixed(2));
        const shippingAmount = subtotalAmount >= freeShippingThreshold ? 0 : shippingCharge;
        const totalAmount = Number((subtotalAmount + taxAmount + shippingAmount).toFixed(2));

        const order = await sequelize.transaction(async (t) =>
        {
            const createdOrder = await Order.create({
                userId,
                status: 'PAYMENT_PENDING',
                subtotalAmount,
                taxAmount,
                shippingAmount,
                totalAmount
            },
                { transaction: t }
            );

            await OrderItem.bulkCreate(
                orderItemsData.map(item =>
                {
                    return {
                        ...item,
                        orderId: createdOrder.id
                    }
                }),
                { transaction: t }
            );


            await Payment.create({
                orderId: createdOrder.id,
                userId,
                amount: totalAmount,
                status: 'PENDING'
            },
                { transaction: t }
            )
            return createdOrder;
        })
        return order;
    }

    async cancelMyOrder(orderId)
    {
        const order = await Order.findByPk(orderId);
        if (!order)
        {
            throw new NotFoundError('Order not found');
        }
        const orderStatus = order.status;
        if (!CANCELLABLE_STATES.includes(orderStatus))
        {
            throw new BusinessRuleError('Order cannot be cancelled at this stage')
        }
        await order.update({ status: 'CANCELLED' });
        return order;
    }


    async listMyOrders(userId, query)
    {
        const { page, pageSize, offset, limit } = this.#pagination(query);
        const { rows, count } = Order.findandCountAll(
            {
                where: { userId },
                include: [
                    {
                        model: OrderItem,
                        as: 'items'
                    },
                    {
                        include: Payment,
                        as: 'payments'
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset,
                limit,
                distinct: true
            });

        return {
            rows,
            count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }

    async getMyOrderById(userId, orderId)
    {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: Payment,
                    as: 'payments'
                }
            ]
        });
        if (!order)
        {
            throw new NotFoundError('Order not found');
        }
        return order;
    }

    async listOrders(query)
    {
        const { page, pageSize, limit, offset } = this.#pagination(query);
        const where = {};
        if (query.status) where.status = { [Op.ilike]: `%${query.status}%` }
        const { rows, count } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: Payment,
                    as: 'payments'
                }
            ],
            limit,
            offset,
            distinct: true
        });
        return {
            rows,
            count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }

    async getById(orderId)
    {
        const order = await Order.findOne(
            {
                where: { orderId },
                include: [
                    {
                        model: OrderItem,
                        as: 'items'
                    },
                    {
                        model: Payment,
                        as: 'payments'
                    }
                ]
            });
        if (!order)
        {
            throw new NotFoundError('Order not found');
        }
        return order;
    }

    async updateOrderStatus(orderId, { status })
    {
        const order = await Order.findByPk(orderId);
        if (!order)
        {
            throw new NotFoundError('Order not found');
        }
        const orderStatus = order.status;
        if (!VALID_STATUS_TRANSITIONS[orderStatus].includes(status))
        {
            throw new BusinessRuleError('Invalid order transition');
        }
        await order.update({ status });
        return order;
    }

}


module.exports = OrderService;