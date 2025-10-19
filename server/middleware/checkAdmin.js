const User = require('../models/User');

const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'];
        const userRole = req.headers['role'];
        if (!userId || !userRole) {
            return res.status(401).json({ message: 'Yêu cầu user-id và role trong header' });
        }
        const user = await User.findOne({ userId: userId });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = checkAdmin;