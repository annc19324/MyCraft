import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [editProductId, setEditProductId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const user = useMemo(() => {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        console.log('User from localStorage:', userData);
        return userData;
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'admin' || !user.userId) {
            navigate('/login', { state: { message: 'Chỉ admin mới có quyền truy cập' } });
            return;
        }

        if (activeTab === 'products') {
            const fetchProducts = async () => {
                setLoading(true);
                try {
                    console.log('Fetching products with headers:', { 'user-id': user.userId, 'role': user.role });
                    const response = await axios.get('http://localhost:5000/api/products', {
                        headers: { 'user-id': user.userId, 'role': user.role },
                    });
                    console.log('Products Response:', response.data);
                    setProducts(response.data || []);
                    setError(null);
                } catch (err) {
                    setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
                    console.error('Fetch products error:', err.response?.data || err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [navigate, user, activeTab]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);
                console.log('Uploading image with headers:', { 'user-id': user.userId, 'role': user.role });
                const uploadResponse = await axios.post('http://localhost:5000/api/upload', uploadData, {
                    headers: {
                        'user-id': user.userId,
                        'role': user.role,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imageUrl = uploadResponse.data.imageUrl;
                console.log('Upload response:', uploadResponse.data);
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                imageUrl: imageUrl || 'https://place.dog/100/100',
            };
            console.log('Adding product:', productData);

            const response = await axios.post('http://localhost:5000/api/products', productData, {
                headers: { 'user-id': user.userId, 'role': user.role },
            });
            setProducts([...products, response.data]);
            setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
            setImageFile(null);
            alert('Thêm sản phẩm thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm sản phẩm');
            console.error('Add product error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditProductId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            imageUrl: product.imageUrl,
        });
        setImageFile(null);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!window.confirm('Bạn có chắc muốn cập nhật sản phẩm này?')) return;
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);
                console.log('Uploading image for update:', { 'user-id': user.userId, 'role': user.role });
                const uploadResponse = await axios.post('http://localhost:5000/api/upload', uploadData, {
                    headers: {
                        'user-id': user.userId,
                        'role': user.role,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imageUrl = uploadResponse.data.imageUrl;
                console.log('Upload response:', uploadResponse.data);
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                imageUrl: imageUrl || formData.imageUrl,
            };
            console.log('Updating product:', productData);

            const response = await axios.put(
                `http://localhost:5000/api/products/${editProductId}`,
                productData,
                { headers: { 'user-id': user.userId, 'role': user.role } }
            );
            setProducts(products.map((p) => (p._id === editProductId ? response.data : p)));
            setEditProductId(null);
            setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
            setImageFile(null);
            alert('Cập nhật sản phẩm thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
            console.error('Update product error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            console.log('Deleting product:', id);
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { 'user-id': user.userId, 'role': user.role },
            });
            setProducts(products.filter((p) => p._id !== id));
            alert('Xóa sản phẩm thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
            console.error('Delete product error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    if (!user) return null;

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h3>Quản lý Admin</h3>
                <ul>
                    <li>
                        <button
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            Tổng quan
                        </button>
                    </li>
                    <li>
                        <button
                            className={activeTab === 'products' ? 'active' : ''}
                            onClick={() => setActiveTab('products')}
                        >
                            Quản lý sản phẩm
                        </button>
                    </li>
                    <li>
                        <button onClick={handleLogout}>Đăng xuất</button>
                    </li>
                </ul>
            </div>
            <div className="main-content">
                {activeTab === 'overview' && (
                    <div className="overview">
                        <h2>Tổng quan</h2>
                        <p>Số lượng sản phẩm: {products.length}</p>
                        {/* Có thể thêm thông tin khác như số đơn hàng, người dùng sau này */}
                    </div>
                )}
                {activeTab === 'products' && (
                    <div className="products-section">
                        <h2>Quản lý sản phẩm</h2>
                        {error && <p className="error">{error}</p>}
                        {loading && <p>Đang tải...</p>}

                        <div className="product-form-container">
                            <h3>{editProductId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</h3>
                            <form onSubmit={editProductId ? handleUpdateProduct : handleAddProduct} className="product-form">
                                <div className="form-group">
                                    <label>Tên sản phẩm:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả:</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giá (VNĐ):</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tồn kho:</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>URL hình ảnh:</label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tải lên hình ảnh:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" disabled={loading} className="submit-button">
                                        {loading ? 'Đang xử lý...' : editProductId ? 'Cập nhật' : 'Thêm'}
                                    </button>
                                    {editProductId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditProductId(null);
                                                setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
                                                setImageFile(null);
                                            }}
                                            className="cancel-button"
                                        >
                                            Hủy
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="product-list-container">
                            <h3>Danh sách sản phẩm</h3>
                            <div className="search-container">
                                <label>Tìm kiếm sản phẩm:</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>
                            {currentProducts.length === 0 ? (
                                <p>Không có sản phẩm nào</p>
                            ) : (
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên</th>
                                            <th>Giá</th>
                                            <th>Tồn kho</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentProducts.map((product) => (
                                            <tr key={product._id}>
                                                <td>
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="product-image"
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.price.toLocaleString()} VNĐ</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <button onClick={() => handleEditProduct(product)} className="action-button">
                                                        Sửa
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="action-button delete">
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="pagination">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="pagination-button"
                                >
                                    Trước
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        disabled={page === currentPage}
                                        className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;