// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const checkAdmin = require('../middleware/checkAdmin');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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

router.post('/', checkAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock } = req.body;

        // Validate dữ liệu đầu vào
        if (!name || !price || !stock) {
            return res.status(400).json({ message: 'Tên, giá và số lượng tồn kho là bắt buộc' });
        }
        if (name.length > 100) {
            return res.status(400).json({ message: 'Tên sản phẩm không được vượt quá 100 ký tự' });
        }
        if (price < 0) {
            return res.status(400).json({ message: 'Giá sản phẩm không được nhỏ hơn 0' });
        }
        if (stock < 0) {
            return res.status(400).json({ message: 'Số lượng tồn kho không được nhỏ hơn 0' });
        }
        if (imageUrl && !/^https?:\/\/.+$/.test(imageUrl)) {
            return res.status(400).json({ message: 'URL hình ảnh không hợp lệ' });
        }

        const product = new Product({ name, price, description, imageUrl, stock });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', checkAdmin, async (req, res) => {
    try {
        const { name, price, description, imageUrl, stock } = req.body;

        // Validate dữ liệu đầu vào
        if (name && name.length > 100) {
            return res.status(400).json({ message: 'Tên sản phẩm không được vượt quá 100 ký tự' });
        }
        if (price && price < 0) {
            return res.status(400).json({ message: 'Giá sản phẩm không được nhỏ hơn 0' });
        }
        if (stock && stock < 0) {
            return res.status(400).json({ message: 'Số lượng tồn kho không được nhỏ hơn 0' });
        }
        if (imageUrl && !/^https?:\/\/.+$/.test(imageUrl)) {
            return res.status(400).json({ message: 'URL hình ảnh không hợp lệ' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        Object.assign(product, req.body);
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        // await product.remove();
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;