// // server/routes/upload.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs').promises;
// const jwt = require('jsonwebtoken');
// const router = express.Router();

// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
//     fileFilter: (req, file, cb) => {
//         const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//         if (!allowedMimes.includes(file.mimetype)) {
//             return cb(new Error('Chỉ cho phép ảnh: JPG, PNG, GIF, WebP'));
//         }
//         cb(null, true);
//     }
// });

// // ktra magic bytes
// function checkMagicBytes(buffer, ext) {
//     const magic = {
//         'jpg': Buffer.from([0xFF, 0xD8, 0xFF]),
//         'png': Buffer.from([0x89, 0x50, 0x4E, 0x47]),
//         'gif': Buffer.from([0x47, 0x49, 0x46, 0x38]),
//         'webp': Buffer.from([0x52, 0x49, 0x46, 0x46])
//     };

//     const key = ext === 'jpeg' ? 'jpg' : ext;
//     const expected = magic[key];

//     if (!expected || buffer.length < expected.length) return false;
//     return buffer.slice(0, expected.length).equals(expected);
// }

// // XÁC THỰC NGƯỜI DÙNG (JWT)
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Thiếu token' });

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
//         req.user = user;
//         next();
//     });
// }

// // === ROUTE CHÍNH: XỬ LÝ UPLOAD VÀ ÁP DỤNG BẢO MẬT ===
// router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
//     if (!req.file) return res.status(400).json({ message: 'Không có file' });

//     // CHUẨN HÓA ĐUÔI FILE & KIỂM TRA MAGIC BYTES
//     const rawExt = path.extname(req.file.originalname).toLowerCase().slice(1);
//     const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;

//     if (!checkMagicBytes(req.file.buffer, ext)) {
//         return res.status(400).json({ message: 'File không hợp lệ (magic bytes sai)' });
//     }


//     const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
//     const filepath = path.join(__dirname, '../uploads', filename);

//     // const ext = path.extname(req.file.originalname).toLowerCase().slice(1) || 'bin';
//     // const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
//     // const filepath = path.join(__dirname, '../uploads', filename);

//     try {
//         await fs.writeFile(filepath, req.file.buffer);
//         res.json({ message: 'Upload thành công', filename });
//     } catch (err) {
//         console.error('Lỗi ghi file:', err);
//         res.status(500).json({ message: 'Lỗi lưu file' });
//     }
// });

// module.exports = router;