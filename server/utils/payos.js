// server/utils/payos.js
const PayOS = require('@payos/node');
require('dotenv').config();

if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    throw new Error('Thiếu cấu hình PayOS trong .env');
}

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

module.exports = payOS;