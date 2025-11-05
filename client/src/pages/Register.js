import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
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
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                ...formData,
                role: 'user', // Mặc định là user, admin phải tạo thủ công
            });
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Đăng ký</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang xử lý...</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Họ tên:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Địa chỉ:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>
            <p className="login-link">
                Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </p>
        </div>
    );
}

export default Register;