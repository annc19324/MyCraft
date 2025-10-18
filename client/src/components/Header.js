import React from 'react';

function Header() {
    return (
        <header>
            <h1>MyCraft</h1>
            <nav>
                <a href="/">Trang chủ</a>
                <a href="/products" style={{ marginLeft: '1rem' }}>Sản phẩm</a>
                <a href="/cart" style={{ marginLeft: '1rem' }}>Giỏ hàng</a>
            </nav>
        </header>
    );
}

export default Header;