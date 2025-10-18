const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

//lay ds sp
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//lay sp theo id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Middleware kiểm tra vai trò admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.headers['user-id']);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Yêu cầu quyền admin' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Tạo sản phẩm (admin)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock } = req.body;
        const product = new Product({
            productId: uuidv4(),
            name,
            price,
            description,
            imageUrl,
            stock,
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Sửa sản phẩm (admin)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description, imageUrl, stock },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa sản phẩm (admin)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;

