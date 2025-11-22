// server/routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const checkAdmin = require('../middleware/checkAdmin');

router.get('/all', checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        if (err.code === 11000) {
            const dupKey = Object.keys(err.keyValue || {})[0] || 'Trường';
            return res.status(400).json({ message: `${dupKey} đã tồn tại` });
        }
        res.status(500).json({ message: err.message });
    }
});

router.post('/', checkAdmin, async (req, res) => {
    try {
        const { username, name, email, phone, address, role, password } = req.body;
        if (!username || !name || !password || !email)
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (username, name, email, password)' });
        if (password.length < 8)
            return res.status(400).json({ message: 'Mật khẩu phải ≥ 8 ký tự' });
        if (await User.findOne({ username }))
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        if (await User.findOne({ email }))
            return res.status(400).json({ message: 'Email đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        // Users created by admin are trusted — mark as verified so they don't need email confirmation
        const user = new User({ username, name, email, phone, address, role: role || 'user', password: hashedPassword, isVerified: true, createdByAdmin: true });
        await user.save();

        const { password: _, ...safeUser } = user.toObject();
        res.status(201).json(safeUser);
    } catch (err) {
        // Duplicate key handling
        if (err.code === 11000) {
            const dupKey = Object.keys(err.keyValue)[0];
            return res.status(400).json({ message: `${dupKey} đã tồn tại` });
        }
        res.status(500).json({ message: err.message });
    }
});


router.put('/:id', checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy' });


        const { password, email, ...otherUpdates } = req.body;

        const updates = { ...otherUpdates };

        // handle password change
        if (password) {
            if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải ≥ 6 ký tự' });
            updates.password = await bcrypt.hash(password, 10);
        }

        // handle email change: validate format and uniqueness
        if (email !== undefined) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
            // If admin updates the email, treat it as already verified (admin action)
            updates.email = email;
            updates.isVerified = true;
            updates.verificationToken = undefined;
            updates.verificationExpires = undefined;
        }

        Object.assign(user, updates);
        await user.save();

        const { password: _, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        if (err.code === 11000) {
            const dupKey = Object.keys(err.keyValue || {})[0] || 'Trường';
            return res.status(400).json({ message: `${dupKey} đã tồn tại` });
        }
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