// // server/middleware/checkUser.js
// const User = require('../models/User');

// const checkUser = async (req, res, next) => {
//     try {
//         const userId = req.headers['user-id'];
//         if (!userId) {
//             return res.status(401).json({ message: 'Thiếu user-id' });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'Không tìm thấy người dùng' });
//         }

//         // Gắn userId để dùng trong route
//         req.userId = userId;
//         next();
//     } catch (err) {
//         res.status(500).json({ message: 'Lỗi xác thực' });
//     }
// };

// module.exports = checkUser;