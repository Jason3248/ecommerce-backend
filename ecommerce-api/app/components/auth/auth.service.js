const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { User, Cart, sequelize, PasswordResetToken, EmailVerificationToken, EmailUpdationToken } = require("ecommerce-data-model");
const { ConflictError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, BusinessRuleError } = require("../../lib/errors/index.js");
const logger = require("../../configs/logger.js");
const EmailService = require("../../lib/mail/EmailService.js");

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const EMAIL_CHANGE_TOKEN_EXPIRY_HOURS = 1;

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
        const { id, email, role, isEmailVerified } =
            userInstance.toJSON ? userInstance.toJSON() : userInstance;
        return { id, email, role, isEmailVerified};
    }

    async register({ firstName, lastName, email, password })
    {
        // logger.info(email);
        const existing = await User.findOne({
            where: { email }
        });
        if (existing)
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
            await this.emailService.sendVerificationEmail(user, rawToken);
        } catch (error)
        {
            console.error(error);
            logger.error('email verification url failed to send', { userId: user.id, error: error.message, stack: error.stack })
        }
        return this.#toSafeUser(user);
    }

    async login({ email, password } = {})
    {
        const user = await User.findOne({ where: { email }, paranoid: false });
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
        if(user.deletedAt){
            throw new ForbiddenError('This account has been deleted. Please contact admin');
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
            token
        };
    }

    async logout(userId)
    {
        return null;
    }

    async forgotPassword({ email })
    {
        if(!email){
            throw new ValidationError('Please provide a valid and registered email ID')
        }
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
        try
        {
            await this.emailService.sendPasswordResetEmail(user, rawToken);
        } catch (error)
        {
            console.error(error);
            logger.error('Forgot password email failed to send', { userId: user.id, error: error.message });
        }
        return null;
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

    async verifyEmail({ token })
    {
        if (!token)
        {
            throw new ValidationError('Verification token is required');
        }
        const hashedToken = this.#hashToken(token);
        const verificationToken = await EmailVerificationToken.findOne({
            where: { token: hashedToken }
        });
        if (!verificationToken || verificationToken.expiresAt < new Date())
        {
            throw new UnauthorizedError('This verification link is invalid or has expired');
        }
        const user = await User.findByPk(verificationToken.userId);
        if (!user)
        {
            throw new UnauthorizedError('This verification link is invalid or has expired');
        }
        if (user.isEmailVerified)
        {
            await verificationToken.destroy();
            return null;
        }
        await sequelize.transaction(async (t) =>
        {
            await user.update({ isEmailVerified: true }, { transaction: t });
            await verificationToken.destroy({ transaction: t }); // consumes it — no usedAt column, deletion IS the "used" state
        });

        return null;
    }

    async requestVerificationEmail(userId)
    {
        const user = await User.findByPk(userId);
        if (!user)
        {
            throw new NotFoundError('User not found');
        }

        if (user.isEmailVerified)
        {
            throw new ConflictError('Your email is already verified');
        }

        await EmailVerificationToken.destroy({ where: { userId } });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        await EmailVerificationToken.create({
            userId: user.id,
            token: this.#hashToken(rawToken),
            expiresAt
        });

        try
        {
            await this.emailService.sendVerificationEmail(user, rawToken);
        }
        catch (error)
        {
            console.error(error);
            logger.error('Resend verification email failed to send', { userId: user.id, error: error.message });
        }

        return null;
    }

    async requestUpdationEmail(userId, { email, password })
    {
        const user = await User.findByPk(userId);
        if (!userId)
        {
            throw new NotFoundError('User not found');
        }
        if (email === user.email)
        {
            throw new BusinessRuleError('Please provide a different email than your current one');
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
        {
            throw new UnauthorizedError('Invalid password');
        }
        const existing = await User.findOne({ where: { email } });
        if (existing)
        {
            throw new ConflictError('An account with this email already exists');
        }
        await EmailUpdationToken.destroy({ where: { userId } });
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + EMAIL_CHANGE_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
        await EmailUpdationToken.create({
            userId: user.id,
            newEmail: email,
            token: this.#hashToken(rawToken),
            expiresAt
        });
        try
        {
            await this.emailService.sendEmailUpdateConfirmation(user, email, rawToken)
        } catch (error)
        {
            logger.error('Email change alert failed to send', { userId: user.id, error: error.message });
        }
    }


    async updateEmail({ token })
    {
        if (!token)
        {
            throw new ValidationError('Token is required');
        }
        const hashedToken = this.#hashToken(token);
        const updationToken = await EmailUpdationToken.findOne({ where: { token: hashedToken } });
        if (!updationToken || updationToken.expiresAt < new Date())
        {
            throw new ValidationError('The Email updation link has been expires or is invalid');
        }
        const existing = await User.findOne({ where: { email: updationToken.newEmail } });
        if (existing)
        {
            throw new ValidationError('This email address is no longer available');
        }
        await sequelize.transaction(async (t) =>
        {
            await User.update(
                {
                    email: updationToken.newEmail
                },
                {
                    where: {
                        id: updationToken.userId
                    },
                    transaction: t
                }
            );
            await updationToken.destroy({ transaction: t });
        });
        return null;
    }
}
module.exports = AuthService;