
const { z } = require("zod");


const addItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1)
});

const updateItemQuantitySchema = z.object({
    quantity: z.number().int().min(0)
});

module.exports = {
    addItemSchema,
    updateItemQuantitySchema
}
