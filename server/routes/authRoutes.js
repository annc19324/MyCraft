const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Giả định
const crypto = require('crypto');
const sendEmail = require('../utils/mailer'); // Giả định
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Đảm bảo đã khai báo trong .env
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'; // Đảm bảo đã khai báo
const SERVER_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Đảm bảo đã khai báo

// --- 1. Đăng ký Tài khoản ---
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, address, phone, role } = req.body;

        // KIỂM TRA ĐẦU VÀO
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

        // TẠO TÀI KHOẢN VÀ TOKEN XÁC THỰC
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

        // GỬI EMAIL XÁC THỰC
        try {
            const verifyPath = `/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
            const verifyUrl = `${SERVER_BASE}${verifyPath}`;

            const html = `
                <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
                    <h2>Xin chào ${user.name},</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản trên MyCraft.</p>
                    <p>Mã xác thực (dùng nếu cần): <strong style="font-size:20px">${verificationCode}</strong></p>
                    <p>Để kích hoạt tài khoản, hãy bấm vào nút bên dưới:</p>
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

// --- 2. Đăng nhập Tài khoản ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // KIỂM TRA XÁC THỰC EMAIL
        // Chỉ cho phép đăng nhập nếu đã xác thực (isVerified=true) HOẶC tài khoản được tạo bởi Admin (createdByAdmin=true)
        if (!user.isVerified && !user.createdByAdmin) {
            return res.status(403).json({
                message: 'Vui lòng xác thực email trước khi đăng nhập.',
                needsVerification: true,
                email: user.email
            });
        }

        // TẠO JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // GỬI RESPONSE CHỨA TOKEN, ROLE và userId
        res.json({
            token,
            role: user.role,
            userId: user._id
        });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// --- 3. Xác thực Email qua Link ---
router.get('/verify', async (req, res) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) return res.status(400).json({ message: 'Thiếu token hoặc email' });

        const user = await User.findOne({ email, verificationToken: token });
        if (!user) return res.status(400).json({ message: 'Liên kết xác thực không hợp lệ' });

        // Kiểm tra Hết hạn
        if (user.verificationExpires && user.verificationExpires < Date.now()) {
            return res.status(400).json({ message: 'Liên kết xác thực đã hết hạn' });
        }

        // Cập nhật trạng thái Verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Chuyển hướng về trang đăng nhập của client
        return res.redirect(`${CLIENT_URL}/login?verified=true`);
    } catch (err) {
        console.error('Lỗi verify:', err);
        // Trong trường hợp lỗi server, chuyển hướng về trang lỗi hoặc hiển thị thông báo
        return res.redirect(`${CLIENT_URL}/login?error=verification_failed`);
    }
});

// --- 4. Gửi lại Email Xác thực ---
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Không tìm thấy người dùng' });
        if (user.isVerified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' });

        // Tái tạo Token và Code mới
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        user.verificationToken = verificationToken;
        user.verificationExpires = verificationExpires;
        await user.save(); // Lưu lại token mới

        // Gửi Email
        try {
            const verifyPath = `/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
            const verifyUrl = `${SERVER_BASE}${verifyPath}`;

            const html = `
                <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
                    <h2>Xin chào ${user.name},</h2>
                    <p>Đây là link xác thực tài khoản mới:</p>
                    <p>Mã xác thực: <strong style="font-size:20px">${verificationCode}</strong></p>
                    <p style="text-align:center; margin:20px 0">
                        <a href="${verifyUrl}" style="background:#1976d2;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Xác nhận email</a>
                    </p>
                    <p>Liên kết và mã hợp lệ trong 24 giờ.</p>
                </div>
            `;
            const text = `Mã xác thực: ${verificationCode}\n\nMở link để xác thực: ${verifyUrl}`;

            await sendEmail({ to: user.email, subject: 'Yêu cầu gửi lại Xác nhận email - MyCraft', html, text });
        } catch (mailErr) {
            console.error('Không gửi được email xác nhận:', mailErr);
        }

        res.json({ message: 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.' });
    } catch (err) {
        console.error('Lỗi resend:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


module.exports = router;