// server/migrate.js
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const User = require('./models/User');
// const Cart = require('./models/Cart'); // Có thể bỏ comment nếu cần dùng
// const Order = require('./models/Order'); // Có thể bỏ comment nếu cần dùng

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

        // === BƯỚC 1: XÓA DỮ LIỆU CŨ ===
        console.log('XÓA DỮ LIỆU CŨ (Users, Products)...');
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
        ]);
        console.log('ĐÃ XÓA DỮ LIỆU CŨ');

        // === BƯỚC 2: TẠO DỮ LIỆU MỚI ===
        console.log('Tạo dữ liệu mới...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345', salt);
        const currentTime = new Date(); // Lấy thời gian hiện tại

        // --- SẢN PHẨM ---
        const productsData = [
            {
                name: 'Vòng tay handmade',
                description: 'Vòng tay làm bằng hạt cườm thủ công.',
                price: 120000,
                stock: 50,
                imageUrl: 'https://picsum.photos/seed/p1/300/300'
            },
            {
                name: 'Móc khóa len',
                description: 'Móc khóa dễ thương được đan bằng len sợi nhỏ.',
                price: 45000,
                stock: 100,
                imageUrl: 'https://picsum.photos/seed/p2/300/300'
            },
            {
                name: 'Giỏ hoa giấy',
                description: 'Hoa giấy thủ công nhiều màu sắc.',
                price: 90000,
                stock: 30,
                imageUrl: 'https://picsum.photos/seed/p3/300/300'
            },
            {
                name: 'Thiệp handmade',
                description: 'Thiệp chúc mừng sinh nhật thủ công.',
                price: 30000,
                stock: 80,
                imageUrl: 'https://picsum.photos/seed/p4/300/300'
            },
        ];

        const savedProducts = await Product.insertMany(productsData);
        console.log(`ĐÃ THÊM ${savedProducts.length} SẢN PHẨM`);

        // --- USER ---
        const usersData = [
            {
                // === USER (CẤU TRÚC ĐẦY ĐỦ) ===
                username: 'user',
                password: hashedPassword, // Mật khẩu: 12345
                name: 'Người Dùng Thường',
                email: 'user@example.com',
                address: '123 Đường Láng, Hà Nội',
                phone: '0901234567',
                avatar: 'https://placehold.co/100x100?text=User',
                role: 'user',
                isVerified: true,
                createdByAdmin: false,
                createdAt: currentTime // Ngày giờ chạy script
            },
            {
                // === ADMIN (CẤU TRÚC ĐẦY ĐỦ) ===
                username: 'admin',
                password: hashedPassword, // Mật khẩu: 12345
                name: 'Quản Trị Viên',
                email: 'admin@example.com',
                address: '456 Lê Lợi, TP.HCM',
                phone: '0912345678',
                avatar: 'https://placehold.co/100x100?text=Admin',
                role: 'admin',
                isVerified: true,
                createdByAdmin: false,
                createdAt: currentTime // Ngày giờ chạy script
            },
        ];

        const savedUsers = await User.insertMany(usersData);
        console.log(`ĐÃ THÊM ${savedUsers.length} TÀI KHOẢN (user, admin)`);

        // LẤY userId TỪ _id TỰ SINH (của user 'user')
        const demoUser = savedUsers.find(u => u.username === 'user');
        const demoUserId = demoUser._id.toString();
        console.log(`Demo userId (của 'user'): ${demoUserId}`);

        // === KẾT THÚC ===
        console.log('\n=============================');
        console.log(' MIGRATION HOÀN TẤT!');
        console.log('=============================');
        console.log('\nTÀI KHOẢN TEST:');
        console.log('   - Username: user     | Mật khẩu: 12345');
        console.log('   - Username: admin    | Mật khẩu: 12345');
        console.log(`   - Demo userId (của 'user'): ${demoUserId}`);
        console.log('\nDỮ LIỆU ĐÃ SẴN SÀNG!');

    } catch (err) {
        console.error('LỖI MIGRATION:', err.message);
        if (err.code === 11000) {
            console.error('Lỗi trùng lặp (E11000). Kiểm tra lại _id hoặc xóa dữ liệu thủ công trên MongoDB Atlas.');
        }
        process.exit(1);
    } finally {
        if (connection) await connection.close();
        console.log('Đã ngắt kết nối MongoDB.');
        process.exit(0);
    }
})();
