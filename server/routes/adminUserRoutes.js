// server/routes/adminUserRoutes.js – ĐÃ SỬA HOÀN CHỈNH
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // ← THÊM
const checkAdmin = require('../middleware/checkAdmin');

// === LẤY TẤT CẢ NGƯỜI DÙNG (ADMIN) ===
router.get('/all', checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === TẠO NGƯỜI DÙNG MỚI (ADMIN) ===
router.post('/', checkAdmin, async (req, res) => {
    try {
        const { username, name, phone, address, role, password } = req.body;
        if (!username || !name || !password)
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        if (password.length < 6)
            return res.status(400).json({ message: 'Mật khẩu phải ≥ 6 ký tự' });
        if (await User.findOne({ username }))
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, name, phone, address, role: role || 'user', password: hashedPassword });
        await user.save();

        const { password: _, ...safeUser } = user.toObject();
        res.status(201).json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === CẬP NHẬT NGƯỜI DÙNG (ADMIN) ===
router.put('/:id', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy' });

        const { password, ...updates } = req.body;
        if (password) {
            if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải ≥ 6 ký tự' });
            updates.password = await bcrypt.hash(password, 10);
        }

        Object.assign(user, updates);
        await user.save();

        const { password: _, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === XÓA NGƯỜI DÙNG (ADMIN) ===
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Không thể xóa admin' });

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;