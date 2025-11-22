// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const checkAdmin = require('../middleware/checkAdmin');
const verifyToken = require('../middleware/verifyToken');

// admin

router.get('/all', checkAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (err) {
        console.error('[ADMIN] Lỗi lấy tất cả đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.put('/:orderId/status', checkAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        // hoan sluong khi huy (chỉ khi đang pending/processing/shipping)
        if (status === 'cancelled' && ['pending', 'processing', 'shipping'].includes(order.status)) {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        //cap nhat trang thai
        order.status = status;

        // khi hoan thanh, danh dau da thanh toan
        if (status === 'completed') {
            order.paymentStatus = 'paid';
        }
        await order.save();
        res.json(order);
    } catch (err) {
        console.error('[ADMIN] Lỗi cập nhật trạng thái:', err);
        res.status(500).json({ message: err.message });
    }
});

// user 

router.post('/', verifyToken, async (req, res) => {
    const { items, name, phone, address, paymentMethod = 'cod' } = req.body;
    // const userId = req.headers['user-id'];
    const userId = req.user.userId;


    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });
    if (!name || !phone || !address) return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });

    try {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Kiểm tra + giảm tồn kho
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
            name, phone, address, total, paymentMethod,
            paymentStatus: paymentMethod === 'qr' ? 'paid' : 'unpaid'
        });

        await order.save();

        // Xóa sản phẩm đã đặt khỏi giỏ
        const productIds = items.map(i => i.productId);
        await Cart.updateOne(
            { userId },
            { $pull: { items: { productId: { $in: productIds } } } }
        );

        res.status(201).json(order);
    } catch (err) {
        console.error('[USER] Lỗi tạo đơn:', err);
        res.status(500).json({ message: err.message });
    }
});

// === user lấy đơn hàng của mình
router.get('/', verifyToken, async (req, res) => {
    // const userId = req.headers['user-id'];
    const userId = req.user.userId;

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('[USER] Lỗi lấy đơn hàng:', err);
        res.status(500).json({ message: err.message });
    }
});

// === [USER] CẬP NHẬT ĐỊA CHỈ GIAO HÀNG ===
router.put('/:id/address', verifyToken, async (req, res) => {
    const { id } = req.params;  // id = orderId
    const { name, phone, address } = req.body;
    // const userId = req.headers['user-id'];
    const userId = req.user.userId;


    try {
        const order = await Order.findOne({ orderId: id });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ sửa được khi đang chờ xử lý' });

        if (name) order.name = name;
        if (phone) order.phone = phone;
        if (address) order.address = address;

        await order.save();
        res.json(order);
    } catch (err) {
        console.error('[USER] Lỗi cập nhật địa chỉ:', err);
        res.status(500).json({ message: err.message });
    }
});

// === [USER] HỦY ĐƠN HÀNG ===
router.put('/:id/cancel', verifyToken, async (req, res) => {
    const { id } = req.params;  // id = orderId
    // const userId = req.headers['user-id'];
    const userId = req.user.userId;


    try {
        const order = await Order.findOne({ orderId: id });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.userId !== userId) return res.status(403).json({ message: 'Không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ hủy được khi đang chờ' });

        // Hoàn tồn kho
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
        console.error('[USER] Lỗi hủy đơn:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;