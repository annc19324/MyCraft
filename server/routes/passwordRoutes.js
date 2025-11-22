// server/routes/passwordRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

// Forgot password - request reset link/code via email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email là bắt buộc' });

        const user = await User.findOne({ email });

        // Always respond with a generic message to avoid leaking account existence
        const genericMsg = 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn để đặt lại mật khẩu.';
        if (!user) {
            return res.json({ message: genericMsg });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetCode = resetCode;
        user.passwordResetExpires = resetExpires;
        await user.save();

        try {
            const clientBase = process.env.CLIENT_URL || 'http://localhost:3000';
            const clientResetUrl = `${clientBase}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

            const html = `
                <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
                    <h2>Xin chào ${user.name},</h2>
                    <p>Yêu cầu đặt lại mật khẩu đã được ghi nhận.</p>
                    <p>Mã đặt lại (dùng nếu cần): <strong style="font-size:20px">${resetCode}</strong></p>
                    <p>Nhấn nút bên dưới để mở trang đặt lại mật khẩu:</p>
                    <p style="text-align:center; margin:20px 0">
                        <a href="${clientResetUrl}" style="background:#1976d2;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Đặt lại mật khẩu</a>
                    </p>
                    <p>Liên kết và mã hợp lệ trong 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu đặt lại này, hãy bỏ qua email.</p>
                </div>
            `;
            const text = `Mã đặt lại: ${resetCode}\n\nMở link để đặt lại mật khẩu: ${clientResetUrl}\n\nLiên kết hợp lệ trong 1 giờ.`;

            await sendEmail({ to: user.email, subject: 'Đặt lại mật khẩu - MyCraft', html, text });
        } catch (mailErr) {
            console.error('Không gửi được email đặt lại mật khẩu:', mailErr);
        }

        return res.json({ message: genericMsg });
    } catch (err) {
        console.error('Lỗi forgot-password:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Reset password - accept token or numeric code
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, code, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ message: 'Email và mật khẩu mới là bắt buộc' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Không tìm thấy người dùng' });

        const now = Date.now();
        let valid = false;

        if (token && user.passwordResetToken && user.passwordResetToken === token) {
            if (user.passwordResetExpires && user.passwordResetExpires >= now) valid = true;
        }
        if (!valid && code && user.passwordResetCode && user.passwordResetCode === String(code)) {
            if (user.passwordResetExpires && user.passwordResetExpires >= now) valid = true;
        }

        if (!valid) return res.status(400).json({ message: 'Token hoặc mã đặt lại không hợp lệ hoặc đã hết hạn' });

        // Validate new password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Mật khẩu mới không hợp lệ (ít nhất 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt)' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.passwordResetToken = undefined;
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        // Optionally mark verified
        user.isVerified = true;
        await user.save();

        res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
    } catch (err) {
        console.error('Lỗi reset-password:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
