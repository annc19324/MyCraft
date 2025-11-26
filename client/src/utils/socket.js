// client/src/utils/socket.js
import io from 'socket.io-client';

// LẤY URL GỐC (không có /api) để kết nối Socket.IO
const SOCKET_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

export default socket;