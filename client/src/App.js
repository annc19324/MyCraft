import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<ProtectedRoute component={AdminDashboard} role="admin" />} />
                <Route path="/products" element={<ProtectedRoute component={ProductList} role="user" />} />
                <Route path="/cart" element={<ProtectedRoute component={Cart} role="user" />} />
                <Route path="/checkout" element={<ProtectedRoute component={Checkout} role="user" />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

function ProtectedRoute({ component: Component, role }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập' } });
        } else if (role === 'admin' && user.role !== 'admin') {
            navigate('/products', { state: { message: 'Chỉ admin mới có quyền truy cập' } });
        } else if (role === 'user' && user.role === 'admin') {
            navigate('/admin');
        }
    }, [navigate, user?.userId, role]);

    return user && user.userId && (role === 'user' || user.role === role) ? <Component /> : null;
}

export default App;