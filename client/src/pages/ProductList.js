import React from 'react';
import ProductCard from '../components/ProductCard';

const fakeProducts = [
    { id: 1, name: 'Vòng tay thủ công', description: 'Vòng tay đan tay đẹp', price: 150000 },
    { id: 2, name: 'Túi vải handmade', description: 'Túi vải thân thiện môi trường', price: 250000 },
    { id: 3, name: 'Bình hoa gốm', description: 'Bình hoa gốm độc đáo', price: 350000 },
];

function ProductList() {
    return (
        <div className="product-list">
            <h2>Danh sách sản phẩm</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {fakeProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default ProductList;