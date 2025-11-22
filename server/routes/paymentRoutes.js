// server/routes/paymentRouter.js
const express = require('express');
const router = express.Router();
const payOS = require('../utils/payos');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// tạo link thanh toán qr
router.post('/create-qr', verifyToken, async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.userId;

    if (!orderId) return res.status(400).json({ message: 'Thiếu orderId' });

    try {
        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.paymentMethod !== 'qr') return res.status(400).json({ message: 'Không phải thanh toán QR' });
        if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Đã thanh toán' });

        const orderCode = Date.now() % 1000000000; // < 1 tỷ, unique
        const checkoutData = {
            orderCode,
            amount: order.total,
            description: `ĐH ${orderId}`.substring(0, 25),
            items: order.items.map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
            })),
            returnUrl: `${CLIENT_URL}/orders?status=success&orderId=${orderId}`,
            cancelUrl: `${CLIENT_URL}/orders?status=cancel&orderId=${orderId}`,
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

// tạo link thanh toán qr
router.post('/create-qr-temp', verifyToken, async (req, res) => {
    const { tempOrderId, items, name, phone, address, total } = req.body;
    const userId = req.user.userId;

    if (!userId || !tempOrderId) return res.status(400).json({ message: 'Thiếu thông tin' });

    try {
        const orderCode = Date.now() % 1000000000; // < 1 tỷ
        const checkoutData = {
            orderCode,
            amount: total,
            description: `QR ${tempOrderId}`.substring(0, 25),
            items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            returnUrl: `${CLIENT_URL}/payment/success?tempId=${tempOrderId}`,
            cancelUrl: `${CLIENT_URL}/payment/cancel?tempId=${tempOrderId}`,
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

// WEBHOOK
router.post('/webhook', async (req, res) => {
    try {
        const webhookData = payOS.verifyPaymentWebhookData(req.body);
        if (!webhookData.success) {
            console.log('Webhook không hợp lệ:', req.body);
            return res.status(400).json({ message: 'Invalid webhook' });
        }

        const { paymentLinkId, status, orderCode } = webhookData.data;
        const tempOrder = await Order.findOne({ paymentLinkId, status: 'temp' });

        if (!tempOrder) {
            console.log(`Không tìm thấy đơn tạm với paymentLinkId: ${paymentLinkId}`);
            return res.json({ success: true });
        }

        console.log(`Webhook nhận: orderCode=${orderCode}, status=${status}, paymentLinkId=${paymentLinkId}`);

        if (status === 'PAID') {
            const realOrder = new Order({
                userId: tempOrder.userId,
                items: tempOrder.items,
                total: tempOrder.total,
                name: tempOrder.name,
                phone: tempOrder.phone,
                address: tempOrder.address,
                paymentMethod: 'qr',
                paymentStatus: 'paid',
                status: 'preparing',
                paymentLinkId,
                paidAt: new Date(),
                preparedAt: new Date()
            });
            await realOrder.save();
            await Order.deleteOne({ _id: tempOrder._id });
            console.log(`TẠO ĐƠN THÀNH CÔNG: ${realOrder.orderId} (QR)`);
        }
        else if (status === 'CANCELLED') {
            await Order.deleteOne({ _id: tempOrder._id });
            console.log(`HỦY THANH TOÁN GIỮA CHỪNG: Đơn tạm bị xóa (paymentLinkId: ${paymentLinkId})`);
        }
        else if (status === 'EXPIRED') {
            await Order.deleteOne({ _id: tempOrder._id });
            console.log(`HẾT HẠN THANH TOÁN: Đơn tạm bị xóa (paymentLinkId: ${paymentLinkId})`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('LỖI WEBHOOK:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;