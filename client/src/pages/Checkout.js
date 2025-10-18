import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        address: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const selected = JSON.parse(localStorage.getItem('selectedItems') || '[]');
        setCartItems(selected);

        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            setCustomerInfo({
                name: user.name || '',
                address: user.address || '',
                phone: user.phone || '',
            });
        }
    }, []);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            // Gửi đơn hàng lên server
            await axios.post('http://localhost:5000/api/orders', {
                userId: user ? user._id : null,
                customerInfo,
                items: cartItems,
                totalPrice,
                status: 'pending',
            });

            // Cập nhật lại giỏ hàng (chỉ xóa các sản phẩm đã đặt)
            const cartKey = user ? `cart_${user._id}` : 'cart';
            const fullCart = JSON.parse(localStorage.getItem('cartKey') || '[]');
            const remainingCart = fullCart.filter(
                item => !cartItems.some(selected => selected._id === item._id)
            );

            localStorage.setItem('cart', JSON.stringify(remainingCart));

            // Xóa danh sách sản phẩm đã chọn
            localStorage.removeItem('selectedItems');

            // Reset giao diện
            setSuccess(true);
            setCartItems([]);
            setCustomerInfo({ name: '', address: '', phone: '' });
        } catch (err) {
            console.error('Lỗi khi đặt hàng:', err);
            setError('Lỗi khi đặt hàng');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return <div className="checkout">Đặt hàng thành công!</div>;
    }

    if (cartItems.length === 0) {
        return <div className="checkout">Giỏ hàng trống</div>;
    }

    return (
        <div className="checkout">
            <h2>Thanh toán</h2>
            <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div>
                            <h3>{item.name}</h3>
                            <p>Giá: {item.price} VND</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3>
                Tổng cộng: {cartItems.reduce((total, item) => total + item.price, 0)} VND
            </h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Họ tên: </label>
                    <input
                        type="text"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Địa chỉ: </label>
                    <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Số điện thoại: </label>
                    <input
                        type="text"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
            </form>
        </div>
    );
}

export default Checkout;
