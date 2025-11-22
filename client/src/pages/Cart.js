// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    useEffect(() => {
        if (token === null) return; // Chưa load xong → không làm gì
        if (!token) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để xem giỏ hàng' } });
            return;
        }

        let isMounted = true;

        const fetchCart = async () => {
            setLoading(true);
            try {
                const response = await api.get('/cart');
                if (isMounted) {
                    const items = response.data.items || [];
                    setCartItems(items);
                    setSelectedItems(items.map(item => item.productId.toString()));
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    const msg = err.response?.data?.message || 'Lỗi khi lấy giỏ hàng';
                    setError(msg);
                    if (err.response?.status === 401) logout();
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCart();
        return () => { isMounted = false; };
    }, [navigate, token]); // XÓA logout khỏi dependency

    // SỬA: Thêm lại hàm handleQuantityChange
    const handleQuantityChange = async (productId, quantity) => {
        const q = Math.max(1, parseInt(quantity) || 1);
        try {
            await api.put('/cart', { productId: productId.toString(), quantity: q });
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
        .filter(item => selectedItems.includes(item.productId.toString()))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn ít nhất 1 sản phẩm');
            return;
        }

        const selectedFullItems = cartItems
            .filter(item => selectedItems.includes(item.productId.toString()))
            .map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                quantity: item.quantity
            }));

        navigate('/checkout', {
            state: { selectedItems: selectedFullItems, fromCart: true }
        });
    };

    const handleRemoveItem = async (productId) => {
        try {
            await api.delete(`/cart/${productId.toString()}`);
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
                    <Link to="/profile">Cá nhân</Link>
                    <button onClick={() => {
                        logout();
                        navigate('/login', { replace: true });
                    }}>
                        Đăng xuất
                    </button>
                </div>
            </nav>

            <div className="page-content">
                <div className="cart-container">
                    <h2>Giỏ hàng</h2>
                    {error && <p className="error">{error}</p>}
                    {loading && <p>Đang tải...</p>}
                    {!loading && cartItems.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{ textAlign: 'center' }}>Chưa có sản phẩm nào trong giỏ hàng</p>
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
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.productId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.productId.toString())}
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