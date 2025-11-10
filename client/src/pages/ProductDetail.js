// src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                if (isMounted) {
                    setProduct(response.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || 'Lỗi khi lấy chi tiết sản phẩm');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProduct();
        return () => { isMounted = false; };
    }, [id]);

    const handleAddToCart = async () => {
        if (!user?.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để thêm vào giỏ hàng' } });
            return;
        }
        try {
            await axios.post(
                'http://localhost:5000/api/cart',
                { productId: id, quantity: parseInt(quantity) },
                { headers: { 'user-id': user.userId } }
            );
            alert('Đã thêm vào giỏ hàng!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    const handleBuyNow = () => {
        if (!user?.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để mua ngay' } });
            return;
        }
        // navigate('/checkout', { state: { selectedItems: [{ productId: id, quantity: parseInt(quantity) }] } });
        // Trong handleBuyNow
        navigate('/checkout', {
            state: {
                selectedItems: [{
                    productId: product._id.toString(), // ĐẢM BẢO STRING
                    quantity: 1
                }]
            }
        });
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!product) return <p>Không tìm thấy sản phẩm</p>;

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    {user?.userId ? (
                        <>
                            <Link to="/products">Sản phẩm</Link>
                            <Link to="/cart">Giỏ hàng</Link>
                            <button onClick={() => {
                                localStorage.removeItem('user');
                                navigate('/login');
                            }}>Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/register">Đăng ký</Link>
                        </>
                    )}
                </div>
            </nav>

            <div className="page-content">
                <div className="product-detail-container">
                    <h2>{product.name}</h2>

                    <div className="product-detail-content">
                        <img
                            src={product.imageUrl || 'https://place.dog/100/100'}
                            alt={product.name}
                            className="product-image"
                        />
                        <div className="product-info">
                            <p><strong>Mô tả:</strong> {product.description}</p>
                            <p><strong>Giá:</strong> {product.price.toLocaleString()} VNĐ</p>
                            <p><strong>Tồn kho:</strong> {product.stock}</p>

                            <div className="quantity-selector">
                                <label>Số lượng:</label>
                                <input
                                    type="number"
                                    className="quantity-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max={product.stock}
                                />
                            </div>

                            {/* CÙNG HÀNG: Quay lại + 2 nút */}
                            <div className="product-actions-row">

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="add-to-cart-button"
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="buy-now-button"
                                >
                                    Mua ngay
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="back-button"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;