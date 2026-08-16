
const { z } = require("zod");

const updateConfigSchema = z.object({
    value: z.string().min(1).max(255)
});


const createAdminSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8)
});

const createOrUpdateConfig = z.object({
    "key": z.string().min(2),
    "value": z.string().min(1)
});

module.exports = { updateConfigSchema, createAdminSchema, createOrUpdateConfig };