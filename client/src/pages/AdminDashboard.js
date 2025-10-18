import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        stock: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ bắt đầu đang tải
    const navigate = useNavigate();

    // ✅ Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user) {
            alert('Vui lòng đăng nhập để tiếp tục');
            navigate('/login');
            return;
        }

        if (user.role !== 'admin') {
            alert('Bạn không có quyền truy cập trang quản lý');
            navigate('/');
            return;
        }

        // ✅ Nếu hợp lệ, mới fetch sản phẩm
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data);
        } catch (err) {
            console.error(err);
            setError('Lỗi khi lấy danh sách sản phẩm');
        } finally {
            setLoading(false); // ✅ đảm bảo luôn tắt loading
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const headers = { 'user-id': user.userId };
            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, { headers });
                alert('Sửa sản phẩm thành công');
            } else {
                await axios.post('http://localhost:5000/api/products', formData, { headers });
                alert('Thêm sản phẩm thành công');
            }
            setFormData({ name: '', price: '', description: '', imageUrl: '', stock: '' });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl || '',
            stock: product.stock,
        });
        setEditingId(product._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        setLoading(true);
        try {
            const headers = { 'user-id': user.userId };
            await axios.delete(`http://localhost:5000/api/products/${id}`, { headers });
            alert('Xóa sản phẩm thành công');
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
            setLoading(false);
        }
    };

    // ✅ Giao diện hiển thị
    if (loading) return <div>Đang tải sản phẩm...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="admin-dashboard">
            <h2>Quản lý sản phẩm</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tên sản phẩm:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Giá:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Mô tả:</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>URL hình ảnh:</label>
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                    />
                </div>

                <div>
                    <label>Số lượng tồn kho:</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                </button>
            </form>

            <h3>Danh sách sản phẩm</h3>
            <div className="product-list">
                {products.length === 0 ? (
                    <p>Chưa có sản phẩm nào</p>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="product-item">
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} style={{ width: '100px' }} />
                            )}
                            <div>
                                <h4>{product.name}</h4>
                                <p>Giá: {product.price} VNĐ</p>
                                <p>{product.description}</p>
                                <p>Tồn kho: {product.stock}</p>
                                <button onClick={() => handleEdit(product)}>Sửa</button>
                                <button onClick={() => handleDelete(product._id)}>Xóa</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
