// client/src/pages/Messages.js – PHIÊN BẢN CUỐI CÙNG, CHẠY MƯỢT NHƯ ZALO/FB
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../hooks/useAuth';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import '../assets/styles/chat.css';

function Messages() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [conversation, setConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { user, userId } = useAuth();

    // SCROLL XUỐNG DƯỚI MƯỢT MÀ – HOẠT ĐỘNG 100% MỌI TRƯỜNG HỢP
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    };

    // Mỗi khi messages thay đổi → tự động scroll xuống dưới (kể cả khi admin trả lời)
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load cuộc trò chuyện khi vào trang
    useEffect(() => {
        if (!userId) return;

        const loadChat = async () => {
            try {
                const res = await api.get('/messages/my-conversation');
                if (res.data) {
                    setConversation(res.data);
                    socket.emit('join-chat', userId);

                    const msgRes = await api.get(`/messages/conversation/${res.data._id}`);
                    setMessages(msgRes.data);
                }
            } catch (err) {
                console.log('Chưa có cuộc trò chuyện');
            } finally {
                setIsLoading(false);
            }

            // Đảm bảo scroll xuống dưới lần đầu load
            scrollToBottom();
        };

        loadChat();

        // Lắng nghe tin nhắn realtime
        const handleMessage = (msg) => {
            setMessages((prev) => {
                // Tránh trùng lặp
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            // scrollToBottom() sẽ được gọi tự động từ useEffect trên
        };

        const handleConvCreated = (convId) => {
            setConversation({ _id: convId });
            socket.emit('join-chat', userId);
        };

        socket.on('message-sent', handleMessage);
        socket.on('conversation-created', handleConvCreated);

        return () => {
            socket.off('message-sent', handleMessage);
            socket.off('conversation-created', handleConvCreated);
        };
    }, [userId]);

    // Gửi tin nhắn
    const sendMessage = () => {
        const content = input.trim();
        if (!content || !userId) return;

        socket.emit('send-message', {
            senderId: userId,
            content,
            conversationId: conversation?._id || null,
        });

        setInput('');

        // Scroll ngay sau khi gửi (tin nhắn user hiện lập tức)
        setTimeout(() => scrollToBottom(), 100);
    };

    // Enter để gửi, Shift+Enter để xuống dòng
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoading) {
        return (
            <div className="page-wrapper">
                <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>
                    Đang tải tin nhắn...
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="container">
                    <a href="/">Trang chủ</a>
                    <a href="/products">Sản phẩm</a>
                    <a href="/cart">Giỏ hàng</a>
                    <a href="/messages">Chat</a>
                    <a href="/profile">Cá nhân</a>
                </div>
            </nav>

            <div className="page-content">
                <div className="chat-container">
                    {/* HEADER */}
                    <div className="chat-header">
                        <h5>Admin MyCraft</h5>
                        {/* <p>Đang chat với tư cách: <strong>{user?.name || 'Khách'}</strong></p> */}
                    </div>

                    {/* TIN NHẮN */}
                    <div className="chat-messages">
                        {!conversation ? (
                            <div className="empty-chat">
                                <FaUserCircle size={80} />
                                <p>Bạn chưa có tin nhắn nào với admin.</p>
                                <p>Gửi tin nhắn đầu tiên để bắt đầu nhé!</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="empty-chat">
                                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((m) => (
                                    <div
                                        key={m._id}
                                        className={`message-bubble ${m.sender._id === userId ? 'user' : 'admin'}`}
                                    >
                                        <div className="message-content">
                                            <div className="message-sender">
                                                {m.sender._id === userId ? 'Bạn' : 'Admin MyCraft'}
                                            </div>
                                            <div className="message-text">{m.content}</div>
                                            <div className="message-time" >
                                                {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Dòng ẩn để scroll chính xác */}
                                <div ref={messagesEndRef} style={{ height: '1px' }} />
                            </>
                        )}
                    </div>

                    {/* INPUT */}
                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn... (Enter để gửi)"
                            autoFocus
                        />
                        <button onClick={sendMessage}>
                            <FaPaperPlane /> Gửi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Messages;