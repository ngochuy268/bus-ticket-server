const express = require('express');
const { signupUser } = require('../controllers/signUpController');

const router = express.Router();

router.post('/signup', signupUser);

module.exports = router;