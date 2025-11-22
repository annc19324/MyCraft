// import React, { useState } from 'react';
// import axios from 'axios';
// import api from '../utils/api';
// import { useAuth } from '../hooks/useAuth';

// function UploadDemo() {
//     const [file, setFile] = useState(null);
//     const [message, setMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const { token } = useAuth();

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//         setMessage('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!file) return;
//         if (!token) {
//             setMessage('Lỗi: Bạn chưa đăng nhập!');
//             return;
//         }

//         setLoading(true);
//         const formData = new FormData();
//         formData.append('image', file);

//         try {
//             const res = await api.post('/upload', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             setMessage(`Upload thành công: ${res.data.filename}`);
//         } catch (err) {
//             setMessage(`Lỗi: ${err.response?.data?.message || err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial' }}>
//             <h2 style={{ textAlign: 'center' }}>Demo Upload Bảo Mật</h2>
//             <p style={{ textAlign: 'center' }}> Bảo mật dữ liệu tải lên (file upload security)</p>
//             <p style={{ textAlign: 'center' }}> demo tấn công upload shell và cách lọc định dạng MIME </p>
//             <form onSubmit={handleSubmit} style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
//                 <input style={{ width: '500px' }} type="file" onChange={handleFileChange} accept="image/*" />
//                 <button style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, marginTop: 10, width: '150px' }} type="submit" disabled={loading}>
//                     {loading ? 'Đang upload...' : 'Upload'}
//                 </button>
//             </form>
//             {message && <p style={{ marginTop: '10px', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
//         </div >
//     );
// }

// export default UploadDemo;