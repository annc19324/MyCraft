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

        // === BƯỚC 1: XÓA DỮ LIỆU CŨ ===
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

        // --- USER: KHÔNG CẦN userId, DÙNG _id TỰ SINH ---
        const usersData = [
            {
                username: 'user',
                password: hashedPassword,
                name: 'Người Dùng Thường',
                role: 'user',
                phone: '0901234567',
                address: '123 Đường Láng, Hà Nội'
            },
            {
                username: 'admin',
                password: hashedPassword,
                name: 'Quản Trị Viên',
                role: 'admin',
                phone: '0912345678',
                address: '456 Lê Lợi, TP.HCM'
            },
        ];

        const savedUsers = await User.insertMany(usersData);
        console.log('ĐÃ THÊM 2 TÀI KHOẢN (user/admin - mật khẩu: 12345)');

        // LẤY userId TỪ _id TỰ SINH
        const demoUser = savedUsers.find(u => u.username === 'user');
        console.log(`Demo userId: ${demoUser.userId}`); // → ObjectId string

        // --- GIỎ HÀNG MẪU ---
        const product2 = savedProducts[1]; // Móc khóa
        const product4 = savedProducts[3]; // Thiệp

        await Cart.create({
            userId: demoUser.userId,
            items: [
                {
                    productId: product2._id.toString(),
                    name: product2.name,
                    price: product2.price,
                    imageUrl: product2.imageUrl,
                    quantity: 2
                },
                {
                    productId: product4._id.toString(),
                    name: product4.name,
                    price: product4.price,
                    imageUrl: product4.imageUrl,
                    quantity: 1
                },
            ],
        });
        console.log('ĐÃ THÊM GIỎ HÀNG MẪU');

        // === ĐƠN HÀNG MẪU ===
        const product1 = savedProducts[0]; // Vòng tay
        const product3 = savedProducts[2]; // Giỏ hoa

        const calcTotal = (items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Đơn 1: Chờ xử lý (COD)
        await Order.create({
            userId: demoUser.userId,
            orderId: `ORDER_${Date.now()}_001`,
            items: [
                {
                    productId: product1._id.toString(),
                    name: product1.name,
                    price: product1.price,
                    imageUrl: product1.imageUrl,
                    quantity: 1
                },
            ],
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            address: '123 Đường Láng, Hà Nội',
            total: calcTotal([{ price: product1.price, quantity: 1 }]),
            paymentMethod: 'cod',
            paymentStatus: 'unpaid',
            status: 'pending',
        });

        // Đơn 2: Đã thanh toán QR + Hoàn thành
        await Order.create({
            userId: demoUser.userId,
            orderId: `ORDER_${Date.now()}_002`,
            items: [
                {
                    productId: product3._id.toString(),
                    name: product3.name,
                    price: product3.price,
                    imageUrl: product3.imageUrl,
                    quantity: 1
                },
            ],
            name: 'Trần Thị B',
            phone: '0912345678',
            address: '456 Lê Lợi, TP.HCM',
            total: calcTotal([{ price: product3.price, quantity: 1 }]),
            paymentMethod: 'qr',
            paymentStatus: 'paid',
            status: 'completed',
        });

        // Đơn 3: Đã hủy
        await Order.create({
            userId: demoUser.userId,
            orderId: `ORDER_${Date.now()}_003`,
            items: [
                {
                    productId: product2._id.toString(),
                    name: product2.name,
                    price: product2.price,
                    imageUrl: product2.imageUrl,
                    quantity: 1
                },
            ],
            name: 'Lê Văn C',
            phone: '0923456789',
            address: '789 Nguyễn Huệ, Đà Nẵng',
            total: calcTotal([{ price: product2.price, quantity: 1 }]),
            paymentMethod: 'cod',
            paymentStatus: 'unpaid',
            status: 'cancelled',
        });

        console.log('ĐÃ THÊM 3 ĐƠN HÀNG MẪU (pending, completed, cancelled)');

        // === KẾT THÚC ===
        console.log('MIGRATION HOÀN TẤT!');
        console.log('\nTÀI KHOẢN TEST:');
        console.log('   - Username: user     | Mật khẩu: 12345');
        console.log('   - Username: admin    | Mật khẩu: 12345');
        console.log(`   - Demo userId: ${demoUser.userId}`);
        console.log('\nDỮ LIỆU ĐÃ SẴN SÀNG!');

    } catch (err) {
        console.error('LỖI MIGRATION:', err.message);
        if (err.code === 11000) {
            console.error('Lỗi trùng lặp. Kiểm tra lại userId hoặc xóa dữ liệu thủ công trên MongoDB Atlas.');
        }
        process.exit(1);
    } finally {
        if (connection) await connection.close();
        process.exit(0);
    }
})();