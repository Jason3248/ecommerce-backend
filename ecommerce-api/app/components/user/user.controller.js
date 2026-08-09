const { User } = require("ecommerce-data-model");
const UserService = require("./user.service.js");
const { NotFoundError } = require("../../lib/errors/index.js");
class UserController
{
    constructor()
    {
        this.service = new UserService();
    }

    async getProfile(req, res)
    {
        const result = await this.service.getProfile(req.user.id);
        return res.status(200).json({
            success: true,
            data: result
        });
    }


    async changePassword(req, res)
    {
        const result = await this.service.changePassword(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    }


    async updateProfile(req, res)
    {
        const result = await this.service.updateProfile(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            data: result
        })
    }
}

module.exports = UserController;