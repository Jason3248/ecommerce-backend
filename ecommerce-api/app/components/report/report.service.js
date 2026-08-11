
const { Order, OrderItem, Payment } = require("ecommerce-data-model");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const { stringify } = require("csv-stringify/sync");


const PDF_COLUMNS = [
    { label: 'Order ID', width: 60 },
    { label: 'Date', width: 85 },
    { label: 'Items', width: 45 },
    { label: 'Total', width: 90 },
    { label: 'Payment', width: 90 },
    { label: 'Status', width: 90 }
];
const PAGE_SIZE = [595, 842]; // A4
const MARGIN = 40;
const ROW_HEIGHT = 20;



class ReportService
{

    #getLatestPaymentStatus(order)
    {
        if (!order.payments || order.payments.length === 0) return null;
        const sorted = [...order.payments].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return sorted[0].status;
    }


    #getOrderHistoryRows(userId)
    {
        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: Payment,
                    as: 'payments'
                }
            ],
            order: ['createdAt', 'DESC']
        });



        return orders.map(order =>
        {
            return {
                id: order.id,
                createdAt: order.createdAt,
                itemCount: order.items.length,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentStatus: this.#getLatestPaymentStatus(order) || '-'
            }
        })
    }
}

module.exports = ReportService;