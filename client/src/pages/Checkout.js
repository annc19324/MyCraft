// src/pages/Checkout.js (ĐÃ SỬA HOÀN CHỈNH)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
function Checkout() {
    const [orderItems, setOrderItems] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const selectedItems = location.state?.selectedItems || [];

    useEffect(() => {
        if (!user?.userId) {
            navigate('/login');
            return;
        }

        fetchUserInfo();
        fetchOrderItems();
    }, [navigate, user?.userId]);

    const fetchUserInfo = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { 'user-id': user.userId },
            });
            setUserInfo(res.data);
            setForm(res.data);
        } catch (err) {
            console.warn('Không lấy được thông tin người dùng');
            setUserInfo({ name: 'Chưa có', phone: '', address: '' });
            setForm({ name: '', phone: '', address: '' });
        }
    };

    const fetchOrderItems = async () => {
        if (selectedItems.length === 0) {
            setError('Không có sản phẩm nào để thanh toán');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/cart/selected',
                { selectedItems },
                { headers: { 'user-id': user.userId } }
            );
            setOrderItems(response.data.items || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy thông tin thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (!form.name || !form.phone || !form.address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        try {
            const itemsWithAddress = orderItems.map(item => ({
                ...item,
                address: `${form.name} | ${form.phone} | ${form.address}`
            }));

            await axios.post(
                'http://localhost:5000/api/orders',
                { items: itemsWithAddress },
                { headers: { 'user-id': user.userId } }
            );

            await axios.post(
                'http://localhost:5000/api/cart/remove-selected',
                { selectedItems },
                { headers: { 'user-id': user.userId } }
            );

            alert('Đặt hàng thành công!');
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đặt hàng');
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}>Đăng xuất</button>
                </div>
            </nav>

            <div className="page-content">
                <div className="checkout-container">
                    <button onClick={() => navigate(-1)} className="back-button">Quay lại</button>
                    <h2>Xác nhận đơn hàng</h2>
                    {error && <p className="error">{error}</p>}

                    {/* === THÔNG TIN GIAO HÀNG === */}
                    <div className="section">
                        <h3>Thông tin giao hàng</h3>
                        {editing ? (
                            <div className="edit-form">
                                <input placeholder="Họ tên" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                <input placeholder="SĐT" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                                <textarea placeholder="Địa chỉ" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows="3" />
                                <div className="form-actions">
                                    <button onClick={() => { setEditing(false); setForm(userInfo); }}>Hủy</button>
                                    <button onClick={() => setEditing(false)} className="primary">Lưu</button>
                                </div>
                            </div>
                        ) : (
                            <div className="user-info">
                                <p><strong>Họ tên:</strong> {userInfo.name}</p>
                                <p><strong>SĐT:</strong> {userInfo.phone || 'Chưa có'}</p>
                                <p><strong>Địa chỉ:</strong> {userInfo.address || 'Chưa có'}</p>
                                <button onClick={() => { setEditing(true); setForm(userInfo); }} className="edit-btn">Sửa</button>
                            </div>
                        )}
                    </div>

                    {/* === SẢN PHẨM === */}
                    <div className="section">
                        <h3>Sản phẩm</h3>
                        {loading ? <p>Đang tải...</p> : (
                            <table className="checkout-table">
                                <thead>
                                    <tr>
                                        <th>Hình</th><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map(item => (
                                        <tr key={item.productId}>
                                            <td><img src={item.imageUrl} alt={item.name} className="checkout-image" /></td>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price.toLocaleString()} VNĐ</td>
                                            <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* === TỔNG TIỀN === */}
                    <div className="section total-section">
                        <p className="total">Tổng tiền: <strong>{totalPrice.toLocaleString()} VNĐ</strong></p>
                    </div>

                    {/* === NÚT ĐẶT HÀNG === */}
                    <div className="checkout-actions">
                        <Link to="/cart" className="back-btn">Quay lại giỏ hàng</Link>
                        <button onClick={handlePlaceOrder} disabled={loading} className="place-order-btn">
                            {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;