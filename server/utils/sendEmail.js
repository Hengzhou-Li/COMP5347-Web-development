const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent to', to);
    } catch (error) {
        console.error('SendGrid error:', error.response?.body || error.message);
    }
};

module.exports = sendEmail;