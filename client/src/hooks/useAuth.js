// client/src/hooks/useAuth.js
// Bản hoàn hảo – giữ nguyên phong cách của bạn, đã fix userId = null
import { useState, useEffect } from 'react';

export function useAuth() {
    // Hàm helper để đọc localStorage an toàn
    const getStoredUser = () => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (err) {
            console.error('Lỗi parse user từ localStorage:', err);
            localStorage.removeItem('user');
            return null;
        }
    };

    const storedUser = getStoredUser();

    const [token, setToken] = useState(storedUser?.token || null);
    const [role, setRole] = useState(storedUser?.role || null);
    const [userId, setUserId] = useState(storedUser?.userId || storedUser?._id || null);
    const [user, setUser] = useState(storedUser); // để Messages.js lấy tên

    // Cập nhật khi localStorage thay đổi (đăng nhập, đăng xuất, tab khác…)
    useEffect(() => {
        const handleStorageChange = () => {
            const newUser = getStoredUser();
            setUser(newUser);
            setToken(newUser?.token || null);
            setRole(newUser?.role || null);
            setUserId(newUser?.userId || newUser?._id || null);
            console.log('useAuth cập nhật → userId:', newUser?.userId || newUser?._id);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setRole(null);
        setUserId(null);
        console.log('Đã đăng xuất');
    };

    // Hàm login để dùng trong Login.js (bạn chỉ cần gọi 1 dòng)
    const login = (data) => {
        const normalized = {
            ...data,
            userId: data.userId || data._id // đảm bảo luôn có userId
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        setUser(normalized);
        setToken(normalized.token);
        setRole(normalized.role);
        setUserId(normalized.userId);
        console.log('useAuth login → userId:', normalized.userId);
    };

    return {
        user,      // để Messages.js lấy tên, avatar…
        userId,    // BÂY GIỜ LUÔN CÓ!
        token,
        role,
        login,     // dùng trong Login.js
        logout
    };
}