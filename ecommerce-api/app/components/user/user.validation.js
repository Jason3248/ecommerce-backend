const { z } = require("zod");

const updateProfileSchema = z.object({
    name: z.string().min(2).max(120)
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema
}