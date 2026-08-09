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
            token: result
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
}

module.exports = AuthController;