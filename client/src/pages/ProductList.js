import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // const user = JSON.parse(localStorage.getItem('user') || 'null');
    const { token, role, logout } = useAuth();

    useEffect(() => {
        // if (!user?.userId) {
        if (!token) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để xem sản phẩm' } });
            return;
        }

        let isMounted = true;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await api.get('/products', {
                    // headers: { 'user-id': user.userId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (isMounted) {
                    setProducts(response.data || []);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();
        return () => { isMounted = false; };
    }, [navigate, token]);

    const handleAddToCart = async (productId) => {
        // if (!user?.userId) {
        if (!token) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để thêm vào giỏ hàng' } });
            return;
        }
        try {
            await api.post(
                '/cart',
                { productId, quantity: 1 },
                // { headers: { 'user-id': user.userId } }
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đã thêm vào giỏ hàng!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    // const handleBuyNow = (productId) => {
    //     navigate('/checkout', { state: { selectedItems: [{ productId, quantity: 1 }] } });
    // };

    const handleBuyNow = (product) => {
        // if (!user?.userId) {
        if (!token) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để mua ngay' } });
            return;
        }
        navigate('/checkout', {
            state: {
                selectedItems: [{
                    productId: product._id.toString(),
                    quantity: 1
                }]
            }
        });
    };
    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    <Link to="/messages">Chat</Link>
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
                <div className="product-list-container">
                    <button onClick={() => navigate('/')} className="back-button">
                        Quay lại
                    </button>
                    <h2>Danh sách sản phẩm</h2>
                    {error && <p className="error">{error}</p>}
                    {loading && <p>Đang tải...</p>}
                    {!loading && products.length === 0 ? (
                        <p>Không có sản phẩm nào</p>
                    ) : (
                        <div className="product-grid">
                            {products.map((product) => (
                                <div key={product._id} className="product-card">
                                    <img
                                        src={product.imageUrl || 'https://place.dog/100/100'}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                    <div className="card-body">
                                        <div className="card-title">{product.name}</div>
                                        <div className="card-price">
                                            {product.price.toLocaleString()} VNĐ
                                        </div>
                                        <div className="product-actions">
                                            <Link
                                                to={`/product/${product._id}`}
                                                className="view-details-button"
                                            >
                                                Xem
                                            </Link>
                                            <button
                                                onClick={() => handleAddToCart(product._id)}
                                                disabled={product.stock === 0}
                                                className="add-to-cart-button"
                                            >
                                                Thêm vào giỏ
                                            </button>

                                            <button
                                                onClick={() => handleBuyNow(product)}
                                                disabled={product.stock === 0}
                                                className="buy-now-button"
                                            >
                                                Mua
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductList;