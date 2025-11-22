// hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
    // ĐỌC NGAY LẬP TỨC → KHÔNG DÙNG useEffect
    const stored = localStorage.getItem('user');
    const userData = stored ? JSON.parse(stored) : null;

    const [token, setToken] = useState(userData?.token || null);
    const [role, setRole] = useState(userData?.role || null);
    const [userId, setUserId] = useState(userData?.userId || null);

    // Chỉ lắng nghe thay đổi localStorage (nếu cần)
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

    const logout = () => {
        localStorage.removeItem('user');
        setToken(null);
        setRole(null);
        setUserId(null);
    };

    return { token, role, userId, logout };
}