// server/routes/profileRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const bcrypt = require('bcrypt');

// ==================== CẤU HÌNH CLOUDINARY (DÙNG CHUNG VỚI UPLOAD SẢN PHẨM) ====================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'mycraft/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB tối đa
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh: JPG, PNG, GIF, WebP'));
        }
    },
});

// ==================== LẤY THÔNG TIN PROFILE ====================
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || 'https://place.dog/300/300',
            role: user.role,
        });
    } catch (err) {
        console.error('Lỗi lấy profile:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==================== CẬP NHẬT THÔNG TIN (tên, email, sđt, địa chỉ) ====================
router.put('/', verifyToken, async (req, res) => {
    const { name, email, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    try {
        const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
        res.json({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || 'https://place.dog/300/300',
        });
    } catch (err) {
        console.error('Lỗi cập nhật profile:', err);
        res.status(500).json({ message: 'Lỗi cập nhật' });
    }
});

// ==================== THAY ĐỔI ẢNH ĐẠI DIỆN (CLOUDINARY) ====================
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        // XÓA ẢNH CŨ TRÊN CLOUDINARY (nếu có)
        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
        }

        // CẬP NHẬT ẢNH MỚI
        user.avatar = req.file.path;                    // URL ảnh (vd: https://res.cloudinary.com/...)
        user.avatarPublicId = req.file.filename;        // public_id để xóa sau này
        await user.save();

        res.json({
            message: 'Cập nhật ảnh đại diện thành công!',
            avatar: req.file.path,
        });
    } catch (err) {
        console.error('Lỗi upload avatar Cloudinary:', err);
        res.status(500).json({ message: 'Lỗi server khi upload ảnh' });
    }
});

// ==================== ĐỔI MẬT KHẨU ====================
router.put('/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    try {
        const user = await User.findById(req.user.userId);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('Lỗi đổi mật khẩu:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;