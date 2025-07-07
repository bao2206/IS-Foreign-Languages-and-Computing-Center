const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const generateToken = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

// 📦 Tạo transporter dùng chung
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    html,
  };

  // const t0 = performance.now();
  await transporter.sendMail(mailOptions);
  // console.log(`📨 Email "${subject}" sent to ${to} in ${(performance.now() - t0).toFixed(2)}ms`);
};

/**
 * 📧 Gửi link xác minh tạo tài khoản (có token đăng ký)
 */
const sendEmailService = async (email, userID, userName) => {
  const token = generateToken(userID);
  const url = `http://localhost:8080/api/users/register?token=${token}`;
  const html = `
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Vui lòng nhấn <a href="${url}">vào đây</a> để hoàn tất việc tạo tài khoản.</p>
    <p>Liên kết này sẽ hết hạn sau 2 giờ.</p>
  `;
  await sendMail(email, 'Tạo tài khoản hệ thống', html);
};

/**
 * 🧑‍💼 Gửi tài khoản nhân viên đã tạo
 */

const sendAccount = async (name, email, username, password) => {
  const html = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Bạn đã được tạo tài khoản nhân viên trong hệ thống.</p>
    <ul>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>💡 Hãy đổi mật khẩu sau khi đăng nhập để bảo mật hơn.</p>
  `;
  await sendMail(email, 'Tài khoản nhân viên đã được tạo', html);
};

/**
 * 🔑 Gửi email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `https://is-foreign-languages-and-computing.vercel.app/reset-password?token=${token}`;
  const html = `
    <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
    <p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Liên kết có hiệu lực trong 10 phút.</p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;
  await sendMail(email, '🔑 Đặt lại mật khẩu', html);
};
const sendMailThankYouContact = async (email, name) => {
  const html = `
    <p>Chào <strong>${name}</strong>,</p>
    <p>Cảm ơn bạn đã liên hệ với Trung tâm Ngoại ngữ - Tin học của chúng tôi.</p>
    <p>Chúng tôi đã nhận được thông tin của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
    <p>Nếu có vấn đề khẩn cấp, vui lòng liên hệ trực tiếp qua số điện thoại hoặc fanpage của trung tâm.</p>
    <br/>
    <p>Trân trọng,</p>
    <p><strong>Trung tâm Ngoại ngữ - Tin học</strong></p>
  `;
  await sendMail(email, 'Cảm ơn bạn đã liên hệ với Trung tâm', html);
};

module.exports = {
  sendEmailService,
  sendAccount,
  sendResetPasswordEmail,
  generateToken,
  sendMailThankYouContact,
};
