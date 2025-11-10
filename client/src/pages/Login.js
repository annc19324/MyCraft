// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user?.userId) {
            console.log('Đã đăng nhập:', user);
            navigate(user.role === 'admin' ? '/admin' : '/');
        }
    }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password,
            });

            // DỮ LIỆU PHẢI CÓ: _id, username, role
            const userData = {
                userId: response.data._id,        // ← DÙNG _id
                username: response.data.username,
                role: response.data.role || 'user',
            };

            console.log('Lưu user vào localStorage:', userData);
            localStorage.setItem('user', JSON.stringify(userData));

            navigate(userData.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu');
            console.error('Lỗi đăng nhập:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng nhập</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang xử lý...</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.trim())}
                        required
                        autoComplete="username"
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
            <p className="register-link">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
        </div>
    );
}

export default Login;