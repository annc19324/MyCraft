// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function ProductCard({ product }) {
//     const navigate = useNavigate();
//     const user = JSON.parse(localStorage.getItem('user') || 'null');

//     const addToCart = async () => {
//         if (!user || !user.userId) {
//             navigate('/login', { state: { message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' } });
//             return;
//         }

//         if (!product || product.stock <= 0) {
//             alert('Sản phẩm hiện không có sẵn trong kho');
//             return;
//         }

//         try {
//             await axios.post(
//                 'http://localhost:5000/api/cart/add',
//                 { productId: product._id, quantity: 1 },
//                 { headers: { 'user-id': user.userId } }
//             );
//             alert('Đã thêm vào giỏ hàng');
//         } catch (err) {
//             alert(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
//         }
//     };

//     const handleBuyNow = () => {
//         if (!product || product.stock <= 0) {
//             alert('Sản phẩm hiện không có sẵn trong kho');
//             return;
//         }
//         localStorage.setItem('selectedItems', JSON.stringify([{ ...product, quantity: 1 }]));
//         navigate('/checkout');
//     };

//     const handleViewDetails = () => {
//         navigate(`/products/${product._id}`);
//     };

//     return (
//         <div className="product-card">
//             <img
//                 src={product.imageUrl}
//                 alt={product.name}
//                 style={{ width: '150px', borderRadius: '10px', marginBottom: '10px' }}
//             />
//             <h3>{product.name}</h3>
//             <p>Giá: {product.price.toLocaleString()} VNĐ</p>
//             <p>Tồn kho: {product.stock}</p>
//             <button onClick={addToCart}>Thêm vào giỏ hàng</button>
//             <button onClick={handleBuyNow}>Mua ngay</button>
//             <button onClick={handleViewDetails}>Xem chi tiết</button>
//         </div>
//     );
// }

// export default ProductCard;

