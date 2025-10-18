const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, address, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            userId: uuidv4(),
            username,
            password: hashedPassword,
            name,
            address,
            phone,
            role: 'user',
        });
        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên người dùng không tồn tại' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }
        res.json({ userId: user.userId, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;