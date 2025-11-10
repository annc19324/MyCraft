// src/pages/admin/AdminOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5000/api/orders/all', {
                    headers: { 'user-id': 'admin1', 'role': 'admin' }
                });
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllOrders();
    }, []);

    return (
        <div className="admin-section">
            <h2>Quản lý đơn hàng</h2>
            {loading ? <p>Đang tải...</p> : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.orderId} className="order-card">
                            <p><strong>{order.orderId}</strong> - {order.userId}</p>
                            <p>Trạng thái: <span className={`status ${order.status}`}>{order.status}</span></p>
                            <p>Tổng: {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} VNĐ</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminOrders;