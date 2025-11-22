const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, address, phone, role } = req.body;

        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: 'Tên đăng nhập, mật khẩu, tên và email là bắt buộc' });
        }
        if (username.length < 6 || username.length > 50) {
            return res.status(400).json({ message: 'Tên đăng nhập phải từ 6 đến 50 ký tự' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt'
            });
        }
        if (phone && !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
        }
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò phải là "user" hoặc "admin"' });
        }

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = new User({
            username,
            password: hashedPassword,
            name,
            email,
            address,
            phone,
            role: role || 'user',
            isVerified: false,
            verificationToken,
            verificationExpires,
        });
        await user.save();

        // send verification email (best-effort)
        try {
            // Prefer sending user to client verification page; also include a short numeric code in email
            const serverBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const verifyPath = `/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
            const verifyUrl = `${serverBase}${verifyPath}`;

            const html = `
                            <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
                                <h2>Xin chào ${user.name},</h2>
                                <p>Cảm ơn bạn đã đăng ký tài khoản trên MyCraft.</p>
                                <p>Mã xác thực (dùng nếu cần): <strong style="font-size:20px">${verificationCode}</strong></p>
                                <p>Để kích hoạt tài khoản, hãy bấm vào nút bên dưới hoặc dán mã vào trang xác thực trên ứng dụng:</p>
                                <p style="text-align:center; margin:20px 0">
                                    <a href="${verifyUrl}" style="background:#1976d2;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Xác nhận email</a>
                                </p>
                                <p>Liên kết và mã hợp lệ trong 24 giờ.</p>
                                <p>Nếu bạn không yêu cầu đăng ký này, hãy bỏ qua email này.</p>
                            </div>
                        `;

            const text = `Xin chao ${user.name}\n\nMã xác thực: ${verificationCode}\n\nMở link để xác thực: ${verifyUrl}\n\nLiên kết hợp lệ trong 24 giờ.`;

            await sendEmail({ to: user.email, subject: 'Xác nhận email - MyCraft', html, text });
        } catch (mailErr) {
            console.error('Không gửi được email xác nhận:', mailErr);
        }

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.'
        });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        if (err.code === 11000) {
            const dupKey = Object.keys(err.keyValue || {})[0] || 'Trường';
            return res.status(400).json({ message: `${dupKey} đã tồn tại` });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // KIỂM TRA XÁC THỰC EMAIL
        // Chỉ cho phép đăng nhập nếu:
        // 1. Tài khoản đã xác thực (isVerified = true)
        // 2. HOẶC tài khoản được tạo bởi admin (thường là admin hoặc tài khoản cũ)
        // → Dùng một field mới: `createdByAdmin` để phân biệt

        if (!user.isVerified && !user.createdByAdmin) {
            return res.status(403).json({
                message: 'Vui lòng xác thực email trước khi đăng nhập.',
                needsVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            role: user.role
        });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Verify email link
router.get('/verify', async (req, res) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) return res.status(400).json({ message: 'Thiếu token hoặc email' });

        const user = await User.findOne({ email, verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Liên kết xác thực không hợp lệ' });
        if (user.verificationExpires && user.verificationExpires < Date.now()) {
            return res.status(400).json({ message: 'Liên kết xác thực đã hết hạn' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Redirect to login page after successful verification
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.redirect(`${clientUrl}/login?verified=true`);
    } catch (err) {
        console.error('Lỗi verify:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Không tìm thấy người dùng' });
        if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
        user.verificationToken = verificationToken;
        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        try {
            const serverBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const verifyPath = `/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
            const verifyUrl = `${serverBase}${verifyPath}`;
            const html = `
                            <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
                                <h2>Xin chào ${user.name},</h2>
                                <p>Mã xác thực: <strong style="font-size:20px">${user.verificationCode}</strong></p>
                                <p>Nhấn nút bên dưới để xác nhận email:</p>
                                <p style="text-align:center; margin:20px 0">
                                    <a href="${verifyUrl}" style="background:#1976d2;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Xác nhận email</a>
                                </p>
                                <p>Liên kết và mã hợp lệ trong 24 giờ.</p>
                            </div>
                        `;
            const text = `Mã xác thực: ${user.verificationCode}\n\nMở link để xác thực: ${verifyUrl}`;
            await sendEmail({ to: user.email, subject: 'Xác nhận email - MyCraft', html, text });
        } catch (mailErr) {
            console.error('Không gửi được email xác nhận:', mailErr);
        }

        res.json({ message: 'Đã gửi lại email xác thực (nếu email tồn tại).' });
    } catch (err) {
        console.error('Lỗi resend:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});



module.exports = router;
