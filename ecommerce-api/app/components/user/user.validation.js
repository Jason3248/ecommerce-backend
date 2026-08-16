const { z } = require("zod");

const updateProfileSchema = z.object({
    firstName: z.string().min(2).max(120).optional(),
    lastName: z.string().min(2).max(120).optional()
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema
}