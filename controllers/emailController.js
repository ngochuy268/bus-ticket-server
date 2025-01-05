const emailModel = require('../models/emailModel');
const axios = require('axios');

const emailController = {
    sendEmail: async (req, res) => {
        const { name, email, subject, message, captchaToken  } = req.body;

        if (!name || !email || !subject || !message || !captchaToken) {
            return res.status(400).send('All fields are required, including CAPTCHA.');
        }

        try {

            const secretKey = '6LefuK4qAAAAACRcqvDNeBWpbolAJPO3PatKFiz_';
            const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
                params: {
                    secret: secretKey,
                    response: captchaToken,
                },
            });

            if (!response.data.success) {
                return res.status(400).json({ error: 'CAPTCHA verification failed' });
            }

            await emailModel.sendEmail({ name, email, subject, message });
            res.status(200).send('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        }
    }
};

module.exports = emailController;