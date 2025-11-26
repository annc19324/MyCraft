// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// TẠO HTTP SERVER ĐỂ SOCKET.IO DÙNG CHUNG
const server = http.createServer(app);

// CẤU HÌNH SOCKET.IO VỚI CORS ĐẦY ĐỦ (fix lỗi bạn vừa gặp)
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://shop-my-craft.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true   // ← QUAN TRỌNG NHẤT!
    }
});

// Cấu hình CORS cho Express (giữ nguyên như bạn đã làm)
app.use(cors({
    origin: [
        'https://my-craft.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// app.use(cors());

app.use(express.json({ limit: '10mb' }));

// Trang chủ
app.get('/', (req, res) => {
    res.json({
        message: 'MyCraft API đang chạy cực mượt!',
        status: 'OK',
        time: new Date().toLocaleString('vi-VN'),
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            auth: '/api/auth/...',
            orders: '/api/orders',
            payment: '/api/payment',
            messages: '/api/messages',
            upload_image: 'POST /api/upload',
            chat_realtime: 'Socket.IO tại /socket.io',
            health_check: 'GET /'
        },
        docs: 'Tất cả API + Chat realtime đều hoạt động bình thường'
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// TẤT CẢ CÁC ROUTE CỦA BẠN – ĐẦY ĐỦ, KHÔNG THIẾU GÌ
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/passwordRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/users', require('./routes/adminUserRoutes'));
app.use('/api/profile', require('./routes/profileRouter'));
app.use('/api/messages', require('./routes/messageRoutes')); // ← CHAT API

// Cron job tự động hoàn thành đơn hàng
require('./cron/autoComplete');

// Mailer (Resend)
const mailer = require('./utils/mailer');
if (typeof mailer.init === 'function') mailer.init();

// KÍCH HOẠT HỆ THỐNG CHAT REALTIME – QUAN TRỌNG NHẤT!
require('./socket/chatSocket')(io);

// KHỞI ĐỘNG SERVER (CHỈ DÙNG server.listen, KHÔNG DÙNG app.listen)
const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        server.listen(PORT, () => {
            console.log(`Server + Socket.IO chạy mượt tại http://localhost:${PORT}`);
            console.log(`Chat realtime đã sẵn sàng – vào /messages để thử ngay!`);
        });
    } catch (err) {
        console.error('Server error:', err);
        process.exit(1);
    }
}

start();