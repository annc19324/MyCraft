// src/pages/ChangePassword.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../assets/styles/changepassword.css';
import { useAuth } from '../hooks/useAuth';

function ChangePassword() {
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const navigate = useNavigate();
    const { logout } = useAuth(); // Chỉ dùng logout khi cần

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{8,}$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const toggleShowPassword = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate
        if (!form.currentPassword) return setError('Vui lòng nhập mật khẩu hiện tại');
        if (!form.newPassword) return setError('Vui lòng nhập mật khẩu mới');
        if (!passwordRegex.test(form.newPassword)) {
            return setError('Mật khẩu: ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt');
        }
        if (form.newPassword !== form.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            await api.put('/profile/password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });

            // THÀNH CÔNG → VỀ LẠI PROFILE
            setSuccess('Đổi mật khẩu thành công! Đang chuyển về trang cá nhân...');
            setTimeout(() => {
                navigate('/profile', { replace: true });
            }, 1500);

        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi đổi mật khẩu';
            setError(msg);

            // Chỉ logout nếu token hết hạn
            if (err.response?.status === 401) {
                logout();
                navigate('/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    <Link to="/profile">Cá nhân</Link>
                    <button onClick={() => { logout(); navigate('/login', { replace: true }); }}>
                        Đăng xuất
                    </button>
                </div>
            </nav>

            <div className="page-content">
                <div className="change-password-container">
                    <div className="change-password-card">
                        <div className="card-header">
                            <h2>Đổi mật khẩu</h2>
                            <Link to="/profile" className="back-link">Quay lại hồ sơ</Link>
                        </div>

                        {success && <div className="alert success">Success: {success}</div>}
                        {error && <div className="alert error">Error: {error}</div>}

                        <form onSubmit={handleSubmit} className="password-form">
                            {/* MẬT KHẨU HIỆN TẠI */}
                            <div className="input-group">
                                <label>Mật khẩu hiện tại *</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={form.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        disabled={loading}
                                    />
                                   
                                </div>
                            </div>

                            {/* MẬT KHẨU MỚI */}
                            <div className="input-group">
                                <label>Mật khẩu mới *</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        name="newPassword"
                                        value={form.newPassword}
                                        onChange={handleChange}
                                        placeholder="8+ ký tự, chữ hoa, số, ký tự đặc biệt"
                                        disabled={loading}
                                    />
                                </div>
                                <small className="password-hint">
                                    Yêu cầu: 8+ ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
                                </small>
                            </div>

                            {/* XÁC NHẬN */}
                            <div className="input-group">
                                <label>Xác nhận mật khẩu mới *</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="btn primary">
                                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                                <Link to="/profile" className="btn secondary">Hủy</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;