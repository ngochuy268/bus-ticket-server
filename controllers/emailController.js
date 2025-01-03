const emailModel = require('../models/emailModel');

const emailController = {
    sendEmail: async (req, res) => {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).send('All fields are required');
        }

        try {
            await emailModel.sendEmail({ name, email, subject, message });
            res.status(200).send('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        }
    }
};

module.exports = emailController;