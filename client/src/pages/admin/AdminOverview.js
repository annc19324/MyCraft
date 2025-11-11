// src/pages/admin/AdminOverview.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminOverview() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        lowStockProducts: 0,
        totalUsers: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.userId;
    const role = user?.role;

    const fetchStats = useCallback(async () => {
        if (!userId || role !== 'admin') return;
        setLoading(true);
        setError(null);
        try {
            const headers = { 'user-id': userId };

            const [productsRes, ordersRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products', { headers }),
                axios.get('http://localhost:5000/api/orders/all', { headers }),
                axios.get('http://localhost:5000/api/users/all', { headers })
            ]);

            const products = productsRes.data || [];
            const orders = ordersRes.data || [];
            const users = usersRes.data || [];

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString();

            const completedOrders = orders.filter(o => o.status === 'completed');
            const todayRevenue = completedOrders
                .filter(o => new Date(o.createdAt) >= today)
                .reduce((sum, o) => sum + o.total, 0);

            const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

            const lowStock = products.filter(p => p.stock < 10).length;

            const usersWithOrders = new Set(orders.map(o => o.userId)).size;

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                completedOrders: completedOrders.length,
                cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
                totalRevenue,
                todayRevenue,
                lowStockProducts: lowStock,
                totalUsers: users.length,
                activeUsers: usersWithOrders
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
            console.error('Lỗi fetch stats:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, role]);

    useEffect(() => {
        if (!userId || role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }
        fetchStats();
    }, [fetchStats, navigate]);

    if (!userId || role !== 'admin') return null;

    return (
        <div className="admin-section">
            <h2>Tổng quan hệ thống</h2>
            {error && <p className="error">{error}</p>}

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className="overview-grid">
                    {/* Tổng người dùng */}
                    <div className="stat-card">
                        <div className="stat-icon purple">People</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Tổng người dùng</div>
                    </div>
                    {/* Người dùng hoạt động */}
                    <div className="stat-card">
                        <div className="stat-icon teal">Checkmark</div>
                        <div className="stat-value">{stats.activeUsers}</div>
                        <div className="stat-label">Người dùng đã mua</div>
                    </div>

                    {/* Tổng sản phẩm */}
                    <div className="stat-card">
                        <div className="stat-icon blue">Box</div>
                        <div className="stat-value">{stats.totalProducts}</div>
                        <div className="stat-label">Tổng sản phẩm</div>
                    </div>

                    {/* Tổng đơn hàng */}
                    <div className="stat-card">
                        <div className="stat-icon green">Shopping Cart</div>
                        <div className="stat-value">{stats.totalOrders}</div>
                        <div className="stat-label">Tổng đơn hàng</div>
                    </div>

                    {/* Đơn chờ xử lý */}
                    <div className="stat-card">
                        <div className="stat-icon orange">Clock</div>
                        <div className="stat-value">{stats.pendingOrders}</div>
                        <div className="stat-label">Đơn chờ xử lý</div>
                    </div>

                    {/* Doanh thu hôm nay */}
                    <div className="stat-card">
                        <div className="stat-icon purple">Money</div>
                        <div className="stat-value">{stats.todayRevenue.toLocaleString()} VNĐ</div>
                        <div className="stat-label">Doanh thu hôm nay</div>
                    </div>

                    {/* Tổng doanh thu */}
                    <div className="stat-card large">
                        <div className="stat-icon gold">Trophy</div>
                        <div className="stat-value">{stats.totalRevenue.toLocaleString()} VNĐ</div>
                        <div className="stat-label">Tổng doanh thu</div>
                    </div>

                    {/* Sản phẩm sắp hết */}
                    <div className="stat-card">
                        <div className="stat-icon red">Alert</div>
                        <div className="stat-value">{stats.lowStockProducts}</div>
                        <div className="stat-label">Sản phẩm sắp hết</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOverview;