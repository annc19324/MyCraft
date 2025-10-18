import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    return (
        <div className="product-card">
            <Link
                style={{ textDecoration: 'none', color: 'red' }}
                to={`/products/${product._id}`}>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '150px', borderRadius: '10px', marginBottom: '10px' }}
                />
                <h3 >
                    {product.name}
                </h3>
            </Link>
            <p>{product.description}</p>
            <p>Giá: {product.price.toLocaleString()} VNĐ</p>
        </div >
    );
}

export default ProductCard;