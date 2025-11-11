import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import './App.css';
import Order from './pages/Order';
import AdminLayout from './pages/admin/AdminLayout'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOverview from './pages/admin/AdminOverview'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<ProtectedRoute component={ProductList} role="user" />} />
                <Route path="/cart" element={<ProtectedRoute component={Cart} role="user" />} />
                <Route path="/checkout" element={<ProtectedRoute component={Checkout} role="user" />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/" element={<Home />} />
                <Route path="/orders" element={<ProtectedRoute component={Order} role="user" />} />
                <Route path="/admin" element={<ProtectedRoute component={AdminLayout} role="admin" />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>
            </Routes>
        </Router>
    );
}

function ProtectedRoute({ component: Component, role }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || !user.userId) {               // <-- kiểm tra userId
            navigate('/login', { state: { message: 'Vui lòng đăng nhập' } });
        } else if (role === 'admin' && user.role !== 'admin') {
            navigate('/products', { state: { message: 'Chỉ admin mới có quyền truy cập' } });
        } else if (role === 'user' && user.role === 'admin') {
            navigate('/admin');
        }
    }, [navigate, user, role]);

    // Render chỉ khi đủ điều kiện
    if (!user || !user.userId) return null;
    if (role && user.role !== role) return null;
    return <Component />;
}

export default App;