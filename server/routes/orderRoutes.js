// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// === TẠO ĐƠN HÀNG ===
router.post('/', async (req, res) => {
    const { items, name, phone, address } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });
    if (!name || !phone || !address) return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });

    try {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = new Order({
            userId,
            orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            items,
            name,
            phone,
            address,
            total,
        });

        await order.save();

        // Xóa sản phẩm khỏi giỏ
        const productIds = items.map(i => i.productId);
        await Cart.updateOne(
            { userId },
            { $pull: { items: { productId: { $in: productIds } } } }
        );

        res.status(201).json(order);
    } catch (err) {
        console.error('Lỗi tạo đơn:', err);
        res.status(500).json({ message: err.message });
    }
});

// === LẤY ĐƠN HÀNG CỦA USER ===
router.get('/', async (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === CẬP NHẬT THÔNG TIN GIAO HÀNG (chỉ khi pending) ===
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, address } = req.body;
    const userId = req.headers['user-id'];

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ sửa được khi đang chờ xử lý' });

        // Cập nhật chỉ những trường được gửi
        if (name) order.name = name;
        if (phone) order.phone = phone;
        if (address) order.address = address;

        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === HỦY ĐƠN ===
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ hủy được khi đang chờ' });

        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Đã hủy đơn hàng' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;