// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/verifyToken');

// GET /api/users/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // const userId = req.headers['user-id']; // Đây là _id từ localStorage
        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }

        const user = await User.findById(userId).select('name email phone address');
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
router.put('/profile', verifyToken, async (req, res) => {
    // const userId = req.headers['user-id'];
    const userId = req.user.userId;

    const { name, phone, address, email } = req.body;

    if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (email) {
            // validate email format
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
            // check unique
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== userId) return res.status(400).json({ message: 'Email đã tồn tại' });
            user.email = email;
        }

        await user.save();
        res.json({ name: user.name, email: user.email, phone: user.phone, address: user.address });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;