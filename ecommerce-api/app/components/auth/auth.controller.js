const AuthService = require("./auth.service.js");

class AuthController
{
    constructor()
    {
        this.service = new AuthService();
    }
    async register(req, res)
    {
        const result = await this.service.register(req.body);
        res.status(201).json({
            success: true,
            message: `The user with email: ${result.email} has been registered successfully`,
            data: result
        })
    }

    async login(req, res)
    {
        const result = await this.service.login(req.body);
        res.status(200).json({
            success: true,
            data: result
        })
    }

    async logout(req, res)
    {
        await this.service.logout(req.user.id);
        res.status(200).json({
            success: true
        })
    }

    async forgotPassword(req, res)
    {
        const result = await this.service.forgotPassword(req.body);
        res.status(200).json({
            success: true,
            data: null
        })
    }

    async resetPassword(req, res)
    {
        await this.service.resetPassword(req.body);
        res.status(200).json({
            success: true,
            message: 'Password has been updated successfully'
        });
    }

    async verifyEmail(req, res)
    {
        await this.service.verifyEmail(req.body);
        res.status(200).json({
            success: true,
            message: 'Your email has been verified successfully'
        });
    }


    async requestVerificationEmail(req, res)
    {
        await this.service.requestVerificationEmail(req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Verification Email has been sent successfully'
        });
    }


    async requestUpdationEmail(req, res)
    {
        await this.service.requestUpdationEmail(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Updation Email has been sent successfully'
        });
    }

    async updateEmail(req, res)
    {
        await this.service.updateEmail(req.body);
        res.status(200).json({
            success: true,
            message: 'Your email has been updated successfully'
        });
    }



}

module.exports = AuthController;