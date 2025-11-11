// src/pages/PaymentSuccess.js
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tempId = searchParams.get('tempId');

    useEffect(() => {
        const createOrder = async () => {
            const pending = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
            if (!pending.tempOrderId || pending.tempOrderId !== tempId) {
                navigate('/orders');
                return;
            }

            try {
                await axios.post('http://localhost:5000/api/orders', {
                    ...pending,
                    paymentMethod: 'qr',
                    paymentStatus: 'paid',
                    status: 'completed'
                }, { headers: { 'user-id': JSON.parse(localStorage.getItem('user')).userId } });

                localStorage.removeItem('pendingOrder');
                localStorage.removeItem('cart'); // Xóa giỏ
                alert('Thanh toán QR thành công! Đơn hàng đã được tạo.');
                navigate('/orders');
            } catch (err) {
                alert('Lỗi tạo đơn');
                navigate('/cart');
            }
        };

        createOrder();
    }, [tempId, navigate]);

    return <div>Đang xử lý thanh toán...</div>;
}

export default PaymentSuccess;