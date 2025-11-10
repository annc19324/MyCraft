// src/pages/admin/AdminLayout.js
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../../assets/styles/pages.css';

function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    return (
        <div className="page-wrapper">
            <div className="admin-dashboard">
                <div className="sidebar">
                    <h3>Admin</h3>
                    <div className="sidebar-buttons">
                        <Link to="/admin" className="button-link">
                            <button className={location.pathname === '/admin' ? 'active' : ''}>
                                Tổng quan
                            </button>
                        </Link>
                        <Link to="/admin/products" className="button-link">
                            <button className={location.pathname.includes('/admin/products') ? 'active' : ''}>
                                Quản lý sản phẩm
                            </button>
                        </Link>
                        <button onClick={() => {
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}>Đăng xuất</button>
                    </div>
                </div>

                <div className="page-content">
                    <div className="main-content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;