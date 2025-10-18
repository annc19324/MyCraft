import React from 'react';
import { useParams } from 'react-router-dom';

const fakeProducts = [
  { id: 1, name: 'Vòng tay thủ công', description: 'Vòng tay đan tay đẹp', price: 150000 },
  { id: 2, name: 'Túi vải handmade', description: 'Túi vải thân thiện môi trường', price: 250000 },
  { id: 3, name: 'Bình hoa gốm', description: 'Bình hoa gốm độc đáo', price: 350000 },
];

function ProductDetail() {
  const { id } = useParams();
  const product = fakeProducts.find((p) => p.id === parseInt(id));

  if (!product) {
    return <h2>Sản phẩm không tồn tại</h2>;
  }

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Giá: {product.price} VNĐ</p>
      <button>Thêm vào giỏ hàng</button>
    </div>
  );
}

export default ProductDetail;