// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user?.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để xem giỏ hàng' } });
            return;
        }

        let isMounted = true;

        const fetchCart = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/cart', {
                    headers: { 'user-id': user.userId },
                });
                if (isMounted) {
                    const items = response.data.items || [];
                    setCartItems(items);
                    setSelectedItems(items.map(item => item.productId.toString()));
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || 'Lỗi khi lấy giỏ hàng');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCart();
        return () => { isMounted = false; };
    }, [navigate, user?.userId]);

    const handleQuantityChange = async (productId, quantity) => {
        const q = Math.max(1, parseInt(quantity) || 1);
        try {
            await axios.put(
                'http://localhost:5000/api/cart',
                {
                    productId: productId.toString(),
                    quantity: q
                },
                { headers: { 'user-id': user.userId } }
            );
            setCartItems(prev => prev.map(item =>
                item.productId === productId ? { ...item, quantity: q } : item
            ));
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật số lượng');
        }
    };

    const handleSelectItem = (productId) => {
        const idStr = productId.toString();
        setSelectedItems(prev =>
            prev.includes(idStr)
                ? prev.filter(id => id !== idStr)
                : [...prev, idStr]
        );
    };

    const totalPrice = cartItems
        .filter(item => selectedItems.includes(item.productId))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            return;
        }
        const formattedSelectedItems = selectedItems.map(id => ({
            productId: id.toString(),
            quantity: cartItems.find(item => item.productId === id)?.quantity || 1
        }));
        navigate('/checkout', { state: { selectedItems: formattedSelectedItems } });
    };

    const handleRemoveItem = async (productId) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/cart/${productId.toString()}`,
                { headers: { 'user-id': user.userId } },
            );

            setCartItems(prev => prev.filter(item => item.productId !== productId));
            setSelectedItems(prev => prev.filter(id => id !== productId.toString()));
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}>Đăng xuất</button>
                </div>
            </nav>

            <div className="page-content">
                <div className="cart-container">
                    <h2>Giỏ hàng</h2>
                    {error && <p className="error">{error}</p>}
                    {loading && <p>Đang tải...</p>}
                    {!loading && cartItems.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ textAlign: 'center' }}>chưa có sản phẩm nào trong giỏ hàng, hãy trở lại trang chủ để thêm vào giỏ hàng</p>
                            <button style={{ width: '150px', marginTop: '20px' }} onClick={() => navigate('/')} className="back-button-in-cart">
                                Trang chủ
                            </button>
                        </div>

                    ) : (
                        <div>
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>Chọn</th>
                                        <th>Hình ảnh</th>
                                        <th>Sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Giá</th>
                                        <th>Tổng</th>
                                        <th>xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.productId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.productId)}
                                                    onChange={() => handleSelectItem(item.productId)}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={item.imageUrl || 'https://place.dog/100/100'}
                                                    alt={item.name}
                                                    className="cart-image"
                                                />
                                            </td>
                                            <td>{item.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="quantity-input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                                    min="1"
                                                />
                                            </td>
                                            <td>{item.price.toLocaleString()} VNĐ</td>
                                            <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                            <td>
                                                <button
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="action-button delete"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p>Tổng tiền: {totalPrice.toLocaleString()} VNĐ</p>
                            <button onClick={handleCheckout} className="checkout-button">
                                Thanh toán
                            </button>
                            <button onClick={() => navigate('/products')} className="back-button-in-cart">
                                Quay lại
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Cart;