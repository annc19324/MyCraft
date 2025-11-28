// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Cấu hình multer dùng memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh: JPG, PNG'));
        }
    },
});

// Hàm kiểm tra magic bytes (rất quan trọng chống tấn công)
function validateImageBuffer(buffer, mimetype) {
    if (!buffer || buffer.length < 12) return false;

    const signatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/jpg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    };

    const sig = signatures[mimetype];
    if (!sig) return false;

    return sig.every((byte, i) => byte === null || buffer[i] === byte);
}

module.exports = { upload, validateImageBuffer };