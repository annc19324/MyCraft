// src/pages/admin/AdminOrders.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.userId;
    const role = user?.role;

    const fetchOrders = useCallback(async () => {
        if (!userId || role !== 'admin') return;
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/orders/all', {
                headers: { 'user-id': userId, 'role': role },
            });
            setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [userId, role]);

    useEffect(() => {
        if (!userId || role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [fetchOrders, navigate]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Cập nhật trạng thái thành "${newStatus}"?`)) return;
        try {
            const res = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { 'user-id': userId, 'role': role } }
            );
            setOrders(prev => prev.map(o => o.orderId === orderId ? res.data : o));
            alert('Cập nhật thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật');
        }
    };

    const filteredOrders = orders.filter(o =>
        o.orderId.includes(searchTerm) ||
        o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

    if (!userId || role !== 'admin') return null;

    return (
        <div className="admin-section">
            <h2>Quản lý đơn hàng</h2>
            {error && <p className="error">{error}</p>}

            <div className="search-container" style={{ marginBottom: '1rem' }}>
                <label>Tìm kiếm:</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Mã đơn hoặc tên khách..."
                />
            </div>

            {loading ? <p>Đang tải...</p> : currentOrders.length === 0 ? <p>Không có đơn hàng nào</p> : (
                <>
                    {currentOrders.map(order => (
                        <div key={order.orderId} className="order-card" style={{ marginBottom: '1.5rem' }}>
                            <div className="order-header">
                                <strong>Mã: {order.orderId}</strong>
                                <span className={`status ${order.status}`}>
                                    {order.status === 'pending' ? 'Chờ xử lý' :
                                        order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                </span>
                            </div>
                            <p><strong>Khách:</strong> {order.name} | {order.phone}</p>
                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                            <p><strong>Phương thức:</strong> {order.paymentMethod === 'cod' ? 'COD' : 'QR'}</p>
                            <p><strong>Tổng:</strong> {order.total.toLocaleString()} VNĐ</p>
                            <p><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</p>

                            <table className="order-items-table" style={{ margin: '1rem 0' }}>
                                <thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Tổng</th></tr></thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.productId}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price.toLocaleString()}</td>
                                            <td>{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="order-actions">
                                {order.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'completed')} className="action-button edit">
                                            Hoàn thành
                                        </button>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'cancelled')} className="action-button delete">
                                            Hủy đơn
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="pagination">
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Trước</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => paginate(page)} className={`pagination-button ${page === currentPage ? 'active' : ''}`}>
                                {page}
                            </button>
                        ))}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">Sau</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminOrders;