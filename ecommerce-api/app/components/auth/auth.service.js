const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { User, Cart, sequelize, PasswordResetToken, EmailVerificationToken } = require("ecommerce-data-model");
const { ConflictError, NotFoundError, UnauthorizedError, ForbiddenError, } = require("../../lib/errors/index.js");
const logger = require("../../configs/logger.js");
const EmailService = require("../../lib/mail/EmailService.js");

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24

class AuthService
{
    constructor()
    {
        this.emailService = new EmailService();
    }
    #hashToken(rawToken)
    {
        return crypto.createHash('sha256').update(rawToken).digest('hex');
    }

    #toSafeUser(userInstance)
    {
        const { id, name, email, role, isEmailVerified, isBlocked, createdAt } =
            userInstance.toJSON ? userInstance.toJSON() : userInstance;
        return { id, name, email, role, isEmailVerified, isBlocked, createdAt };
    }

    async register({ firstName, lastName, email, password })
    {
        // logger.info(email);
        const existingUser = await User.findOne({
            where: { email }
        });
        if (existingUser)
        {
            throw new ConflictError('An account with this email already exists.');
        }
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await sequelize.transaction(async (t) =>
        {
            const createdUser = await User.create(
                { firstName, lastName, email, password: passwordHash },
                { transaction: t }
            );
            await Cart.create({ userId: createdUser.id }, { transaction: t });
            return createdUser;
        });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        await EmailVerificationToken.create({
            userId: user.id,
            token: this.#hashToken(rawToken),
            expiresAt
        });

        try
        {
            const result = await this.emailService.sendVerificationEmail(user, rawToken);
            console.log("sendEmail Result: ", result);
        } catch (error)
        {
            console.error(error);
            logger.error('email verification url failed to send', { userId: user.id, error: error.message, stack: error.stack })
        }
        return this.#toSafeUser(user);
    }

    async login({ email, password })
    {
        const user = await User.findOne({ where: { email } });
        if (!user)
        {
            logger.warn('Login failed: no account for this email');
            throw new UnauthorizedError('Invalid email');
        }
        if (user.isBlocked)
        {
            logger.warn('Login failed: account is blocked', { userId: user.id });
            throw new ForbiddenError('The account has been blocked');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
        {
            logger.warn('Login failed: incorrect password', { userId: user.id });
            throw new UnauthorizedError("Invalid password");
        }
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY || '1d'
            }
        );

        return {
            token,
            user: this.#toSafeUser(user)
        };
    }

    async logout(userId)
    {
        return null;
    }

    async forgotPassword({ email })
    {
        const user = await User.findOne({ where: { email } });
        if (!user)
        {
            return null;
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        await PasswordResetToken.create({
            userId: user.id,
            token: this.#hashToken(rawToken),
            expiresAt
        });

        // const resetUrl = `${process.env.APP_BASE_URL || ''}/reset-password?token=${rawToken}`;
        // await sendEmail({
        //     to: user.email,
        //     subject: 'Reset Your Password',
        //     text: `Use this link to reset your password (expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes): ${resetUrl}`
        // });
        return rawToken;
    }

    async resetPassword({ token, password })
    {
        const hashedToken = this.#hashToken(token);
        const resetToken = await PasswordResetToken.findOne({ where: { token: hashedToken } });
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date())
        {
            throw new UnauthorizedError('This password reset link is invalid or has expired');
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await sequelize.transaction(async (t) =>
        {
            await User.update(
                {
                    password: hashedPassword
                },
                {
                    where: {
                        id: resetToken.userId
                    },
                    transaction: t
                }
            );
            await resetToken.update({ usedAt: new Date() }, { transaction: t });
        })
    }


    async verifyEmail(userId, { email })
    {
        const user = await User.infdByPk(userId);
        if (!user)
        {
            throw new NotFoundError('user not found');
        }
    }
}
module.exports = AuthService;