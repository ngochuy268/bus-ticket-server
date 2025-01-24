const nodemailer = require('nodemailer');

const otpStorage = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'popvibes.net@gmail.com', 
    pass: 'gejl hpdl ergo qsdx', 
  },
});

const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, otp);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOTP = otpStorage.get(email);

    if (storedOTP && storedOTP === otp) {
      otpStorage.delete(email);
      res.status(200).json({ message: 'OTP verified successfully.' });
    } else {
      res.status(400).json({ message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP.' });
  }
};

module.exports = { sendOTP, verifyOTP };