// src/pages/Order.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function Order() {
    const [orders, setOrders] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: '', phone: '', address: '' });
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    useEffect(() => {
        if (token === null) return;
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
        fetchUserInfo();
    }, [navigate, token]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders');
            const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi');
            if (err.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    const fetchUserInfo = async () => {
        try {
            const res = await api.get('/profile');
            setUserInfo(res.data);
        } catch (err) {
            setUserInfo({ name: 'Chưa có', phone: '', address: '' });
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Hủy đơn hàng?')) return;
        try {
            await api.put(`/orders/${orderId}/cancel`, {});
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi hủy');
        }
    };

    const startEdit = (order) => {
        if (order.status !== 'pending') return alert('Chỉ sửa được đơn Chờ xử lý');
        setEditingOrderId(order.orderId);
        setEditForm({
            name: order.name || userInfo.name,
            phone: order.phone || userInfo.phone,
            address: order.address || userInfo.address,
        });
    };

    const saveEdit = async () => {
        try {
            await api.put(`/orders/${editingOrderId}/address`, editForm);
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
                    <Link to="/profile">Cá nhân</Link>
                    <button onClick={() => { logout(); navigate('/login', { replace: true }); }}>
                        Đăng xuất
                    </button>
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
                                            order.status === 'preparing' ? 'Đang chuẩn bị' :
                                            order.status === 'processing' ? 'Đang xử lý' :
                                            order.status === 'shipping' ? 'Đang giao' :
                                            order.status === 'delivered' ? 'Đã giao' :
                                            order.status === 'completed' ? 'Hoàn thành' :
                                            order.status === 'cancelled' ? 'Đã hủy' : order.status}
                                        </span>
                                        <p>
                                            <strong>Thanh toán:</strong>{' '}
                                            <span style={{
                                                color: order.paymentStatus === 'paid' ? '#28a745' :
                                                    order.paymentStatus === 'refunded' ? '#ffc107' : '#dc3545',
                                                fontWeight: '600'
                                            }}>
                                                {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                    order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}
                                            </span>
                                        </p>
                                    </div>

                                    <p><strong>Phương thức:</strong> {order.paymentMethod === 'cod' ? 'COD' : 'QR'}</p>
                                    <p>Ngày đặt: {formatDate(order.createdAt)}</p>

                                    {editingOrderId === order.orderId ? (
                                        <div className="edit-address">
                                            <input placeholder="Họ tên" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                                            <input placeholder="SĐT" value={editForm.phone} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} />
                                            <textarea placeholder="Địa chỉ" value={editForm.address} onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))} />
                                            <div className="form-actions">
                                                <button onClick={saveEdit} className="primary">Lưu</button>
                                                <button onClick={() => setEditingOrderId(null)}>Hủy</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p><strong>Giao đến:</strong> {order.name} | {order.phone} | {order.address}</p>
                                    )}

                                    <table className="order-items-table">
                                        <thead><tr><th>Hình</th><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th></tr></thead>
                                        <tbody>
                                            {order.items.map(item => (
                                                <tr key={item.productId}>
                                                    <td><img src={item.imageUrl} alt={item.name} className="order-item-img" /></td>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price.toLocaleString()}đ</td>
                                                    <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <p className="total">Tổng tiền: {order.total.toLocaleString()} VNĐ</p>

                                    {order.paymentMethod === 'qr' && order.paymentStatus !== 'paid' && (
                                        <div className="qr-actions">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const qrRes = await api.post('/payment/create-qr', { orderId: order.orderId });
                                                        window.open(qrRes.data.paymentUrl, '_blank');
                                                    } catch (err) {
                                                        alert('Lỗi tạo QR');
                                                    }
                                                }}
                                                className="qr-button"
                                            >
                                                Thanh toán QR ngay
                                            </button>
                                        </div>
                                    )}

                                    <div className="order-actions">
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => startEdit(order)} className="edit-btn">Sửa</button>
                                                <button onClick={() => handleCancel(order.orderId)} className="cancel-btn">Hủy đơn</button>
                                            </>
                                        )}
                                        {order.status === 'shipping' && order.trackingNumber && (
                                            <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>
                                                Mã vận đơn: <strong>{order.trackingNumber}</strong>
                                            </p>
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