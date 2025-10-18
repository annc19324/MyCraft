import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Cart() {
    const [cartItem, setCartItem] = useState([]);

    useEffect(() => {
        // lấy giỏ hàng từ localstorage 
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItem(savedCart);
    }, []);

    // xxóa sp khỏi giỏ
    const removeFromCart = (productId) => {
        const upadtedCart = cartItem.filter((item) => item.productId !== productId);
        setCartItem(upadtedCart);
        localStorage.setItem('cart', JSON.stringify(upadtedCart));
    }

    //tinh tong gia
    const totalPrice = cartItem.reduce((total, item) => total + item.price, 0);

    if (cartItem.length === 0) {
        return <div className='cart'>Giỏ hàng trống</div>
    }

    return (
        <div className='cart'>
            <h2>Giỏ hàng</h2>
            <div className='cart-items'>
                {cartItem.map((item) => (
                    <div key={item._id} className='cart-item'>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '100px', height: '100px' }}
                        />

                        <div>
                            <h3>{item.name}</h3>
                            <p>Giá: {item.price} VNĐ</p>
                            <button onClick={() => removeFromCart(item.productId)}>Xóa</button>
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