// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();

// ĐÚNG: Import class PayOS
const PayOS = require('@payos/node');
const Order = require('../models/Order');

// Tạo instance PayOS (dùng new)
const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

// === TẠO LINK THANH TOÁN QR ===
router.post('/create-qr', async (req, res) => {
    const { orderId } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!orderId) return res.status(400).json({ message: 'Thiếu orderId' });

    try {
        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.paymentMethod !== 'qr') return res.status(400).json({ message: 'Không phải thanh toán QR' });

        const checkoutData = {
            orderCode: Date.now(),
            amount: order.total,
            description: `ĐH ${orderId}`.substring(0, 25), // ≤ 25 ký tự
            items: order.items.map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            returnUrl: `http://localhost:3000/orders?status=success&orderId=${orderId}`,
            cancelUrl: `http://localhost:3000/orders?status=cancel&orderId=${orderId}`,
            buyerName: order.name,
            buyerPhone: order.phone
        };

        const paymentLink = await payOS.createPaymentLink(checkoutData);

        order.paymentLinkId = paymentLink.paymentLinkId;
        await order.save();

        res.json({
            success: true,
            paymentUrl: paymentLink.checkoutUrl,
            qrCode: paymentLink.qrCode,
            paymentLinkId: paymentLink.paymentLinkId
        });
    } catch (err) {
        console.error('Lỗi tạo QR:', err.message);
        res.status(500).json({ message: 'Lỗi tạo link thanh toán: ' + err.message });
    }
});

// === TẠO LINK QR TẠM (CHƯA TẠO ĐƠN) ===
router.post('/create-qr-temp', async (req, res) => {
    const { tempOrderId, items, name, phone, address, total } = req.body;
    const userId = req.headers['user-id'];

    if (!userId || !tempOrderId) return res.status(400).json({ message: 'Thiếu thông tin' });

    try {
        const checkoutData = {
            orderCode: Date.now(),
            amount: total,
            description: `QR ${tempOrderId}`.substring(0, 25),
            items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            returnUrl: `http://localhost:3000/payment/success?tempId=${tempOrderId}`,
            cancelUrl: `http://localhost:3000/payment/cancel?tempId=${tempOrderId}`,
            buyerName: name,
            buyerPhone: phone
        };

        const paymentLink = await payOS.createPaymentLink(checkoutData);

        res.json({
            success: true,
            paymentUrl: paymentLink.checkoutUrl,
            qrCode: paymentLink.qrCode,
            paymentLinkId: paymentLink.paymentLinkId
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi tạo QR: ' + err.message });
    }
});

// === WEBHOOK ===
router.post('/webhook', async (req, res) => {
    try {
        const webhookData = payOS.verifyPaymentWebhookData(req.body);
        if (!webhookData.success) {
            return res.status(400).json({ message: 'Webhook không hợp lệ' });
        }

        const { paymentLinkId, status } = webhookData.data;
        const order = await Order.findOne({ paymentLinkId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        if (status === 'PAID') {
            order.paymentStatus = 'paid';
            order.status = 'completed';
            await order.save();
            console.log(`Đơn ${order.orderId} thanh toán QR thành công`);
        }
        else if (status === 'CANCELLED' || status === 'EXPIRED') {
            // HỦY THANH TOÁN → CẬP NHẬT LẠI
            order.paymentStatus = 'unpaid';
            order.status = 'pending'; // Giữ trạng thái chờ
            await order.save();
            console.log(`Đơn ${order.orderId} đã hủy thanh toán QR`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi webhook:', err);
        res.status(500).json({ message: 'Lỗi xử lý webhook' });
    }
});

module.exports = router;