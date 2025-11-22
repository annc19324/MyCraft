// src/pages/admin/AdminProducts.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [editProductId, setEditProductId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token, role } = useAuth();

    // tự động xóa thông báo
    // useEffect(() => {
    //     if (error) {
    //         const timer = setTimeout(() => {
    //             setError(null);
    //         }, 3000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [error]);

    const fetchProducts = useCallback(async () => {
        if (!token || role !== 'admin') return;
        setLoading(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [token, role]);

    useEffect(() => {
        if (!token || role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }
        fetchProducts();
    }, [fetchProducts, navigate]);

    const handleAddProduct = async (e) => {
        e.preventDefault(); if (loading) return;
        setLoading(true); setError(null);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData(); uploadData.append('image', imageFile);
                const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                imageUrl = uploadRes.data.imageUrl;
            }
            const productData = {
                name: formData.name, description: formData.description,
                price: parseFloat(formData.price) || 0, stock: parseInt(formData.stock) || 0,
                imageUrl: imageUrl || 'https://place.dog/100/100'
            };
            const res = await api.post('/products', productData);
            setProducts(prev => [...prev, res.data]);
            setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
            setImageFile(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi thêm');
        } finally { setLoading(false); }
    };

    const handleEditProduct = (product) => {
        setEditProductId(product._id);
        setFormData({ name: product.name, description: product.description, price: product.price.toString(), stock: product.stock.toString(), imageUrl: product.imageUrl });
        setImageFile(null);
        setError(null);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault(); if (!window.confirm('Cập nhật sản phẩm?')) return;
        setLoading(true);
        try {
            let imageUrl = formData.imageUrl;
            if (imageFile) {
                const uploadData = new FormData(); uploadData.append('image', imageFile);
                const uploadRes = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                imageUrl = uploadRes.data.imageUrl;
            }
            const productData = { name: formData.name, description: formData.description, price: parseFloat(formData.price) || 0, stock: parseInt(formData.stock) || 0, imageUrl };
            const res = await api.put(`/products/${editProductId}`, productData);
            setProducts(prev => prev.map(p => p._id === editProductId ? res.data : p));
            setEditProductId(null); setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' }); setImageFile(null);
            alert('Cập nhật thành công!');
            setError(null);// đảm bảo lỗi đã xóa 
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally { setLoading(false); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Xóa sản phẩm này?')) return;
        setLoading(true);
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            alert('Xóa thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa');
        } finally { setLoading(false); }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginate = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

    if (!token || role !== 'admin') return null;

    return (
        <div className="products-section">
            <h2>Quản lý sản phẩm</h2>
            {error && <p className="error">{error}</p>}
            <div className="product-form-container">
                <h3>{editProductId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</h3>
                <form onSubmit={editProductId ? handleUpdateProduct : handleAddProduct} className="product-form">
                    <div className="form-group"><label>Tên sản phẩm:</label><input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required /></div>
                    <div className="form-group"><label>Mô tả:</label><textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} required /></div>
                    <div className="form-group"><label>Giá (VNĐ):</label><input type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required min="0" /></div>
                    <div className="form-group"><label>Tồn kho:</label><input type="number" value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))} required min="0" /></div>
                    <div className="form-group"><label>URL hình ảnh:</label><input type="text" value={formData.imageUrl} onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))} /></div>
                    <div className="form-group"><label>Tải lên hình ảnh:</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} /></div>
                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="submit-button submit-button-admin">{loading ? 'Đang xử lý...' : editProductId ? 'Cập nhật' : 'Thêm'}</button>
                        {editProductId && <button type="button" onClick={() => { setEditProductId(null); setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' }); setImageFile(null); }} className="cancel-button">Hủy</button>}
                    </div>
                </form>
            </div>
            <div className="product-list-container">
                <h3>Danh sách sản phẩm</h3>
                <div className="search-container"><label>Tìm kiếm:</label><input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Nhập tên sản phẩm..." /></div>
                {loading ? <p>Đang tải sản phẩm...</p> : currentProducts.length === 0 ? <p>Không có sản phẩm nào</p> : (
                    <>
                        <table className="product-table">
                            <thead><tr><th>Hình ảnh</th><th>Tên</th><th>Giá</th><th>Tồn kho</th><th>Hành động</th></tr></thead>
                            <tbody>
                                {currentProducts.map(product => (
                                    <tr key={product._id}>
                                        <td><img src={product.imageUrl} alt={product.name} className="product-image product-image_admin" /></td>
                                        <td>{product.name}</td>
                                        <td>{product.price.toLocaleString()} VNĐ</td>
                                        <td>{product.stock}</td>
                                        <td>
                                            <button onClick={() => handleEditProduct(product)} className="action-button edit">Sửa</button>
                                            <button onClick={() => handleDeleteProduct(product._id)} className="action-button delete">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Trước</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => paginate(page)} className={`pagination-button ${page === currentPage ? 'active' : ''}`}>{page}</button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">Sau</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminProducts;