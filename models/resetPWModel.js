const connection = require('./db');

const updatePassword = async (email, newPassword) => {
    try {
        const [result] = await connection.promise().execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [newPassword, email]
        );

        if (result.affectedRows === 0) {
            throw new Error('Email not found.');
        }

        return { message: 'Password updated successfully.' };
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

module.exports = { updatePassword };