const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

// Route đăng nhập
router.post('/login', loginController.login);

module.exports = router;