import React, { useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import '../assets/styles/forgotpassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // validation: require email
        if (!email || !email.trim()) {
            const msg = 'Vui lòng nhập email để nhận hướng dẫn đặt lại mật khẩu.';
            setError(msg);
            console.warn('ForgotPassword submit without email');
            return;
        }
        setError(null);
        setMessage(null);
        setLoading(true);
        try {
            const resp = await api.post('/auth/forgot-password', { email: email.trim() });
            // Show clearer user-facing message
            const successMsg = resp.data?.message || 'Yêu cầu đã được gửi. Vui lòng kiểm tra hộp thư (bao gồm Spam) để tiếp tục.';
            setMessage(successMsg);
            // Log success for debugging/trace
            console.log('ForgotPassword: request sent', { email: email.trim(), serverMessage: successMsg });
        } catch (err) {
            console.error('Forgot error', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-outer">
            <div className="auth-card forgot-card">
                <h2>Quên mật khẩu</h2>
                <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} className="auth-form forgot-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Đang gửi...' : 'Gửi'}
                    </button>
                </form>
                <p className="forgot-link" style={{ marginTop: 12 }}>
                    <Link to="/login"> Quay lại đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
