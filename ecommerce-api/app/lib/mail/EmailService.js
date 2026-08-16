const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../../../../.env') });
const nodemailer = require("nodemailer");
const { email } = require("zod");

class EmailService
{
    constructor()
    {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async verifyConnection()
    {
        await this.transporter.verify();
    }

    async sendVerificationEmail(user, token)
    {
        const verificationUrl =
            `${process.env.APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;

        await this.transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: user.email,
            subject: "Verify your email address",

            text:
                `Hi ${user.firstName},\n\n` +
                `Please verify your email address using the link below:\n\n` +
                `${verificationUrl}\n\n` +
                `This link will expire in 24 hours.\n\n` +
                `If you did not create an account, you can safely ignore this email.`,

            html: `
                <h2>Verify your email address</h2>

                <p>Hi ${user.firstName},</p>

                <p>
                    Please verify your email address by clicking the button below.
                </p>

                <p>
                    <a
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 10px 16px;
                            background-color: #007bff;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 5px;
                        "
                    >
                        Verify Email
                    </a>
                </p>

                <p>
                    This link will expire in 24 hours.
                </p>

                <p>
                    If you did not create an account, you can safely ignore this email.
                </p>
            `
        });
    }

    async sendPasswordResetEmail(user, token)
    {
        const passwordResetUrl = `${process.env.APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
        await this.transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: user.email,
            subject: 'Reset Your Password',
            text:
                `Hi ${user.firstName},\n\n` +
                `Please reset your password using the link below:\n\n` +
                `${passwordResetUrl}\n\n` +
                `This link will expire in 1 hour.\n\n`,
            html: `
                <h2>Verify your email address</h2>
                <p>Hi ${user.firstName},</p>
                <p>
                    Please reset your password by clicking the button below.
                </p>
                <p>
                    <a
                        href="${passwordResetUrl}"
                        style="
                            display: inline-block;
                            padding: 10px 16px;
                            background-color: #007bff;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 5px;
                        "
                    >
                        Reset Password
                    </a>
                </p>
                <p>
                    This link will expire in 1 hour.
                </p>
            `
        })

    }


    async sendEmailUpdateConfirmation(user, newEmail, token)
    {
        const emailUpdationUrl =
            `${process.env.APP_URL}/auth/confirm-email-change?token=${encodeURIComponent(token)}`;
        await this.transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: newEmail,
            subject: "Confirm your new email address",
            text:
                `Hi ${user.firstName},\n\n` +
                `You requested to change the email address on your account to this address.\n\n` +
                `Confirm this change using the link below:\n\n` +
                `${emailUpdationUrl}\n\n` +
                `This link will expire in 24 hours.\n\n` +
                `If you did not request this, you can safely ignore this email — your account email will not change.`,

            html: `
            <h2>Confirm your new email address</h2>
            <p>Hi ${user.firstName},</p>
            <p>
                You requested to change the email address on your account to this address.
                Confirm this change by clicking the button below.
            </p>
            <p>
                <a
                    href="${emailUpdationUrl}"
                    style="
                        display: inline-block;
                        padding: 10px 16px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                    "
                >
                    Confirm Email Change
                </a>
            </p>

            <p>
                This link will expire in 24 hours.
            </p>

            <p>
                If you did not request this, you can safely ignore this email — your account email will not change.
            </p>
        `
        });
    }
}

module.exports = EmailService;
