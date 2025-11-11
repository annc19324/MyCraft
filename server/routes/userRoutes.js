const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET /api/users/profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.headers['user-id']; // Đây là _id từ localStorage
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }

        const user = await User.findById(userId).select('name phone address');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({
            name: user.name || 'Chưa có',
            phone: user.phone || '',
            address: user.address || '',
        });
    } catch (err) {
        console.error('Lỗi lấy profile:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// === CẬP NHẬT THÔNG TIN CÁ NHÂN ===
router.put('/profile', async (req, res) => {
    const userId = req.headers['user-id'];
    const { name, phone, address } = req.body;

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();
        res.json({ name: user.name, phone: user.phone, address: user.address });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;