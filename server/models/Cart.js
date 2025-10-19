const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: [true, 'productId là bắt buộc'],
    },
    name: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Giá sản phẩm là bắt buộc'],
        min: [0, 'Giá sản phẩm không được nhỏ hơn 0'],
    },
    imageUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+$/, 'URL hình ảnh không hợp lệ'],
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng là bắt buộc'],
        min: [1, 'Số lượng phải lớn hơn 0'],
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'userId là bắt buộc'],
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Cart', cartSchema);