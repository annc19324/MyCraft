// services/api.js
import axios from 'axios'

const API_URL = 'http://localhost:5000/api';
const serverBase = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: serverBase,    // tự động gắn URL
    withCredentials: true,  // nếu bạn dùng cookie
});

export const getProducts = async () => {
    const res = await api.get(`/products`);
    return res.data;
};

export const getProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
}
// Thêm các endpoints cho orders
export const getAllOrders = async () => {
    const res = await api.get('/orders/all');
    return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
    const res = await api.put(`/orders/${orderId}/status`, { status });
    return res.data;
};

export default api;