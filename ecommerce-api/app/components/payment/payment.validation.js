const { z } = require("zod");

const initiatePaymentSchema = z.object({
    method: z.enum(['CARD', 'UPI', 'NETBANKING', 'WALLET']).optional()
});