const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const path = require('path');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mycraft', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Đã kết nối MongoDB'))
    .catch((err) => console.log('Lỗi kết nối MongoDB:', err));

app.get('/api', (req, res) => {
    res.json({ message: 'Đây là API MyCraft' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', adminUserRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});