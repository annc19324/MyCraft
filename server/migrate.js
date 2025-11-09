require('dotenv').config();
console.log('MONGODB_URI từ .env:', process.env.MONGODB_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

async function migrate() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mycraft';
        console.log('KẾT NỐI ĐẾN:', uri);
        await mongoose.connect(uri);
        console.log('TÊN DATABASE:', mongoose.connection.db.databaseName);
        console.log('HOST:', mongoose.connection.host);
        console.log('---');

        await Promise.all([
            mongoose.connection.db.dropCollection('users').catch(() => { }),
            mongoose.connection.db.dropCollection('products').catch(() => { }),
            mongoose.connection.db.dropCollection('carts').catch(() => { }),
            mongoose.connection.db.dropCollection('orders').catch(() => { }),
        ]);
        console.log('Đã xóa các collection cũ');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345', salt);

        const users = [
            { userId: 'user1', username: 'user', password: hashedPassword, name: 'Người Dùng', address: 'Hà Nội', phone: '0901234567', role: 'user' },
            { userId: 'admin1', username: 'admin', password: hashedPassword, name: 'Quản trị', address: 'Hà Nội', phone: '0912345678', role: 'admin' },
        ];

        const products = [
            { name: 'Sản phẩm 1', price: 5000, description: 'Đây là sản phẩm 1', imageUrl: 'https://picsum.photos/seed/p1/300/300', stock: 20 },
            { name: 'Sản phẩm 2', price: 10000, description: 'Đây là sản phẩm 2', imageUrl: 'https://picsum.photos/seed/p2/300/300', stock: 15 },
            { name: 'Sản phẩm 3', price: 15000, description: 'Đây là sản phẩm 3', imageUrl: 'https://picsum.photos/seed/p3/300/300', stock: 10 },
            { name: 'Sản phẩm 4', price: 20000, description: 'Đây là sản phẩm 4', imageUrl: 'https://picsum.photos/seed/p4/300/300', stock: 5 },
        ];

        const savedProducts = await Product.insertMany(products);
        console.log('Đã thêm 4 sản phẩm');

        await User.insertMany(users);
        console.log('Đã thêm 2 tài khoản demo (user/admin - mật khẩu: 12345)');

        const carts = [{
            userId: 'user1',
            items: [{
                productId: savedProducts[0]._id.toString(),
                name: savedProducts[0].name,
                price: savedProducts[0].price,
                imageUrl: savedProducts[0].imageUrl,
                quantity: 2,
            }],
        }];

        const orders = [{
            userId: 'user1',
            orderId: 'ORDER001',
            items: [{
                productId: savedProducts[1]._id.toString(),
                name: savedProducts[1].name,
                price: savedProducts[1].price,
                imageUrl: savedProducts[1].imageUrl,
                quantity: 1,
            }],
            status: 'pending',
        }];

        await Cart.insertMany(carts);
        console.log('Đã thêm giỏ hàng mẫu');

        await Order.insertMany(orders);
        console.log('Đã thêm đơn hàng mẫu');

        console.log('Migration hoàn tất!');
        mongoose.connection.close();

    } catch (err) {
        console.error('Lỗi khi migrate:', err.message);
        mongoose.connection.close();
    }
}

migrate();