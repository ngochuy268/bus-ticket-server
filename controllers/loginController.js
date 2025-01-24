const loginModel = require('../models/loginModel');

const loginController = {
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await loginModel.checkUserCredentials(username, password);
            if (user) {
                res.status(200).json({ message: 'Login successful!', user });
            } else {
                res.status(400).json({ message: 'Invalid username or password.' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Failed to login. Please try again.' });
        }
    },
};

module.exports = loginController;