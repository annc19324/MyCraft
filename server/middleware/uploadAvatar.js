// server/middleware/uploadAvatar.js
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Chỉ chấp nhận ảnh JPG, PNG, GIF, WebP'));
    }
});

function validateImage(buffer, mimetype) {
    const signatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/jpg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46]
    };
    const sig = signatures[mimetype];
    if (!sig || buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
}

module.exports = { upload, validateImage };