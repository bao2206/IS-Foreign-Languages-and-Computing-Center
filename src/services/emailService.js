const nodemailer = require('nodemailer');
const { eventNames } = require('../models/UserModel');
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
module.exports = {
    sendEmailService,
}