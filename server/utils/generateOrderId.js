// server/utils/generateOrderId.js
let counter = 0;
const generateOrderId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // 20251115
    counter = (counter + 1) % 999999; // < 1 triệu
    return `DH${date}${String(counter).padStart(6, '0')}`; // DH20251115000001
};
module.exports = generateOrderId;