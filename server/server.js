// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: [
        'https://shop-my-craft.vercel.app', // Frontend production
        'http://localhost:3000',             // Frontend development
        'http://localhost:3001'              // Frontend alternative port
    ],
    credentials: true,  // QUAN TRỌNG: Cho phép gửi cookies/token
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.json({
        message: 'MyCraft API đang chạy cực mượt!',
        status: 'OK',
        time: new Date().toLocaleString('vi-VN'),
        version: '1.0.0',
        endpoints: {
            products: '/ | /api/products',
            auth: '/api/auth/...',
            orders: '/api/orders',
            payment: '/api/payment',
            upload_image: 'POST /api/upload',
            health_check: 'GET /'
        },
        docs: 'Tất cả API đều hoạt động bình thường'
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/passwordRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/users', require('./routes/adminUserRoutes'));
app.use('/api/profile', require('./routes/profileRouter')); // ← CHỈ DÙNG CÁI NÀY

require('./cron/autoComplete');
const mailer = require('./utils/mailer');

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        if (typeof mailer.init === 'function') await mailer.init();
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('Server error:', err);
        process.exit(1);
    }
}

start();