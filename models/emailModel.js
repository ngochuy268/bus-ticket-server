const nodemailer = require('nodemailer');

const emailModel = {
    sendEmail: async (emailData) => {
        const { name, email, subject, message } = emailData;

        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'popvibes.net@gmail.com', 
                pass: 'gejl hpdl ergo qsdx', 
            },
        });

        const mailOptions = {
            from: email,
            to: 'popvibes.net@gmail.com', 
            subject: `Contact Form: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        };

        await transporter.sendMail(mailOptions);
    }
};

module.exports = emailModel;