// server/cron/autoComplete.js
const cron = require('node-cron');
const Order = require('../models/Order');

cron.schedule('0 0 * * *', async () => {
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const result = await Order.updateMany(
            { status: 'delivered', deliveredAt: { $lt: threeDaysAgo }, completedAt: null },
            { status: 'completed', completedAt: new Date() }
        );
        console.log(`Hoàn thành tự động: ${result.nModified} đơn`);
    } catch (err) {
        console.error('Lỗi cron:', err);
    }
});