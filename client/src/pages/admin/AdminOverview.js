// src/pages/admin/AdminOverview.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function AdminOverview() {
    const [stats, setStats] = useState({
        totalProducts: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0,
        cancelledOrders: 0, totalRevenue: 0, todayRevenue: 0, lowStockProducts: 0,
        totalUsers: 0, activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token, role } = useAuth();

    const fetchStats = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoading(true);
        setError(null);
        try {
            const [productsRes, ordersRes, usersRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders/all'),
                api.get('/users/all')
            ]);

            const products = productsRes.data || [];
            const orders = ordersRes.data || [];
            const users = usersRes.data || [];

            const today = new Date(); today.setHours(0, 0, 0, 0);
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
                totalRevenue, todayRevenue, lowStockProducts: lowStock,
                totalUsers: users.length, activeUsers: usersWithOrders
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token, role]);

    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }
        fetchStats();
    }, [fetchStats, navigate]);

    if (!token || role !== 'admin') return null;

    return (
        <div className="admin-section">
            <h2>Tổng quan hệ thống</h2>
            {error && <p className="error">{error}</p>}
            {loading ? <p>Đang tải dữ liệu...</p> : (
                <div className="overview-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Tổng người dùng</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.activeUsers}</div>
                        <div className="stat-label">Người dùng đã mua</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalProducts}</div>
                        <div className="stat-label">Tổng sản phẩm</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalOrders}</div>
                        <div className="stat-label">Tổng đơn hàng</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.pendingOrders}</div>
                        <div className="stat-label">Đơn chờ xử lý</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.todayRevenue.toLocaleString()} ₫</div>
                        <div className="stat-label">Doanh thu hôm nay</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalRevenue.toLocaleString()} ₫</div>
                        <div className="stat-label">Tổng doanh thu</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.lowStockProducts}</div>
                        <div className="stat-label">Sản phẩm sắp hết</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOverview;