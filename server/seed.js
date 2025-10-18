const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('da ket noi mongo'))
    .catch((err) => console.log('loi ket noi mongoose: ', err))

const seedProducts = [
    { productId: '1', name: 'cong tay thu cong', price: 100, description: 'day la vong tay thu cong', ImageUrl: 'https://place.dog/100/100', stock: 200 },
];

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(seedProducts);
        console.log('Products seeded');
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

seedDB();