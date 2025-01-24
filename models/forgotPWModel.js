const connection = require('./db');

const checkUserExists = async (email, username) => {
    try {
        const [rows] = await connection.promise().execute(
            'SELECT * FROM users WHERE email = ? AND name = ?',
            [email.trim(), username.trim()]
        );
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking user:', error);
        throw error;
    }
};

module.exports = { checkUserExists };