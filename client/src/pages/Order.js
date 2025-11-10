// src/pages/Order.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/order.css'; // CSS mới

function Order() {
    const [orders, setOrders] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user?.userId) {
            navigate('/login');
            return;
        }
        fetchOrders();
        fetchUserInfo();
    }, [navigate, user?.userId]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { 'user-id': user.userId },
            });
            // Sắp xếp: mới nhất trước
            setOrders((res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi');
        } finally {
            setLoading(false);
        }
    };

    // src/pages/Order.js
    const fetchUserInfo = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { 'user-id': user.userId },
            });
            setUserInfo(res.data);
        } catch (err) {
            console.error('Không lấy được thông tin người dùng');
            setUserInfo({ name: 'Chưa có', phone: '', address: '' });
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Hủy đơn hàng?')) return;
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
                headers: { 'user-id': user.userId },
            });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi hủy');
        }
    };

    const startEdit = (order) => {
        if (order.status !== 'pending') return alert('Chỉ sửa được đơn chờ xử lý');
        setEditingOrderId(order.orderId);
        setEditForm({
            name: order.name || userInfo.name,
            phone: order.phone || userInfo.phone,
            address: order.address || userInfo.address,
        });
    };

    const saveEdit = async () => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${editingOrderId}/address`, editForm, {
                headers: { 'user-id': user.userId },
            });
            setEditingOrderId(null);
            fetchOrders();
            fetchUserInfo();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi cập nhật');
        }
    };

    const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

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
                <div className="order-history-container">
                    <button onClick={() => navigate(-1)} className="back-button">Quay lại</button>
                    <h2>Đơn hàng của tôi</h2>
                    {error && <p className="error">{error}</p>}
                    {loading && <p>Đang tải...</p>}

                    {orders.length === 0 && !loading ? (
                        <p>Chưa có đơn hàng nào</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.orderId} className="order-card">
                                    <div className="order-header">
                                        <strong>Mã đơn: {order.orderId}</strong>
                                        <span className={`status ${order.status}`}>
                                            {order.status === 'pending' ? 'Chờ xử lý' :
                                                order.status === 'completed' ? 'Hoàn thành' :
                                                    order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                        </span>
                                        <span className={`status ${order.paymentStatus}`}>
                                            {order.paymentStatus === 'unpaid' ? 'Chưa thanh toán' :
                                                order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                    'Đã hoàn tiền'}
                                        </span>
                                    </div>
                                    <p><strong>Phương thức:</strong>
                                        {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Mã QR'}
                                    </p>
                                    <p>Ngày đặt: {formatDate(order.createdAt)}</p>

                                    {/* Thông tin giao hàng */}
                                    {editingOrderId === order.orderId ? (
                                        <div className="edit-address">
                                            <input placeholder="Họ tên" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                                            <input placeholder="SĐT" value={editForm.phone} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} />
                                            <textarea placeholder="Địa chỉ" value={editForm.address} onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))} />

                                            <button style={{ marginTop: '10px' }} onClick={saveEdit}>Lưu</button>
                                            <button style={{ marginLeft: '10px' }} onClick={() => setEditingOrderId(null)}>Hủy</button>
                                        </div>
                                    ) : (
                                        <p><strong>Giao đến:</strong> {order.address || userInfo.address}</p>
                                    )}

                                    <table className="order-items-table">
                                        <thead><tr><th>Hình</th><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th></tr></thead>
                                        <tbody>
                                            {order.items.map(item => (
                                                <tr key={item.productId}>
                                                    <td><img src={item.imageUrl} alt={item.name} className="order-item-img" /></td>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price.toLocaleString()} VNĐ</td>
                                                    <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <p className="total">Tổng tiền: {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} VNĐ</p>

                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => startEdit(order)} className="edit-btn">Sửa thông tin</button>
                                                <button onClick={() => handleCancel(order.orderId)} className="cancel-btn">Hủy đơn</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Order;