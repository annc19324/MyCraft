const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'userId là bắt buộc'],
        unique: true,
    },
    username: {
        type: String,
        required: [true, 'Tên đăng nhập là bắt buộc'],
        unique: true,
        trim: true,
        match: [/^[a-z0-9.]+$/, 'Tên đăng nhập chỉ được chứa a-z, 0-9 và dấu chấm, không có dấu cách'],
        minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
        maxlength: [50, 'Tên đăng nhập không được vượt quá 50 ký tự'],
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
        // validate: {
        //     validator: function (value) {
        //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value);
        //     },
        //     message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
        // },
    },
    name: {
        type: String,
        required: [true, 'Tên là bắt buộc'],
        trim: true,
        minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
        maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
        match: [/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và dấu cách'],
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
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Vai trò phải là "user" hoặc "admin"',
        },
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);