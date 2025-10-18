import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        // lấy giỏ hàng từ localstorage 
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, []);

    // xxóa sp khỏi giỏ
    const removeFromCart = (_id) => {
        const upadtedCart = cartItems.filter((item) => item._id !== _id);
        setCartItems(upadtedCart);
        localStorage.setItem('cart', JSON.stringify(upadtedCart));
    }

    //tinh tong gia
    const totalPrice = cartItems
        .filter((item) => selectedItems.includes(item._id))
        .reduce((total, item) => total + item.price, 0);

    if (cartItems.length === 0) {
        return <div className='cart'>Giỏ hàng trống</div>
    }

    //luu cac sp vao localStorage trc khi thanh toan
    const handleCheckout = () => {
        const selected = cartItems.filter((item) =>
            selectedItems.includes(item._id));
        localStorage.setItem('selectedItems', JSON.stringify(selected));
    }

    const toggleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };
    return (
        <div className='cart'>
            <h2>Giỏ hàng</h2>
            <div className='cart-items'>
                {cartItems.map((item) => (
                    <div key={item._id} className='cart-item'>
                        <input
                            type='checkbox'
                            checked={selectedItems.includes(item._id)}
                            onChange={() => toggleSelect(item._id)}
                        />
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '150px', height: '150px', borderRadius: '10px', marginBottom: '10px' }}
                        />

                        <div>
                            <h3>{item.name}</h3>
                            <p>Giá: {item.price} VNĐ</p>
                            <button onClick={() => removeFromCart(item._id)}>Xóa</button>
                        </div>
                    </div>
                ))}

            </div>
            <h3>Tổng cộng: {totalPrice} VNĐ</h3>
            <Link to="/checkout" onClick={handleCheckout}>
                Thanh toán
            </Link>
        </div>
    );
}

export default Cart;