const AdminService = require("./admin.service.js");
class AdminController
{
    constructor()
    {
        this.service = new AdminService();
    }

    async listUsers(req, res)
    {
        const result = await this.service.listUsers(req.query);
        res.status(200).json({ success: true, data: result });
    };

    async getById(req, res) 
    {
        const result = await this.service.getById(req.params.userId);
        res.status(200).json({ success: true, data: result });
    };

    async blockUser(req, res)
    {
        const result = await this.service.blockUser(req.params.userId, req.user.id);
        res.status(200).json({ success: true, data: result });
    };

    async unblockUser(req, res)
    {
        const result = await this.service.unblockUser(req.params.userId);
        res.status(200).json({ success: true, data: result });
    };

    async deleteUser(req, res)
    {
        await this.service.deleteUser(req.params.userId, req.user.id);
        res.status(200).json({ success: true, data: null });
    };

    async restoreUser(req, res)
    {
        const result = await this.service.restoreUser(req.params.userId);
        res.status(200).json({ success: true, data: result });
    };

    async listConfig(req, res)
    {
        const result = await this.service.listConfig();
        res.status(200).json({ success: true, data: result });
    };

    async createOrUpdateConfig(req, res)
    {
        const result = await this.service.createOrUpdateConfig(req.body);
        res.status(200).json({ success: true, data: result });
    };

    async createAdmin(req, res)
    {
        const result = await this.service.createAdmin(req.body);
        res.status(200).json({ success: true, data: result });
    }
}

module.exports = AdminController;
