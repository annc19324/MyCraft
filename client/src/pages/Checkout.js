import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        address: '',
        phone: '',
    })
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            setError('Vui long dien day du thong tin');
            return;
        }
        setLoading(true);
        try {
            const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
            await axios.post('http://localhost:5000/api/orders', {
                customerInfo,
                items: cartItems,
                totalPrice,
                status: 'pending',
            });
            setSuccess(true);
            setCartItems([]);
            localStorage.setItem('cart', '[]');
            setCustomerInfo({ name: '', address: '', phone: '' });
        } catch (err) {
            setError('Loi khi dat hang')
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className='checkout'>
                dat hang thanh cong
            </div>
        )

    }

    if (cartItems.length === 0) {
        return (
            <div className='checkout'>
                Gio hang trong
            </div>
        )

    }

    return (
        <div className='checkout'>
            <h2>Thanh toan</h2>
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
            <h3>
                Tong cong: {cartItems.reduce((total, item) => total + item.price, 0)} VND
            </h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Ho ten: </label>
                    <input
                        type='text'
                        name='name'
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Dia Chi:</label>
                    <input
                        type='text'
                        name='address'
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>So dien thoai: </label>
                    <input
                        type='text'
                        name='phone'
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type='submit' disabled={loading}
                >
                    {loading ? 'Dang xu ly...' : 'dat hang'}
                </button>
            </form>

        </div>
    )
}
export default Checkout;