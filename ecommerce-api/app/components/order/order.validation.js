const { z } = require("zod");

const ORDER_STATUSES = [
    'PAYMENT_PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'PAYMENT_FAILED'
];

const updateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUSES)
});

module.exports = { updateOrderStatusSchema }