// server/utils/mailer.js
// ĐÃ CHUYỂN HOÀN TOÀN SANG RESEND (không còn Nodemailer, không còn SMTP, không còn timeout)
// Chỉ cần thêm 2 biến môi trường: RESEND_API_KEY + FROM_EMAIL

const { Resend } = require('resend');

// Khởi tạo Resend một lần duy nhất
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Gửi email bằng Resend API (rất nhanh, rất ổn định)
 * @param {Object} payload
 * @param {string} payload.to        Email người nhận
 * @param {string} payload.subject   Tiêu đề
 * @param {string} [payload.text]    Nội dung text (nếu không có html)
 * @param {string} [payload.html]    Nội dung HTML (ưu tiên cao hơn text)
 * @returns {Promise<boolean>}       true = gửi thành công
 */
async function sendEmail({ to, subject, text, html }) {
  // Nếu chưa có Resend key → chỉ log (để dev local vẫn chạy được)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_') === false) {
    console.warn('RESEND_API_KEY chưa được cấu hình → chỉ log email (không gửi thật)');
    console.info('Email preview:', { to, subject, text: text?.slice(0, 200), html: html ? 'có HTML' : 'không HTML' });
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'MyCraft Shop <no-reply@mycraft.vn>',
      to: [to],
      subject,
      text: text || '',
      html: html || text || '',
    });

    // result.data có id email nếu thành công
    console.log(`Email sent successfully to ${to} (ID: ${result.data?.id || 'N/A'})`);
    return true;
  } catch (error) {
    console.error('Resend gửi email thất bại:', error.message || error);
    // Không throw để không làm crash server
    return false;
  }
}

// Không cần initMailer() nữa → để tương thích code cũ vẫn gọi được
function initMailer() {
  console.log('Mailer đã sẵn sàng với Resend (không cần init SMTP)');
}

// Export cả 2 để code cũ vẫn chạy bình thường
module.exports = sendEmail;
module.exports.init = initMailer;