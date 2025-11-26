// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Thiếu token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // decoded = { userId: "...", role: "user", iat: ..., exp: ... }
        req.user = {
            _id: decoded.userId,
            userId: decoded.userId,
            role: decoded.role
        };
        next();
    } catch (err) {
        console.error('Token không hợp lệ:', err.message);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};