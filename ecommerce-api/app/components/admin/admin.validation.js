
const { z } = require("zod");

const updateConfigSchema = z.object({
    value: z.string().min(1).max(255)
});
module.exports = { updateConfigSchema };