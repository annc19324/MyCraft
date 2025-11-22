// src/pages/admin/AdminOrders.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { token, role, logout } = useAuth();

    /* ==================================================================
       [ADMIN] LẤY TẤT CẢ ĐƠN HÀNG
       ================================================================== */
    // const fetchOrders = useCallback(async () => {
    //     if (!token || role !== 'admin') return;
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const res = await api.get('/orders/all');
    //         const sortedOrders = (res.data || []).sort(
    //             (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    //         );
    //         setOrders(sortedOrders);
    //     } catch (err) {
    //         const msg = err.response?.data?.message || 'Lỗi khi lấy đơn hàng';
    //         setError(msg);
    //         console.error('[ADMIN] Lỗi fetch orders:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [token]);
    // console.log('🔍 Imported api:', api);
    const fetchOrders = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 [ADMIN] Đang gọi API:', `${api.defaults.baseURL}/orders/all`);

            const res = await api.get('/orders/all');

            console.log('✅ [ADMIN] API response:', res);

            const sortedOrders = (res.data || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (err) {
            console.error('❌ [ADMIN] Lỗi fetch orders:', err);
            console.log('🔍 Chi tiết lỗi:', {
                message: err.message,
                code: err.code,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data
            });

            const msg = err.response?.data?.message || 'Lỗi khi lấy đơn hàng';
            setError(msg);

            // Hiển thị thông báo cụ thể
            if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server. Backend có thể đang tắt.');
            } else if (err.response?.status === 404) {
                setError('Endpoint /orders/all không tồn tại trên backend.');
            } else if (err.response?.status === 500) {
                setError('Lỗi server backend.');
            }
        } finally {
            setLoading(false);
        }
    }, [token, role]);

    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }
        fetchOrders();
    }, [fetchOrders, navigate]);

    //    admin  CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG

    const handleUpdateStatus = async (orderId, newStatus) => {
        const statusText = newStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy';
        if (!window.confirm(`Cập nhật trạng thái thành "${statusText}"?`)) return;

        try {
            const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });

            setOrders(prev => prev.map(o => o.orderId === orderId ? res.data : o));
            alert('Cập nhật thành công!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Lỗi khi cập nhật';
            setError(msg);
            console.error('[ADMIN] Lỗi update status:', err);
        }
    };

    /* ==================================================================
       [ADMIN] TÌM KIẾM + PHÂN TRANG
       ================================================================== */
    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // Bảo vệ quyền truy cập
    if (!token || role !== 'admin') return null;

    /* ==================================================================
       [ADMIN] GIAO DIỆN HIỂN THỊ
       ================================================================== */
    return (
        <div className="admin-section">
            <h2>Quản lý đơn hàng</h2>
            {error && <p className="error">{error}</p>}

            <div className="search-container" style={{ marginBottom: '1rem' }}>
                <label>Tìm kiếm:</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Mã đơn hoặc tên khách..."
                />
            </div>

            {loading ? (
                <p>Đang tải đơn hàng...</p>
            ) : currentOrders.length === 0 ? (
                <p>Không có đơn hàng nào</p>
            ) : (
                <>
                    {currentOrders.map(order => (
                        <div key={order.orderId} className="order-card" style={{ marginBottom: '1.5rem' }}>
                            <div className="order-header">
                                <strong>Mã: {order.orderId}</strong>
                                {/* // Trong phần hiển thị trạng thái */}
                                <span className={`status ${order.status}`}>
                                    {order.status === 'pending' ? 'Chờ xử lý' :
                                        order.status === 'processing' ? 'Đang chuẩn bị' :
                                            order.status === 'shipping' ? 'Đang giao' :
                                                order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                </span>
                            </div>
                            <p><strong>Khách:</strong> {order.name} | {order.phone}</p>
                            <p><strong>Địa chỉ:</strong> {order.address}</p>
                            <p><strong>Phương thức:</strong> {order.paymentMethod === 'cod' ? 'COD' : 'QR'}</p>
                            <p><strong>Tổng:</strong> {order.total.toLocaleString()} VNĐ</p>
                            <p><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</p>

                            <p>
                                <strong>Thanh toán:</strong>{' '}
                                <span style={{
                                    color: order.paymentStatus === 'paid' ? '#28a745' : '#dc3545',
                                    fontWeight: 'bold'
                                }}>
                                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                            </p>
                            <table className="order-items-table" style={{ margin: '1rem 0' }}>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th>Giá</th>
                                        <th>Tổng</th>
                                    </tr>
                                </thead>
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

                            {/* NÚT HÀNH ĐỘNG THEO TRẠNG THÁI */}
                            <div className="order-actions">
                                {order.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'processing')} className="action-button confirm">
                                            Xác nhận
                                        </button>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'cancelled')} className="action-button delete">
                                            Hủy đơn
                                        </button>
                                    </>
                                )}

                                {order.status === 'processing' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'shipping')} className="action-button ship">
                                            Giao hàng
                                        </button>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'cancelled')} className="action-button delete">
                                            Hủy đơn
                                        </button>
                                    </>
                                )}

                                {order.status === 'shipping' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(order.orderId, 'completed')} className="action-button complete">
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
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminOrders;