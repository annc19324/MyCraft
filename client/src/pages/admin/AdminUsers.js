// src/pages/admin/AdminUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(5);
    const [formData, setFormData] = useState({
        username: '', name: '', phone: '', address: '', role: 'user'
    });
    const [editUserId, setEditUserId] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.userId;
    const role = user?.role;

    const fetchUsers = useCallback(async () => {
        if (!userId || role !== 'admin')
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:5000/api/users/all', {
                headers: { 'user-id': userId, 'role': role },
            });
            setUsers(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lấy danh sách người dùng')
        } finally {
            setLoading(false);
        }
    }, [userId, role]);

    useEffect(() => {
        if (!userId || role !== 'admin') {
            navigate('/login', { replace: true });
            return;
        }
        fetchUsers();
    }, [fetchUsers, navigate]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/users', formData, {
                headers: { 'user-id': userId, 'role': role }
            });
            setUsers(prev => [...prev, res.data]);
            setFormData({ username: '', name: '', phone: '', address: '', role: 'user' });
            alert('Thêm thành công');
        } catch (err) {
            setError(err?.response?.data?.message || 'Lỗi khi thêm');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditUserId(user._id);
        setFormData({
            username: user.username,
            name: user.name,
            phone: user.phone || '',
            address: user.address || '',
            role: user.role
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!window.confirm('Cập nhật người dùng?')) return;
        setLoading(true);
        try {
            const res = await axios.put(
                `http://localhost:5000/api/users/${editUserId}`,
                formData,
                { headers: { 'user-id': userId, 'role': role } }
            );
            setUsers(prev => prev.map(u => u._id === editUserId ? res.data : u));
            setEditUserId(null);
            setFormData({ username: '', name: '', phone: '', address: '', role: 'user' });
            alert('Cập nhật thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setLoading(false);
        }
    }


    const handleDeleteUser = async (id) => {
        if (!window.confirm('Xóa người dùng này?')) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { 'user-id': userId, 'role': role },
            });
            setUsers(prev => prev.filter(u => u._id !== id));
            alert('Xóa thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);


    const paginate = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    if (!userId || role !== 'admin') return null;

    return (
        <div className="admin-section">
            <h2>Quản lý người dùng</h2>
            {error && <p className="error">{error}</p>}

            <div className="product-form-container">
                <h3>{editUserId ? 'Cập nhật người dùng' : 'Thêm người dùng'}</h3>
                <form onSubmit={editUserId ? handleUpdateUser : handleAddUser} className="product-form">
                    <div className="form-group">
                        <label>Tên đăng nhập:</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            required
                            disabled={!!editUserId}
                        />
                    </div>
                    <div className="form-group">
                        <label>Họ tên:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input
                            type="password"
                            value={formData.password || ''}
                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required={!editUserId}
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại:</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Địa chỉ:</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Vai trò:</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>
                    <div className="form-buttons">
                        <button type="submit" disabled={loading} className="submit-button">
                            {loading ? 'Đang xử lý...' : editUserId ? 'Cập nhật' : 'Thêm'}
                        </button>
                        {editUserId && (
                            <button type="button" onClick={() => {
                                setEditUserId(null);
                                setFormData({ username: '', name: '', phone: '', address: '', role: 'user' });
                            }} className="cancel-button">
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="product-list-container">
                <h3>Danh sách người dùng</h3>
                <div className="search-container">
                    <label>Tìm kiếm:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
                    />
                </div>

                {loading ? <p>Đang tải...</p> : currentUsers.length === 0 ? <p>Không có người dùng nào</p> : (
                    <>
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Tên đăng nhập</th>
                                    <th>Họ tên</th>
                                    <th>SĐT</th>
                                    <th>Vai trò</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.username}</td>
                                        <td>{u.name}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td><span className={`status ${u.role}`}>{u.role === 'admin' ? 'Quản trị' : 'Người dùng'}</span></td>
                                        <td>
                                            <button onClick={() => handleEditUser(u)} className="action-button edit">Sửa</button>
                                            {u.role !== 'admin' && (
                                                <button onClick={() => handleDeleteUser(u._id)} className="action-button delete">Xóa</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Trước</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => paginate(page)} className={`pagination-button ${page === currentPage ? 'active' : ''}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">Sau</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;