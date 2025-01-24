const { checkUserExists } = require('../models/forgotPWModel');
const { sendOTP } = require('./otpController'); 

const ForgotPWController = {
    checkUser: async (req, res) => {
        const { email, username } = req.body;

        try {
            const userExists = await checkUserExists(email, username);
            if (!userExists) {
                return res.status(400).json({ message: 'Email or username does not exist.' });
            }

            await sendOTP(req, res);
        } catch (error) {
            console.error('Error checking user:', error);
            res.status(500).json({ message: 'An error occurred. Please try again.' });
        }
    },
};

module.exports = ForgotPWController;