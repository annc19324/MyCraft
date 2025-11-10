// src/pages/Register.js
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

        // ==== CLIENT-SIDE VALIDATION (đồng bộ schema) ====
        if (!/^[a-z0-9.]{3,50}$/.test(formData.username)) {
            setError('Tên đăng nhập chỉ chứa a-z, 0-9, dấu chấm, 3-50 ký tự');
            setLoading(false);
            return;
        }
        if (formData.password.length < 8) {
            setError('Mật khẩu phải ≥ 8 ký tự');
            setLoading(false);
            return;
        }
        if (!/^[a-zA-ZÀ-ỹ\s]{2,100}$/.test(formData.name)) {
            setError('Tên chỉ chứa chữ cái và dấu cách, 2-100 ký tự');
            setLoading(false);
            return;
        }
        if (formData.phone && !/^(?:\+84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(formData.phone)) {
            setError('Số điện thoại Việt Nam không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                ...formData,
                role: 'user',
            });

            const userData = {
                userId: response.data._id,      // <-- lưu đúng key
                username: response.data.username,
                role: response.data.role || 'user',
            };
            localStorage.setItem('user', JSON.stringify(userData));
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