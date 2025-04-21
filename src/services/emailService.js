const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");

const generateToken = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: "2h" }); // Token hết hạn sau 2h
};

const sendEmailService = async (emailAdd, userID, userName) => {
  const token = generateToken(userID);
  const url = `http://localhost:8080/api/users/register?token=${token}`;

  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME, // your email address
        pass: process.env.EMAIL_PASSWORD // your email password
      }
    });
    
  var mailOptions = {
    from: 'maithegiabao22062002@gmail.com',
    to: emailAdd,
    subject: 'Sending Email using Node.js',
    text: 'Link to create Account: ' + url,
    html: `<p>Dear ${userName},</p><p>Click <a href="${url}">here</a> to create your account.</p><p>Thank you!</p>`,
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
const sendAccount = async (name, email, username ,password) =>{
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Tài khoản nhân viên đã được tạo',
    html: `
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Bạn đã được tạo tài khoản nhân viên trong hệ thống.</p>
      <p><strong>🔑 Tài khoản đăng nhập:</strong></p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>💡 Gợi ý: Sau khi đăng nhập lần đầu, hãy thay đổi mật khẩu để bảo mật hơn.</p>
      <p>Trân trọng,</p>
      <p>Hệ thống quản lý khóa học</p>
    `
  };

  await transporter.sendMail(mailOptions);
}
module.exports = {
    sendEmailService,
    sendAccount
}