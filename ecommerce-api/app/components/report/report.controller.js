const ReportService = require("./report.service.js");

class ReportController
{
    constructor()
    {
        this.service = new ReportService();
    }

    async orderHistoryPdf(userId)
    {

    }
}

module.exports = ReportController;