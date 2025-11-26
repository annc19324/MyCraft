// server/routes/messageRoutes.js – PHIÊN BẢN CUỐI, KHÔNG BAO GIỜ LỖI 500
const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

// 1. ADMIN: Lấy tất cả conversation
router.get('/conversations', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin được phép' });
        }

        const conversations = await Conversation.find()
            .populate('participants', 'name avatar username role _id')
            .sort({ lastMessageAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error('Lỗi lấy danh sách conversation:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 2. LẤY TIN NHẮN – ĐÃ FIX HOÀN TOÀN LỖI 500
router.get('/conversation/:convId', verifyToken, async (req, res) => {
    try {
        const convId = req.params.convId;
        const userId = req.user._id.toString();

        // Tìm và populate đầy đủ
        const conv = await Conversation.findById(convId)
            .populate('participants', 'name avatar username role _id');

        // Nếu không tồn tại → 404, không crash
        if (!conv) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }

        // KIỂM TRA QUYỀN TRUY CẬP AN TOÀN (không dùng .map nữa)
        const hasAccess = conv.participants.some(p =>
            p && p._id && p._id.toString() === userId
        );

        if (!hasAccess) {
            return res.status(403).json({ message: 'Bạn không có quyền xem tin nhắn này' });
        }

        // Lấy tin nhắn
        const messages = await Message.find({ conversation: convId })
            .populate('sender', 'name avatar username role')
            .sort({ createdAt: 1 });

        // Admin mở chat → reset unread
        if (req.user.role === 'admin') {
            conv.unreadCount = 0;
            await conv.save();
        }

        res.json(messages);
    } catch (err) {
        console.error('LỖI GET /conversation/:id →', err.message);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

// 3. USER: Lấy conversation của mình
router.get('/my-conversation', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) return res.status(500).json({ message: 'Không có admin' });

        const conv = await Conversation.findOne({
            participants: { $all: [userId, admin._id] }
        }).populate('participants', 'name username avatar role _id');

        res.json(conv || null);
    } catch (err) {
        console.error('Lỗi /my-conversation:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;