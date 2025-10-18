import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`}>
                <h3 style={{ textDecoration: 'none', color: 'black' }}>{product.name}</h3>

            </Link>
            <p>{product.description}</p>
            <p>Giá: {product.price} VNĐ</p>
        </div >
    );
}

export default ProductCard;