// server/routes/uploadRoutes.js (ĐÃ HOÀN HẢO + BẢO MẬT CAO)
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { upload, validateImageBuffer } = require('../middleware/upload');
const checkAdmin = require('../middleware/checkAdmin');

// Cấu hình Cloudinary (giữ nguyên phần kiểm tra env)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mycraft/products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

router.post('/', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh' });

    // Kiểm tra magic bytes
    if (!validateImageBuffer(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ message: 'File không phải ảnh hợp lệ' });
    }

    const result = await uploadFromBuffer(req.file.buffer);
    // const result = await uploadFromBuffer(req.file.buffer, {
    //   folder: 'demo_hack',
    //   use_filename: true,
    //   unique_filename: false,
    //   overwrite: true,
    //   resource_type: 'raw',
    // });

    res.json({
      message: 'Upload thành công!',
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      message: 'Upload thất bại',
      error: err.message || 'Lỗi server'
    });
  }
});

module.exports = router;