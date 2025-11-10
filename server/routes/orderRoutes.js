// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// === TẠO ĐƠN HÀNG ===
router.post('/', async (req, res) => {
    const { items, name, phone, address, paymentMethod = 'cod' } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });
    if (!name || !phone || !address) return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });

    try {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // === KIỂM TRA + GIẢM TỒN KHO ===
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Sản phẩm không tồn tại: ${item.name}` });
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Không đủ hàng: ${product.name} (còn ${product.stock})` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const order = new Order({
            userId,
            orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            items,
            name,
            phone,
            address,
            total,
            paymentMethod,
            paymentStatus: 'unpaid'
        });

        await order.save();

        // Xóa giỏ
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

// === CẬP NHẬT ĐỊA CHỈ===
router.put('/:id/address', async (req, res) => {
    const { id } = req.params;  // id = orderId
    const { name, phone, address } = req.body;
    const userId = req.headers['user-id'];

    try {
        const order = await Order.findOne({ orderId: id });  // SỬA: findOne({ orderId: id })
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ sửa được khi đang chờ xử lý' });

        if (name) order.name = name;
        if (phone) order.phone = phone;
        if (address) order.address = address;

        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === HỦY ĐƠN (SỬA: Tìm theo orderId) ===
router.put('/:id/cancel', async (req, res) => {
    const { id } = req.params;  // id = orderId (string như "ORDER_...")
    const userId = req.headers['user-id'];

    try {
        // SỬA: Tìm theo orderId thay vì _id
        const order = await Order.findOne({ orderId: id });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ hủy được khi đang chờ' });

        // Hoàn tồn kho (nếu có logic này)
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = 'cancelled';
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }
        await order.save();

        res.json({ message: 'Đã hủy và hoàn tồn kho' });
    } catch (err) {
        console.error('Lỗi hủy đơn:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;