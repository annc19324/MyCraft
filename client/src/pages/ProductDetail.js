import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Sản phẩm không tồn tại');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);


  if (loading)
    return <div>Đang tải...</div>

  if (error)
    return <h2>{error}</h2>

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