const { updatePassword } = require('../models/resetPWModel');

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const result = await updatePassword(email, newPassword);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: error.message || 'Failed to reset password.' });
    }
};

module.exports = { resetPassword };