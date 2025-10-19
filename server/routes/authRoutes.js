const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, address, phone, role } = req.body;

        // Validate dữ liệu đầu vào
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

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            userId: Date.now().toString(),
            username,
            password: hashedPassword,
            name,
            address,
            phone,
            role: role || 'user',
        });
        await user.save();

        const userData = {
            userId: user.userId,
            username: user.username,
            role: user.role,
        };
        res.status(201).json(userData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        const userData = {
            userId: user.userId,
            username: user.username,
            role: user.role,
        };
        res.json(userData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;