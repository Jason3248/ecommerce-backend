
const { z } = require("zod");


const addItemSchema = z.object({
    productId: z.number().int(),
    quantity: z.number().int().min(1)
});

const updateItemQuantitySchema = z.object({
    quantity: z.number().int().min(1)
})
