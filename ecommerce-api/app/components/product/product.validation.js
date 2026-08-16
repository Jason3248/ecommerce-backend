const { z } = require("zod");

const createProductSchema = z.object({
    sku: z.string().min(2).max(50),
    name: z.string().min(2).max(100),
    description: z.string().max(2000).optional(),
    categoryId: z.string(),
    price: z.number().min(0.01),
    stockQuantity: z.number().min(0).optional()
});

const updateProductSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    categoryId: z.string().optional(),
    price: z.number().min(0.01).optional(),
    description: z.string().optional()
})

const updateInventorySchema = z.object({
    stockQuantity: z.number().int().min(0)
})

module.exports = { createProductSchema, updateProductSchema, updateInventorySchema }