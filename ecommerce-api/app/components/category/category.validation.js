const { z } = require("zod");

const createCategorySchema = z.object({
    name: z.string().min(2).max(100)
});

const updateCategorySchema = z.object({
    name: z.string().min(2).max(100).optional()
});
