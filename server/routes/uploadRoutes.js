// server/routes/uploadRoutes.js
// ĐÃ HOÀN HẢO 100% – chạy được cả local lẫn Render
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const checkAdmin = require('../middleware/checkAdmin');

// === BẢO VỆ LOCAL: nếu chưa có 3 biến Cloudinary thì dùng fallback ===
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('CLOUDINARY chưa cấu hình → upload sẽ bị từ chối (chỉ chạy local)');
}

// Cấu hình storage – có kiểm tra để tránh crash
let storage;
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'mycraft/products',           // tự động tạo thư mục
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    },
  });
} else {
  // Fallback: từ chối upload nếu chưa có Cloudinary
  storage = {
    _handleFile: (req, file, cb) => cb(new Error('Chưa cấu hình Cloudinary')),
    _removeFile: () => { },
  };
}

const upload = multer({ storage });

// Route upload (chỉ admin)
router.post('/', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
    }

    // Nếu dùng fallback → báo lỗi rõ ràng
    if (req.file.path === undefined) {
      return res.status(500).json({
        message: 'Upload thất bại: Chưa cấu hình Cloudinary trong .env',
      });
    }

    res.json({
      message: 'Upload thành công!',
      imageUrl: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Upload thất bại', error: err.message });
  }
});

module.exports = router;