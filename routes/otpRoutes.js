const express = require('express');

const { sendOTP, verifyOTP, sendMultiOTP, verifyGeneralOTP} = require('../controllers/otpController');


const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.post('/reservation/send', sendMultiOTP);
router.post('/reservation/verify', verifyGeneralOTP);

module.exports = router;