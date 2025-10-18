const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('đã kết nối mongo'))
    .catch((err) =>
        console.log('lỗi kết nối mongo: ', err));

app.get('/', (req, res) => {
    res.json({ message: 'đây là API MyCraft' })
})

const PORT = process.env.PORT || ''
if (PORT === '') {
    console.log('không tìm thấy port trong .env');
    return;
}

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
})