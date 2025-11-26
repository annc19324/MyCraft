// server/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 } // cho admin biết có tin mới
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);