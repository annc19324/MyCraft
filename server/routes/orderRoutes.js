const express = require('express')
const router = express.Router();
const Order = require('../models/Order')

const { v4: uuidv4 } = require('uuid');

//tao don hang
router.post('/', async (req, res) => {
    try {
        const { customerInfo, items, totalPrice, status } = req.body;
        const order = new Order({
            orderId: uuidv4(),
            customerInfo,
            items,
            totalPrice,
            status,
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error('Lỗi khi tạo đơn hàng:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;