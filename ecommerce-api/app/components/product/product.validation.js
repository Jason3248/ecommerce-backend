const { z } = require("zod");

const createProductSchema = z.object({
    sku: z.string().min(2).max(50),
    name: z.string().min(2).max(100),
    description: z.string().max(2000).optional(),
    categoryId: z.number(),
    price: z.number().min(0.01),
    stockQuantity: z.number().min(0).optional()
});

export const updateProductSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    categoryId: z.number().optional(),
    price: z.number().min(0.01).optional()
});

module.exports = { createProductSchema, updateProductSchema }