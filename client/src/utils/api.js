// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    // withCredentials: true, // bật nếu backend dùng cookie session (hiện tại bạn dùng JWT → không cần)
});

// Interceptor: tự động gắn token
api.interceptors.request.use(
    (config) => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const { token } = JSON.parse(userData);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                console.error('Lỗi parse user data:', err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: xử lý 401 → logout tự động
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
    }
);

export default api;