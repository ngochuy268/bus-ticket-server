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

// ✅ Gửi OTP riêng biệt cho từng email
const sendMultiOTP = async (req, res) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: '無効なメールアドレスのリストです。' });
  }

  try {
    const sendPromises = emails.map(async (email) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStorage.set(email, otp); // lưu OTP cho từng email

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '【Bus予約】OTP確認コード',
        text: `あなたの予約認証コードは: ${otp} です。`,
      };

      await transporter.sendMail(mailOptions);
    });

    await Promise.all(sendPromises);

    res.status(200).json({ message: '全てのメールアドレスにOTPを送信しました。' });
  } catch (error) {
    console.error('OTP送信エラー:', error);
    res.status(500).json({ message: 'OTPの送信に失敗しました。' });
  }
};

// ✅ Kiểm tra OTP riêng biệt cho từng email
const verifyGeneralOTP = async (req, res) => {
  const otpPairs = req.body.data;

  if (!otpPairs || !Array.isArray(otpPairs) || otpPairs.length === 0) {
    return res.status(400).json({ message: '無効なOTPのリストです。' });
  }

  try {
    let verificationFailed = false; // Biến kiểm tra xem có lỗi xảy ra trong quá trình xác thực
    const failedEmails = []; // Danh sách email có OTP sai

    // Lặp qua từng cặp email và OTP
    for (let pair of otpPairs) {
      const { email, otp } = pair;

      if (!email || !otp) {
        return res.status(400).json({ message: 'メールアドレスまたはOTPが無効です。' });
      }

      const storedOTP = otpStorage.get(email); // Lấy OTP đã lưu cho email này

      if (!storedOTP) {
        // Nếu không tìm thấy OTP cho email này
        return res.status(400).json({ message: `OTPがメールアドレス ${email} に対して見つかりませんでした。` });
      }

      if (storedOTP !== otp) {
        // Nếu OTP sai, thêm vào danh sách lỗi
        failedEmails.push(email);
        verificationFailed = true;
      }
    }

    if (verificationFailed) {
      // Nếu có ít nhất một OTP sai
      return res.status(400).json({
        message: '一部のOTPが無効です。',
        failedEmails, // Trả về danh sách email có OTP sai
      });
    }

    otpPairs.forEach(pair => otpStorage.delete(pair.email));

    res.status(200).json({ message: 'OTP確認に成功しました。' }); // Nếu tất cả OTP đều đúng
  } catch (error) {
    console.error('OTP確認エラー:', error);
    res.status(500).json({ message: 'OTP確認に失敗しました。' });
  }
};


module.exports = { sendOTP, verifyOTP,
  sendMultiOTP,       
  verifyGeneralOTP
 };