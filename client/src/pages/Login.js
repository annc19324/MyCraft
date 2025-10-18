import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        address: '',
        phone: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                const response = await axios.post('http://localhost:5000/api/users/login', {
                    username: formData.username,
                    password: formData.password,
                });
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/');
            } else {
                if (!formData.name || !formData.address || !formData.phone) {
                    setError('Vui lòng điền đầy đủ thông tin');
                    setLoading(false);
                    return;
                }
                await axios.post('http://localhost:5000/api/users/register', formData);
                setIsLogin(true);
                setFormData({ username: '', password: '', name: '', address: '', phone: '' });
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xử lý');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tên người dùng:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {!isLogin && (
                    <>
                        <div>
                            <label>Họ tên:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Địa chỉ:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Số điện thoại:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </>
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </button>
            </form>
            <p>
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                </button>
            </p>
        </div>
    );
}

export default Login;