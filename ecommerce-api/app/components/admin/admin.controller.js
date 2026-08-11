const AdminService = require("./admin.service.js");

export class AdminController
{
    constructor()
    {
        this.service = new AdminService();
    }

    async listUsers(req, res)
    {
        const result = await this.adminService.listUsers(req.query);
        res.status(200).json({ success: true, data: result });
    };

    getUserById = async (req, res) =>
    {
        const result = await this.adminService.getUserById(req.params.id);
        res.status(200).json({ success: true, data: result });
    };

    blockUser = async (req, res) =>
    {
        const result = await this.adminService.blockUser(req.params.id);
        res.status(200).json({ success: true, data: result });
    };

    unblockUser = async (req, res) =>
    {
        const result = await this.adminService.unblockUser(req.params.id);
        res.status(200).json({ success: true, data: result });
    };

    softDeleteUser = async (req, res) =>
    {
        await this.adminService.softDeleteUser(req.params.id);
        res.status(200).json({ success: true, data: null });
    };

    restoreUser = async (req, res) =>
    {
        const result = await this.adminService.restoreUser(req.params.id);
        res.status(200).json({ success: true, data: result });
    };

    listConfig = async (req, res) =>
    {
        const result = await this.adminService.listConfig();
        res.status(200).json({ success: true, data: result });
    };

    updateConfig = async (req, res) =>
    {
        const result = await this.adminService.updateConfig(req.params.key, req.body);
        res.status(200).json({ success: true, data: result });
    };
}

export default new AdminController();
