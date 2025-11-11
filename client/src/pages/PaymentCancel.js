// src/pages/PaymentCancel.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentCancel() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('pendingOrder');
        alert('Bạn đã hủy thanh toán QR. Giỏ hàng vẫn còn.');
        navigate('/cart');
    }, [navigate]);

    return <div>Đã hủy thanh toán...</div>;
}

export default PaymentCancel;