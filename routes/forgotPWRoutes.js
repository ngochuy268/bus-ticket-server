const express = require('express');
const ForgotPWController = require('../controllers/forgotPWController');

const router = express.Router();

router.post('/check-user', ForgotPWController.checkUser);

module.exports = router;