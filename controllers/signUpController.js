const { saveUser, checkUsernameExists, checkEmailExists } = require('../models/signUpModel');

const signupUser = async (req, res) => {
  const { email, username, password, permission } = req.body;
  try {
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
        return res.status(400).json({ message: 'Username  already exists. Please choose a different username.' });
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        return res.status(400).json({ message: 'Email  already exists. Please choose a different email.' });
    }

    await saveUser(email, username, password, permission); 
      res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
      console.error('Error during signup:', error);
    res.status(500).json({ message: 'Failed to register user.' });
  }
};

module.exports = { signupUser };