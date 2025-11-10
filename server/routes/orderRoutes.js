const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        const orders = await Order.find({ userId });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { items } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm nào để đặt hàng' });
        }

        // Validate items
        for (const item of items) {
            if (!item.productId || !item.quantity) {
                return res.status(400).json({ message: 'Mỗi sản phẩm phải có productId và quantity' });
            }
            if (item.quantity < 1) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.productId}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Số lượng tồn kho không đủ cho sản phẩm ${product.name}` });
            }
        }

        const order = new Order({
            userId,
            orderId: Date.now().toString(),
            items,
            status: 'pending',
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// routes/orderRoutes.js
router.put('/:orderId/cancel', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ hủy được khi đang chờ' });

        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:orderId/address', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { orderId } = req.params;
        const { name, phone, address } = req.body;
        const order = await Order.findOne({ orderId, userId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Không thể sửa khi đã xử lý' });

        order.address = `${name} | ${phone} | ${address}`;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;