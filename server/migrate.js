// server/migrate.js
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('LỖI: Thiếu MONGO_URI trong .env');
    process.exit(1);
}

console.log('KẾT NỐI ĐẾN:', MONGO_URI);

(async () => {
    let connection;
    try {
        await mongoose.connect(MONGO_URI);
        connection = mongoose.connection;
        console.log('KẾT NỐI THÀNH CÔNG!');
        console.log('DATABASE:', connection.db.databaseName);
        console.log('HOST:', connection.host);

        // === BƯỚC 1: XÓA DỮ LIỆU CŨ (THAY VÌ DROP DB) ===
        console.log('XÓA DỮ LIỆU CŨ...');
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Cart.deleteMany({}),
            Order.deleteMany({}),
        ]);
        console.log('ĐÃ XÓA TOÀN BỘ DỮ LIỆU CŨ');

        // === BƯỚC 2: TẠO DỮ LIỆU MỚI ===
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345', salt);

        // --- Sản phẩm ---
        const productsData = [
            { name: 'Vòng tay handmade', description: 'Vòng tay làm bằng hạt cườm thủ công.', price: 120000, stock: 50, imageUrl: 'https://picsum.photos/seed/p1/300/300' },
            { name: 'Móc khóa len', description: 'Móc khóa dễ thương được đan bằng len sợi nhỏ.', price: 45000, stock: 100, imageUrl: 'https://picsum.photos/seed/p2/300/300' },
            { name: 'Giỏ hoa giấy', description: 'Hoa giấy thủ công nhiều màu sắc.', price: 90000, stock: 30, imageUrl: 'https://picsum.photos/seed/p3/300/300' },
            { name: 'Thiệp handmade', description: 'Thiệp chúc mừng sinh nhật thủ công.', price: 30000, stock: 80, imageUrl: 'https://picsum.photos/seed/p4/300/300' },
        ];

        const savedProducts = await Product.insertMany(productsData);
        console.log('ĐÃ THÊM 4 SẢN PHẨM');

        // --- User ---
        const usersData = [
            { username: 'user', password: hashedPassword, name: 'Người Dùng', role: 'user' },
            { username: 'admin', password: hashedPassword, name: 'Quản Trị Viên', role: 'admin' },
        ];

        const savedUsers = await User.insertMany(usersData);
        console.log('ĐÃ THÊM 2 TÀI KHOẢN (user/admin - mật khẩu: 12345)');

        // --- Giỏ hàng ---
        const demoUser = savedUsers.find(u => u.username === 'user');
        const product2 = savedProducts[1]; // Móc khóa
        const product4 = savedProducts[3]; // Thiệp

        await Cart.create({
            userId: demoUser._id.toString(),
            items: [
                { productId: product2._id.toString(), name: product2.name, price: product2.price, imageUrl: product2.imageUrl, quantity: 2 },
                { productId: product4._id.toString(), name: product4.name, price: product4.price, imageUrl: product4.imageUrl, quantity: 1 },
            ],
        });
        console.log('ĐÃ THÊM GIỎ HÀNG MẪU');

        // --- Đơn hàng ---
        const product1 = savedProducts[0]; // Vòng tay
        await Order.create({
            userId: demoUser._id.toString(),
            orderId: `ORDER_${Date.now()}`,
            items: [
                { productId: product1._id.toString(), name: product1.name, price: product1.price, imageUrl: product1.imageUrl, quantity: 1 },
            ],
            status: 'pending',
        });
        console.log('ĐÃ THÊM ĐƠN HÀNG MẪU');

        console.log('MIGRATION HOÀN TẤT!');
        console.log('Tài khoản test:');
        console.log('   - user / 12345');
        console.log('   - admin / 12345');

    } catch (err) {
        console.error('LỖI MIGRATION:', err.message);
        if (err.code === 11000) {
            console.error('Lỗi trùng lặp (duplicate key). Dữ liệu cũ chưa được xóa hoàn toàn.');
        }
        process.exit(1);
    } finally {
        if (connection) await connection.close();
        process.exit(0);
    }
})();