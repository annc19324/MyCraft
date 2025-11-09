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
        if (user && user.userId) {
            console.log('User already logged in:', user);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
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
            const userData = {
                userId: response.data.userId,
                username: response.data.username,
                role: response.data.role || 'user',
            };
            console.log('Saving user to localStorage:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (response.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đăng nhập');
            console.error('Login error:', err.response?.data || err.message);
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
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </form>
            <p className="register-link">
                Chưa có tài khoản? <a href="/register">Đăng ký</a>
            </p>
        </div>
    );
}

export default Login;