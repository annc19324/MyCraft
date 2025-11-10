// server/middleware/checkAdmin.js
const User = require('../models/User');

const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'];      // <-- _id (string)
        const userRole = req.headers['role'];       // optional, vẫn kiểm tra DB
        if (!userId) {
            return res.status(401).json({ message: 'Yêu cầu user-id trong header' });
        }

        // Tìm bằng _id, không phải userId
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = checkAdmin;