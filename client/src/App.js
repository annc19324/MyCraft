// client/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Order from './pages/Order';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';

import Messages from './pages/Messages';
import AdminMessages from './pages/admin/AdminMessages';

// demo web an toan
import UploadDemo from './pages/UploadDemo';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />


                <Route path="/products" element={<ProtectedRoute role="user"><ProductList /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute role="user"><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute role="user"><Checkout /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute role="user"><Order /></ProtectedRoute>} />

                {/* demo web an toan */}
                <Route path="/upload-demo" element={<UploadDemo />} />

                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>

                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                <Route path="/messages" element={<ProtectedRoute role="user"><Messages /></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminMessages /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

function ProtectedRoute({ children, role: requiredRole }) {
    const { token, role: userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
        } else if (requiredRole && userRole !== requiredRole) {
            navigate(userRole === 'admin' ? '/admin' : '/', { replace: true });
        }
    }, [token, userRole, requiredRole, navigate]);

    if (!token || (requiredRole && userRole !== requiredRole)) {
        return null;
    }

    return children;
}

export default App;