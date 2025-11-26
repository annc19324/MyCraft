// client/src/pages/admin/AdminMessages.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import socket from '../../utils/socket';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/styles/admin.css';

function AdminMessages() {
    const [convs, setConvs] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const { userId: adminId, logout } = useAuth();
    const location = useLocation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load danh sách cuộc trò chuyện
    useEffect(() => {
        api.get('/messages/conversations')
            .then(res => setConvs(res.data))
            .catch(err => console.error('Lỗi tải danh sách chat:', err));
    }, []);

    // Realtime tin nhắn
    useEffect(() => {
        const handleNewMessage = (msg) => {
            setConvs(prev => prev.map(c =>
                c._id === msg.conversationId
                    ? {
                        ...c,
                        lastMessage: msg.content,
                        unreadCount: (c.unreadCount || 0) + (msg.sender.role === 'user' ? 1 : 0)
                    }
                    : c
            ));

            if (selectedConv?._id === msg.conversationId) {
                setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
            }
        };

        socket.on('new-message-admin', handleNewMessage);
        socket.on('message-sent', handleNewMessage);

        return () => {
            socket.off('new-message-admin');
            socket.off('message-sent');
        };
    }, [selectedConv]);

    const openChat = async (conv) => {
        setSelectedConv(conv);
        try {
            const res = await api.get(`/messages/conversation/${conv._id}`);
            setMessages(res.data);
            setConvs(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
        } catch (err) {
            console.error('Lỗi tải tin nhắn:', err);
        }
    };

    const sendReply = () => {
        if (!input.trim() || !selectedConv) return;

        socket.emit('send-message', {
            senderId: 'admin',
            content: input.trim(),
            conversationId: selectedConv._id
        });
        setInput('');
    };

    const getUserFromConv = (conv) => {
        return conv.participants.find(p => p.role === 'user') || {};
    };

    return (
        <div className="page-wrapper page-wrapper-admin">
            <div className="admin-dashboard admin-dashboard-chat">
                {/* Sidebar */}
                <div className="sidebar sidebar-chat">
                    <h3>MyCraft Admin</h3>
                    <div className="sidebar-buttons">
                        <Link to="/admin"><button className={location.pathname === '/admin' ? 'active' : ''}>Tổng quan</button></Link>
                        <Link to="/admin/products"><button className={location.pathname.includes('/admin/products') ? 'active' : ''}>Quản lý sản phẩm</button></Link>
                        <Link to="/admin/orders"><button className={location.pathname.includes('/admin/orders') ? 'active' : ''}>Quản lý đơn hàng</button></Link>
                        <Link to="/admin/messages"><button className={location.pathname.includes('/admin/messages') ? 'active' : ''}>Chat </button></Link>
                        <Link to="/admin/users"><button className={location.pathname.includes('/admin/users') ? 'active' : ''}>Quản lý người dùng</button></Link>
                        <button onClick={logout}>Đăng xuất</button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="admin-section">
                        <h2>Quản lý tin nhắn khách hàng</h2>

                        <div className="admin-chat-container">
                            {/* Sidebar danh sách khách */}
                            <div className="admin-chat-sidebar">
                                <div className="admin-chat-sidebar-header">
                                    <h3>khách ({convs.length})</h3>
                                </div>
                                <div className="sidebar-scroll">
                                    {convs.length === 0 ? (
                                        <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                            Chưa có tin nhắn nào
                                        </div>
                                    ) : (
                                        convs.map(conv => {
                                            const user = getUserFromConv(conv);
                                            return (
                                                <div
                                                    key={conv._id}
                                                    onClick={() => openChat(conv)}
                                                    className={`conversation-item ${selectedConv?._id === conv._id ? 'active' : ''}`}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <strong>{user.name || user.username || 'Khách'}</strong>
                                                        {conv.unreadCount > 0 && (
                                                            <span className="unread-badge">
                                                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small>{conv.lastMessage || 'Chưa có tin nhắn'}</small>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Khu vực chat chính */}
                            <div className="admin-chat-main">
                                {selectedConv ? (
                                    <>
                                        <div className="admin-chat-header">
                                            Đang chat với: <strong>{getUserFromConv(selectedConv).name || 'Khách'}</strong>
                                        </div>

                                        <div className="admin-chat-messages">
                                            {messages.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '80px', color: '#aaa' }}>
                                                    <FaUserCircle size={80} style={{ opacity: 0.3, marginBottom: '20px' }} />
                                                    <p>Chưa có tin nhắn nào. Hãy bắt đầu trả lời khách!</p>
                                                </div>
                                            ) : (
                                                messages.map(msg => (
                                                    <div
                                                        key={msg._id}
                                                        className={`message-bubble ${msg.sender._id === adminId ? 'user' : 'admin'}`}
                                                    >
                                                        <div className="message-content">
                                                            <div className="message-sender">
                                                                {msg.sender._id === adminId ? 'Admin' : msg.sender.name || 'Khách'}
                                                            </div>
                                                            <div className="message-text">{msg.content}</div>
                                                            <div className="message-time">
                                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div className="admin-chat-input">
                                            <input
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                                                placeholder="Nhập tin nhắn... (Enter để gửi)"
                                                autoFocus
                                            />
                                            <button onClick={sendReply}>
                                                <FaPaperPlane /> Gửi
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-chat-selected">
                                        ← Chọn một khách hàng để bắt đầu chat
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminMessages;