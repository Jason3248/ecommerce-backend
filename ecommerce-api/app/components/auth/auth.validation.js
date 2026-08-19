
const { z } = require("zod");


const nameSchema = (field) =>
    z.string({ required_error: `${field} is required` })
        .trim()
        .min(2, `${field} must be at least 2 characters long`)
        .max(50, `${field} cannot exceed 50 characters`)
        .regex(/^[a-zA-Z\s'-]+$/, `${field} can only contain letters, spaces, hyphens, and apostrophes`);

const emailSchema = z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters");

const passwordSchema = z
    

const registerSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

const forgotPasswordSchema = z.object({
    email: z.string().email()
});

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8)
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};

