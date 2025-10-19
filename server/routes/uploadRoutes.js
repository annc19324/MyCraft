const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const checkAdmin = require('../middleware/checkAdmin');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file hình ảnh (jpeg, jpg, png, gif)'));
    },
});

router.post('/', checkAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn tệp hình ảnh' });
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;