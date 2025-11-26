// server/socket/chatSocket.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

let ADMIN_ID = null;

const loadAdmin = async () => {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) ADMIN_ID = admin._id.toString();
};
loadAdmin();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-chat', async (userId) => {
            if (!userId || !ADMIN_ID) return;

            socket.userId = userId;

            let conv = await Conversation.findOne({
                participants: { $all: [userId, ADMIN_ID] }
            });

            if (conv) {
                socket.join(conv._id.toString());
                socket.emit('conversation-joined', conv._id.toString());
            }
            // Nếu chưa có → không join gì cả, đợi tin nhắn đầu tiên
        });

        socket.on('send-message', async (data) => {
            const { senderId, content, conversationId } = data;
            if (!content?.trim() || !ADMIN_ID) return;

            const realSenderId = senderId === 'admin' ? ADMIN_ID : senderId;

            let conv = conversationId
                ? await Conversation.findById(conversationId)
                : await Conversation.findOne({
                    participants: { $all: [realSenderId, ADMIN_ID] }
                });

            // ---------- TẠO MỚI NẾU CHƯA CÓ ----------
            if (!conv) {
                conv = await Conversation.create({
                    participants: [realSenderId, ADMIN_ID],
                    lastMessage: content.trim(),
                    lastMessageAt: new Date(),
                    unreadCount: realSenderId !== ADMIN_ID ? 1 : 0
                });

                // Thông báo cho người gửi (user) biết conversation đã được tạo
                socket.emit('conversation-created', conv._id.toString());
            } else {
                conv.lastMessage = content.trim();
                conv.lastMessageAt = new Date();
                if (realSenderId !== ADMIN_ID) conv.unreadCount += 1;
                await conv.save();
            }

            // ---------- LƯU MESSAGE ----------
            const message = await Message.create({
                conversation: conv._id,
                sender: realSenderId,
                content: content.trim()
            });

            const populatedMsg = await Message.findById(message._id)
                .populate('sender', 'name username role avatar');

            const msgData = {
                ...populatedMsg.toObject(),
                conversationId: conv._id.toString()
            };

            // Gửi vào room của conversation
            io.to(conv._id.toString()).emit('message-sent', msgData);
            // Admin nhận thông báo (có thể đang ở bất kỳ trang nào)
            io.emit('new-message-admin', msgData);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};