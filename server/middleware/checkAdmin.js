// middleware/checkAdmin.js
const verifyToken = require('./verifyToken');

module.exports = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) {
            return res.status(401).json({ message: err.message || 'Token không hợp lệ' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Yêu cầu quyền admin' });
        }
        next();
    });
};