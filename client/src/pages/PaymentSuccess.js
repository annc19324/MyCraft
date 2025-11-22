// src/pages/PaymentSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function PaymentSuccess() {
    const [status, setStatus] = useState('Đang xử lý...');
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const createOrderFromPending = async () => {
            const pending = localStorage.getItem('pendingOrder');
            if (!pending) {
                setStatus('Không tìm thấy đơn hàng tạm');
                setTimeout(() => navigate('/cart'), 2000);
                return;
            }

            if (!token) {
                setStatus('Chưa đăng nhập');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                const orderData = JSON.parse(pending);
                localStorage.removeItem('pendingOrder');

                const res = await api.post('/orders', {
                    items: orderData.items,
                    name: orderData.name,
                    phone: orderData.phone,
                    address: orderData.address,
                    paymentMethod: 'qr',
                    tempOrderId: orderData.tempOrderId
                });

                setStatus('Thanh toán thành công! Đơn hàng đã được tạo.');
                setTimeout(() => navigate('/orders'), 3000);
            } catch (err) {
                console.error('Lỗi tạo đơn:', err);
                setStatus('Lỗi tạo đơn: ' + (err.response?.data?.message || 'Server lỗi'));
                setTimeout(() => navigate('/cart'), 5000);
            }
        };

        createOrderFromPending();
    }, [navigate, token]);

    return (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
            <h2>Thanh toán QR</h2>
            <p>{status}</p>
        </div>
    );
}

export default PaymentSuccess;