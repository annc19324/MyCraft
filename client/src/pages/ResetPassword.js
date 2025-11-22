// src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import '../assets/styles/resetpassword.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailLocked, setEmailLocked] = useState(false);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const passwordReset = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{8,}$/;

    useEffect(() => {
        const qEmail = searchParams.get('email');
        const qToken = searchParams.get('token');

        if (qEmail) {
            setEmail(decodeURIComponent(qEmail));
            setEmailLocked(true);
        }
        if (qToken) setToken(qToken);

        if (qEmail || qToken) {
            const cleanPath = window.location.pathname;
            navigate(cleanPath, { replace: true });
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) return setError('Vui lòng nhập email');
        if (!passwordReset.test(newPassword)) {
            return setError('Mật khẩu: ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt');
        }
        if (newPassword !== confirm) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email.trim(),
                token,
                newPassword
            });

            setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...');
            setTimeout(() => navigate('/login?reset=success'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi đặt lại mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-outer">
            <div className="auth-card">
                <div className="card-header">
                    <h2>Đặt lại mật khẩu</h2>
                </div>

                {success && <div className="alert success">Success: {success}</div>}
                {error && <div className="alert error">Error: {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => !emailLocked && setEmail(e.target.value)}
                            required
                            readOnly={emailLocked}
                            placeholder="you@example.com"
                        />
                        {emailLocked && <small className="locked-hint">Email đã được xác nhận từ liên kết</small>}
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="8+ ký tự, chữ hoa, số, ký tự đặc biệt"
                        />
                        <small className="password-hint">
                            Yêu cầu: 8+ ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn primary">
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>

                <p className="auth-link">
                    <Link to="/login">Quay lại đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;