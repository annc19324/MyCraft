// src/pages/Profile.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../assets/styles/profile.css';
import { useAuth } from '../hooks/useAuth';
import {
    FaUser, FaEnvelope, FaMobile, FaMapMarkerAlt,
    FaShoppingBag, FaKey, FaHeadset, FaEdit,
    FaMobileAlt
} from 'react-icons/fa';

function Profile() {
    const [userInfo, setUserInfo] = useState({
        username: '', name: '', email: '', address: '', phone: '',
        avatar: 'https://place.dog/100/100', // fallback
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const { token, logout } = useAuth();

    // === HÀM HIỂN THỊ THÔNG BÁO TỰ MẤT SAU 4 GIÂY (CẢ SUCCESS & ERROR) ===
    const showMessage = (message, type = 'success') => {
        if (type === 'success') {
            setSuccess(message);
            setError(null);
            setTimeout(() => setSuccess(null), 4000);
        } else {
            setError(message);
            setSuccess(null);
            setTimeout(() => setError(null), 4000); // ← Lỗi cũng tự mất
        }
    };

    // === LOAD PROFILE KHI CÓ TOKEN ===
    useEffect(() => {
        if (!token) {
            // Chờ token xuất hiện trong localStorage (trường hợp vừa đăng nhập)
            const interval = setInterval(() => {
                const stored = localStorage.getItem('user');
                if (stored) {
                    clearInterval(interval);
                    fetchUserProfile();
                }
            }, 100);
            return () => clearInterval(interval);
        }
        fetchUserProfile();
    }, [token]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/profile');
            setUserInfo({
                ...res.data,
                avatar: res.data.avatar || 'https://place.dog/100/100'
            });
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể tải thông tin';
            showMessage(msg, 'error');
            if (err.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/profile', {
                name: userInfo.name,
                email: userInfo.email,
                address: userInfo.address,
                phone: userInfo.phone,
            });
            await fetchUserProfile();
            showMessage('Cập nhật thành công!');
            setIsEditing(false);
        } catch (err) {
            showMessage(err.response?.data?.message || 'Lỗi cập nhật', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            const res = await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUserInfo(prev => ({
                ...prev,
                avatar: res.data.avatar + '?t=' + Date.now() // Cache busting
            }));
            showMessage('Đổi ảnh thành công!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi upload ảnh';
            showMessage(msg, 'error'); // ← Lỗi magic bytes cũng tự mất sau 4 giây
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
                    <Link to="/messages">Chat</Link>
                    <Link to="/profile">Cá nhân</Link>
                    <button onClick={() => { logout(); navigate('/login', { replace: true }); }}>
                        Đăng xuất
                    </button>
                </div>
            </nav>

            <div className="page-content">
                <div className="profile-container">
                    <div className="profile-header">
                        <h2>Thông tin cá nhân</h2>
                        <button onClick={() => setIsEditing(!isEditing)} className="edit-toggle-btn">
                            <FaEdit /> {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                        </button>
                    </div>

                    {/* THÔNG BÁO – ĐÃ ĐƯỢC TỐI ƯU */}
                    {success && <div className="alert success">Success: {success}</div>}
                    {error && <div className="alert error">Error: {error}</div>}
                    {loading && <div className="alert loading">Đang xử lý...</div>}

                    <div className="profile-card">
                        {/* AVATAR */}
                        <div className="avatar-section">
                            <img
                                src={userInfo.avatar}
                                alt="Avatar"
                                className="profile-avatar"
                                onError={(e) => { e.target.src = 'https://place.dog/100/100'; }}
                            />
                            {isEditing && (
                                <div className="avatar-upload">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="change-avatar-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tải...' : 'Đổi ảnh'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* THÔNG TIN */}
                        <div className="profile-info-grid">
                            <div className="info-item">
                                <FaUser className="icon" />
                                <div>
                                    <label>Tên đăng nhập</label>
                                    <p className="value">{userInfo.username || 'Chưa có'}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <>
                                    <div className="info-item">
                                        <FaUser className="icon" />
                                        <div>
                                            <label>Họ tên *</label>
                                            <input name="name" value={userInfo.name} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaEnvelope className="icon" />
                                        <div>
                                            <label>Email</label>
                                            <input name="email" value={userInfo.email} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaMobile className="icon" />
                                        <div>
                                            <label>Số điện thoại</label>
                                            <input name="phone" value={userInfo.phone} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="info-item full">
                                        <FaMapMarkerAlt className="icon" />
                                        <div>
                                            <label>Địa chỉ giao hàng</label>
                                            <textarea name="address" value={userInfo.address} onChange={handleInputChange} rows="2" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="info-item">
                                        <FaUser className="icon" />
                                        <div>
                                            <label>Họ tên</label>
                                            <p className="value">{userInfo.name || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaEnvelope className="icon" />
                                        <div>
                                            <label>Email</label>
                                            <p className="value">{userInfo.email || 'Chưa có'}</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaMobile className="icon" />
                                        <div>
                                            <label>SĐT</label>
                                            <p className="value">{userInfo.phone || 'Chưa có'}</p>
                                        </div>
                                    </div>
                                    <div className="info-item full">
                                        <FaMapMarkerAlt className="icon" />
                                        <div>
                                            <label>Địa chỉ</label>
                                            <p className="value">{userInfo.address || 'Chưa có'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* NÚT HÀNH ĐỘNG */}
                        <div className="action-buttons">
                            {isEditing && (
                                <>
                                    <button onClick={handleSave} disabled={loading} className="btn primary">
                                        Lưu thay đổi
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="btn secondary">
                                        Hủy
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CÁC NÚT NHANH */}
                    <div className="quick-actions">
                        <Link to="/orders" className="action-card">
                            <FaShoppingBag className="action-icon" />
                            <div>
                                <h4>Đơn hàng của tôi</h4>
                                <p>Xem lịch sử mua sắm</p>
                            </div>
                        </Link>
                        <Link to="/addresses" className="action-card">
                            <FaMapMarkerAlt className="action-icon" />
                            <div>
                                <h4>Địa chỉ giao hàng</h4>
                                <p>Quản lý địa chỉ</p>
                            </div>
                        </Link>
                        <Link to="/change-password" className="action-card">
                            <FaKey className="action-icon" />
                            <div>
                                <h4>Đổi mật khẩu</h4>
                                <p>Bảo mật tài khoản</p>
                            </div>
                        </Link>
                        <Link to="/support" className="action-card">
                            <FaHeadset className="action-icon" />
                            <div>
                                <h4>Hỗ trợ khách hàng</h4>
                                <p>Liên hệ ngay</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;