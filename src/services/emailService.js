const nodemailer = require('nodemailer');
const { eventNames } = require('../models/userModel');

const sendEmailService = async (emailAdd) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // your email address
          pass: process.env.EMAIL_PASS // your email password
        }
      });
      
      var mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailAdd,
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
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