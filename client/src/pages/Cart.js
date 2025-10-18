import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        // lấy giỏ hàng từ localstorage 
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, []);

    // xxóa sp khỏi giỏ
    const removeFromCart = (productId) => {
        const upadtedCart = cartItems.filter((item) => item.productId !== productId);
        setCartItems(upadtedCart);
        localStorage.setItem('cart', JSON.stringify(upadtedCart));
    }

    //tinh tong gia
    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    if (cartItems.length === 0) {
        return <div className='cart'>Giỏ hàng trống</div>
    }

    return (
        <div className='cart'>
            <h2>Giỏ hàng</h2>
            <div className='cart-items'>
                {cartItems.map((item, index) => (
                    <div key={item.productId || index} className="cart-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div>
                            <h3>{item.name}</h3>
                            <p>Giá: {item.price} VND</p>
                        </div>
                    </div>
                ))}

            </div>
            <h3>Tổng cộng: {totalPrice} VNĐ</h3>
            <Link to="/checkout">Thanh toán</Link>
        </div>
    );
}

export default Cart;