// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// function Header() {
//     const user = JSON.parse(localStorage.getItem('user') || 'null');
//     const navigate = useNavigate();
//     const handleLogout = () => {
//         localStorage.removeItem('user');
//         navigate('/');
//     };
//     return (
//         <header>
//             <h1>MyCraft</h1>
//             <nav>
//                 <Link to="/">Trang chủ</Link>
//                 <Link to="/products" style={{ marginLeft: '1rem' }}>Sản phẩm</Link>
//                 <Link to="/cart" style={{ marginLeft: '1rem' }}>Giỏ hàng</Link>
//                 {user && user.role === 'admin' && (
//                     <Link to="/admin" style={{ marginLeft: '1rem' }}>Quản lý</Link>
//                 )}
//                 {user ? (
//                     <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
//                         Đăng xuất
//                     </button>
//                 ) : (
//                     <Link to="/login" style={{ marginLeft: '1rem' }}>
//                         Đăng nhập
//                     </Link>
//                 )}
//             </nav>
//         </header>
//     );
// }

// export default Header;