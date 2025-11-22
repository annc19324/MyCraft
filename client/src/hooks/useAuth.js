// hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
    // ĐỌC NGAY LẬP TỨC → KHÔNG DÙNG useEffect
    const stored = localStorage.getItem('user');
    const userData = stored ? JSON.parse(stored) : null;

    const [token, setToken] = useState(userData?.token || null);
    const [role, setRole] = useState(userData?.role || null);
    const [userId, setUserId] = useState(userData?.userId || null);

    // Hàm login mới: Lưu vào localStorage VÀ cập nhật state
    const login = ({ token, role, userId }) => {
        const userData = { token, role, userId };
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setRole(role);
        setUserId(userId);
        console.log('useAuth: State đã được cập nhật bằng hàm login()');
    };

    const logout = () => {
        localStorage.removeItem('user');
        setToken(null);
        setRole(null);
        setUserId(null);
    };

    // Chỉ lắng nghe thay đổi localStorage (cho đồng bộ giữa các tab)
    // Tôi giữ lại phần này, nhưng vấn đề chính được giải quyết bằng hàm `login`
    useEffect(() => {
        const handleStorageChange = () => {
            const newData = localStorage.getItem('user');
            const parsed = newData ? JSON.parse(newData) : null;
            setToken(parsed?.token || null);
            setRole(parsed?.role || null);
            setUserId(parsed?.userId || null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { token, role, userId, login, logout }; // Trả về hàm login
}