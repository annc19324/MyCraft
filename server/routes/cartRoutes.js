const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/selected', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { selectedItems } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        if (!selectedItems || selectedItems.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm nào được chọn' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        const items = cart.items.filter(item => selectedItems.some(selected => selected.productId === item.productId));
        res.json({ items });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/remove-selected', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { selectedItems } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        if (!selectedItems || selectedItems.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm nào được chọn' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        cart.items = cart.items.filter(item => !selectedItems.some(selected => selected.productId === item.productId));
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { productId, quantity } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'productId và quantity là bắt buộc' });
        }
        if (quantity < 1) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Số lượng tồn kho không đủ' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity
            });
        }
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        const { productId, quantity } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Thiếu user-id trong header' });
        }
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'productId và quantity là bắt buộc' });
        }
        if (quantity < 1) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ message: 'Số lượng tồn kho không đủ' });
            }
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;