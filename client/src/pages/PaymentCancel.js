// src/pages/PaymentCancel.js – HOÀN HẢO (HỖ TRỢ CẢ WEBHOOK + LUỒNG CŨ)
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // 1. XÓA ĐƠN TẠM (LUỒNG CŨ)
        localStorage.removeItem('pendingOrder');

        // 2. XỬ LÝ WEBHOOK (LUỒNG MỚI)
        const tempId = searchParams.get('tempId');
        const orderId = searchParams.get('orderId');

        let message = 'Bạn đã hủy thanh toán QR.';

        if (tempId) {
            message = 'Đơn tạm đã bị hủy. Vui lòng thử lại.';
        } else if (orderId) {
            message = `Đơn ${orderId} đã bị hủy thanh toán.`;
        }

        // 3. THÔNG BÁO + CHUYỂN HƯỚNG
        alert(message + ' Giỏ hàng vẫn còn.');
        navigate('/cart');
    }, [navigate, searchParams]);

    return (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
            <h2>Thanh toán bị hủy</h2>
            <p>Đang chuyển về giỏ hàng...</p>
        </div>
    );
}

export default PaymentCancel;