const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
    },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            imageUrl: { type: String },
            productId: { type: String },
        },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
