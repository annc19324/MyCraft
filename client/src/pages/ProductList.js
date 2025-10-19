import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ProductList.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để xem sản phẩm' } });
            return;
        }

        let isMounted = true;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                console.log('Sending request with user-id:', user.userId);
                const response = await axios.get('http://localhost:5000/api/products', {
                    headers: { 'user-id': user.userId },
                });
                console.log('Products Response:', response.data);
                if (isMounted) {
                    setProducts(response.data || []);
                    setQuantities(response.data.reduce((acc, product) => ({
                        ...acc,
                        [product._id]: 1
                    }), {}));
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
                    console.error('Fetch products error:', err.response?.data || err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [navigate, user?.userId]);

    const handleQuantityChange = (productId, value) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, parseInt(value) || 1)
        }));
    };

    const handleAddToCart = async (productId) => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để thêm vào giỏ hàng' } });
            return;
        }

        try {
            console.log('Adding to cart with user-id:', user.userId);
            await axios.post(
                'http://localhost:5000/api/cart',
                { productId, quantity: quantities[productId] || 1 },
                { headers: { 'user-id': user.userId } }
            );
            alert('Đã thêm vào giỏ hàng!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
            console.error('Add to cart error:', err.response?.data || err.message);
        }
    };

    const handleBuyNow = (productId) => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để mua ngay' } });
            return;
        }
        navigate('/checkout', { state: { selectedItems: [{ productId, quantity: quantities[productId] || 1 }] } });
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <div className="product-list-container">
            <nav className="navbar">
                <Link to="/products">Sản phẩm</Link>
                <Link to="/cart">Giỏ hàng</Link>
                <button onClick={handleLogout}>Đăng xuất</button>
            </nav>
            <button onClick={() => navigate('/')} className="back-button">Quay lại</button>
            <h2>Danh sách sản phẩm</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang tải...</p>}
            {!loading && products.length === 0 ? (
                <p>Không có sản phẩm nào</p>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <img src={product.imageUrl || 'https://place.dog/100/100'} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                            <p>Tồn kho: {product.stock}</p>
                            <div className="quantity-selector">
                                <label>Số lượng:</label>
                                <input
                                    type="number"
                                    className="quantity-input"
                                    value={quantities[product._id] || 1}
                                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                                    min="1"
                                    max={product.stock}
                                />
                            </div>
                            <div className="product-actions">
                                <Link to={`/product/${product._id}`} className="view-details-button">
                                    Xem chi tiết
                                </Link>
                                <button
                                    onClick={() => handleAddToCart(product._id)}
                                    disabled={product.stock === 0}
                                    className="add-to-cart-button"
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <button
                                    onClick={() => handleBuyNow(product._id)}
                                    disabled={product.stock === 0}
                                    className="buy-now-button"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductList;