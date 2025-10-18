import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                setError('Lỗi khi lấy danh sách sản phẩm');
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading)
        return <div>Đang tải ...</div>;
    if (error)
        return <div>{error}</div>

    return (
        <div className='product-list'>
            <h2> Danh sách sản phẩm </h2>
            <div
                style={{ display: 'flex', flexWrap: 'wrap' }}
            >
                {
                    products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default ProductList;






// import React from 'react';
// import ProductCard from '../components/ProductCard';

// const fakeProducts = [
//     { id: 1, name: 'Vòng tay thủ công', description: 'Vòng tay đan tay đẹp', price: 150000 },
//     { id: 2, name: 'Túi vải handmade', description: 'Túi vải thân thiện môi trường', price: 250000 },
//     { id: 3, name: 'Bình hoa gốm', description: 'Bình hoa gốm độc đáo', price: 350000 },
// ];

// function ProductList() {
//     return (
//         <div className="product-list">
//             <h2>Danh sách sản phẩm</h2>
//             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
//                 {fakeProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                 ))}
//             </div>
//         </div>
//     );
// }

