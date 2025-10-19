const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const checkAdmin = require('../middleware/checkAdmin');

// Lấy thông tin người dùng
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json({
            userId: user.userId,
            username: user.username,
            name: user.name,
            address: user.address,
            phone: user.phone,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cập nhật thông tin người dùng (chỉ admin)
router.put('/:userId', checkAdmin, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
        if (req.body.name) user.name = req.body.name;
        if (req.body.address) user.address = req.body.address;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.role) user.role = req.body.role;
        const updatedUser = await user.save();
        res.json({
            userId: updatedUser.userId,
            username: updatedUser.username,
            name: updatedUser.name,
            address: updatedUser.address,
            phone: updatedUser.phone,
            role: updatedUser.role,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;