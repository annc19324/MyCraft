// AdminLayout.js
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/pages.css';
import { useAuth } from '../../hooks/useAuth';


function AdminLayout() {
    const location = useLocation();
    const { token, role, logout } = useAuth();
    const navigate = useNavigate();

    // KHÔNG navigate() ở đây nữa → ProtectedRoute đã xử lý
    if (!token || role !== 'admin') {
        return null; // ProtectedRoute sẽ redirect
    }

    return (
        <div className="page-wrapper page-wrapper-admin">
            <div className="admin-dashboard">
                <div className="sidebar">
                    <h3>Admin</h3>
                    <div className="sidebar-buttons">
                        <Link to="/admin"><button className={location.pathname === '/admin' ? 'active' : ''}>Tổng quan</button></Link>
                        <Link to="/admin/products"><button className={location.pathname.includes('/admin/products') ? 'active' : ''}>Quản lý sản phẩm</button></Link>
                        <Link to="/admin/orders"><button className={location.pathname.includes('/admin/orders') ? 'active' : ''}>Quản lý đơn hàng</button></Link>
                        <Link to="/admin/messages"><button className={location.pathname.includes('/admin/messages') ? 'active' : ''}>Chat</button></Link>
                        <Link to="/admin/users"><button className={location.pathname.includes('/admin/users') ? 'active' : ''}>Quản lý người dùng</button></Link>
                        <button onClick={() => {
                            logout();
                            navigate('/login', { replace: true });
                        }}>
                            Đăng xuất
                        </button>
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