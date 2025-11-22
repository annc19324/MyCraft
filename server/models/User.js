// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Tên đăng nhập là bắt buộc'],
        unique: true,
        trim: true,
        match: [/^[a-z0-9.]+$/, 'Tên đăng nhập chỉ được chứa a-z, 0-9 và dấu chấm, không có dấu cách'],
        // minlength: [6, 'Tên đăng nhập phải có ít nhất 6 ký tự'],
        maxlength: [50, 'Tên đăng nhập không được vượt quá 50 ký tự'],
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
        // match: [
        //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        //     'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt'
        // ]
    },
    name: {
        type: String,
        required: [true, 'Tên là bắt buộc'],
        trim: true,
        minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
        maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
        match: [/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và dấu cách'],
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự'],
    },
    phone: {
        type: String,
        trim: true,
        match: [/^(?:\+84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/, 'Số điện thoại không hợp lệ (phải là số Việt Nam)'],
    },
    avatar: {
        type: String,
        default: 'https://place.dog/100/100', // Ảnh mặc định
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Email verification
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdByAdmin: {
        type: Boolean,
        default: false, // mặc định là user tự đăng ký
    },
    verificationToken: {
        type: String,
    },
    verificationCode: {
        type: String,
    },
    verificationExpires: {
        type: Date,
    },
    // Password reset fields
    passwordResetToken: {
        type: String,
    },
    passwordResetCode: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);