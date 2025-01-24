const express = require('express');
const { resetPassword } = require('../controllers/resetPWController');

const router = express.Router();

// Route cập nhật mật khẩu
router.post('/reset-password', resetPassword);

module.exports = router;