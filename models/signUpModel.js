const connection = require('./db');

const checkUsernameExists = async (username) => {
  try {
      const [rows] = await connection.promise().execute(
          'SELECT * FROM users WHERE name = ?',
          [username]
      );
      return rows.length > 0; 
  } catch (error) {
      console.error('Error checking username:', error);
      throw error;
  }
};

const checkEmailExists = async (email) => {
  try {
      const [rows] = await connection.promise().execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
      );
      return rows.length > 0; 
  } catch (error) {
      console.error('Error checking email:', error);
      throw error;
  }
};

const saveUser = async (email, username, password, permission) => {
    try {
      
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
          throw new Error('Username already exists.');
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
          throw new Error('Email already exists.');
      }

      const [result] = await connection.promise().execute(
        'INSERT INTO users (email, name, password, permission) VALUES (?, ?, ?, ?)',
        [email, username, password, permission]
      );
  
      return result;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };
  
  module.exports = { saveUser, checkUsernameExists, checkEmailExists};