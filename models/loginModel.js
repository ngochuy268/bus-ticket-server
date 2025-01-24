const connection = require('./db');

const loginModel = {
    checkUserCredentials: async (username, password) => {
        try {
            const [rows] = await connection.promise().execute(
                'SELECT * FROM users WHERE name = ? AND password = ?',
                [username, password]
            );
            return rows[0]; 
        } catch (error) {
            console.error('Error checking user credentials:', error);
            throw error;
        }
    },
};

module.exports = loginModel;