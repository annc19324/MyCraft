// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, address, phone, role } = req.body;

        // === VALIDATE ===
        if (!username || !password || !name) {
            return res.status(400).json({ message: 'Tên đăng nhập, mật khẩu và tên là bắt buộc' });
        }
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ message: 'Tên đăng nhập phải từ 3 đến 50 ký tự' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        if (phone && !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
        }
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò phải là "user" hoặc "admin"' });
        }

        // Kiểm tra trùng username
        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // Tạo user – KHÔNG CẦN userId, Mongo tự tạo _id
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            name,
            address,
            phone,
            role: role || 'user',
        });
        await user.save();

        // Trả về _id (MongoDB ObjectId)
        res.status(201).json({
            _id: user._id,           // ← DÙNG _id
            username: user.username,
            role: user.role,
        });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc' });
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Trả về _id, không phải userId
        res.json({
            _id: user._id,           // ← DÙNG _id
            username: user.username,
            role: user.role || 'user',
        });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;