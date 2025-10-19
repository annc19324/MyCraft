const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

async function migrate() {
    try {
        // Kết nối MongoDB
        await mongoose.connect('mongodb://localhost:27017/mycraft', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Đã kết nối tới MongoDB');

        // Xóa các collection cũ
        await mongoose.connection.db.dropCollection('users').catch(() => console.log('Collection users không tồn tại'));
        await mongoose.connection.db.dropCollection('products').catch(() => console.log('Collection products không tồn tại'));
        await mongoose.connection.db.dropCollection('carts').catch(() => console.log('Collection carts không tồn tại'));
        await mongoose.connection.db.dropCollection('orders').catch(() => console.log('Collection orders không tồn tại'));
        console.log('Đã xóa các collection cũ');

        // Tạo dữ liệu mẫu
        const users = [
            {
                userId: 'user1',
                username: 'customer',
                password: '$2b$10$3sX0z7Y3k8z9V5X2z7Y3k8z9V5X2z7Y3k8z9V5X2z7Y3k8z9V5X', // Mật khẩu: cust123
                name: 'Customer User',
                address: '123 Đường ABC, Hà Nội',
                phone: '0987654321',
                role: 'user',
            },
            {
                userId: 'admin1',
                username: 'admin',
                password: '$2b$10$3sX0z7Y3k8z9V5X2z7Y3k8z9V5X2z7Y3k8z9V5X2z7Y3k8z9V5X', // Mật khẩu: admin123
                name: 'Admin User',
                address: '456 Đường XYZ, Hà Nội',
                phone: '0123456789',
                role: 'admin',
            },
        ];

        const products = [
            {
                name: 'Vòng tay thủ công',
                price: 100000,
                description: 'Vòng tay thủ công đẹp',
                imageUrl: 'https://place.dog/100/100',
                stock: 10,
            },
            {
                name: 'Túi vải handmade',
                price: 200000,
                description: 'Túi vải thủ công thân thiện môi trường',
                imageUrl: 'https://place.dog/200/200',
                stock: 5,
            },
        ];

        const carts = [
            {
                userId: 'user1',
                items: [
                    {
                        productId: 'product1',
                        name: 'Vòng tay thủ công',
                        price: 100000,
                        imageUrl: 'https://place.dog/100/100',
                        quantity: 2,
                    },
                ],
            },
        ];

        const orders = [
            {
                userId: 'user1',
                orderId: 'order1',
                items: [
                    {
                        productId: 'product1',
                        name: 'Vòng tay thủ công',
                        price: 100000,
                        imageUrl: 'https://place.dog/100/100',
                        quantity: 1,
                    },
                ],
                status: 'pending',
            },
        ];

        // Lưu dữ liệu mẫu
        await User.insertMany(users);
        console.log('Đã thêm dữ liệu mẫu vào collection users');

        const savedProducts = await Product.insertMany(products);
        console.log('Đã thêm dữ liệu mẫu vào collection products');

        carts[0].items[0].productId = savedProducts[0]._id.toString();
        orders[0].items[0].productId = savedProducts[0]._id.toString();
        await Cart.insertMany(carts);
        console.log('Đã thêm dữ liệu mẫu vào collection carts');
        await Order.insertMany(orders);
        console.log('Đã thêm dữ liệu mẫu vào collection orders');

        console.log('Migration hoàn tất');
        mongoose.connection.close();
    } catch (err) {
        console.error('Lỗi khi migrate:', err);
        mongoose.connection.close();
    }
}

migrate();