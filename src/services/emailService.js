const nodemailer = require('nodemailer');
const { eventNames } = require('../models/userModel');

const sendEmailService = async (emailAdd) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'maithegiabao22062002@gmail.com', // your email address
          pass: 'fqzq wgaq tlrm bdgc' // your email password
        }
      });
      
      var mailOptions = {
        from: 'maithegiabao22062002@gmail.com',
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