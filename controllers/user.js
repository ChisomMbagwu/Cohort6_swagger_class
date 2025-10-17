const userModel = require('../models/user');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const { registerOTP } = require('../utils/email');
// const { sendMail } = require('../utils/nodemailer');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/brevo');


exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, age, phoneNumber } = req.body;
    const existUser = await userModel.findOne({ email: email.toLowerCase() });

    if (existUser) {
      return res.status(400).json({
        message: 'User already exist'
      })
    };

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");

    const user = new userModel({
      fullName,
      email,
      password: hashPassword,
      age,
      phoneNumber: `+234${phoneNumber.slice(1)}`,
      otp: otp,
      otpExpiredAt: Date.now() + 1000 * 120
    });

    const detail = {
      email: user.email,
      subject: 'Email Verification',
      html: registerOTP(user.otp, `${user.fullName.split(' ')[0]}`)
    };

    await sendMail(detail);
    await user.save();
    const response = {
      fullName: user.fullName,
      email: user.email
    };
    res.status(201).json({
      message: 'User created successfully',
      data: response
    })
  } catch (error) {
    res.status(500).json({
      mesaage: 'Error creating user' + error.message
    })
  }
};


exports.verify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'user not found'
      })
    };

    if (Date.now() > user.otpExpiredAt) {
      return res.status(400).json({
        message: 'OTP expired'
      })
    };

    if (otp !== user.otp) {
      return res.status(400).json({
        message: 'Invalid otp'
      })
    };

    Object.assign(user, { isVerified: true, otp: null, otpExpiredAt: null });
    await user.save();
    res.status(200).json({
      message: 'User verified successfully'
    })
  } catch (error) {
    res.status(500).json({
      mesaage: 'Error verifying user' + error.message
    })
  }
};


exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'user not found'
      })
    };

    const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");
    Object.assign(user, { otp: otp, otpExpiredAt: Date.now() + 1000 * 120 });

    const detail = {
      email: user.email,
      subject: 'Resend: Email Verification',
      html: registerOTP(user.otp, `${user.fullName.split(' ')[0]}`)
    };

    await sendMail(detail);
    await user.save();
    res.status(200).json({
      message: 'Otp sent, kindly check your email'
    })
  } catch (error) {
    res.status(500).json({
      mesaage: 'Error resending otp' + error.message
    })
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (passwordCorrect === false) {
      return res.status(400).json({
        message: 'Invalid Password'
      })
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        message: 'User not verified, Please verify your account to continue'
      })
    }

    const token = await jwt.sign({
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    }, process.env.JWT_SECRET, { expiresIn: '1day' });

    // Send a success response
    res.status(200).json({
      message: "Login successfull",
      data: user.fullName,
      token
    })

  } catch (error) {
    res.status(500).json({
      message: "Error logging in: " + error.mesaage
    })
  }
}

exports.getAll = async (req, res) => {
  try {
    const allUsers = await userModel.find().select('-password -otp -otpExpiredAt -__v');
    res.status(200).json({
      message: `All users available and the total is: ${allUsers.length}`,
      data: allUsers
    })
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all users: " + error.message
    })
  }
}

exports.makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    user.isAdmin = true;

    await user.save();
    res.status(200).json({
      message: 'User role updated to an Admin'
    })
  } catch (error) {
    res.status(500).json({
      message: "Error making user an Admin: " + error.mesaage
    })
  }
}

exports.googleAuthLogin = async (req, res)=> {
  try {
    const token = await jwt.sign({
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }, process.env.JWT_SECRET, {expiresIn: '1hr'})
    // res.redirect('/')

    res.status(200).json({
      message: 'Login successful',
      data: req.user.fullName,
      token
    })
  } catch (error) {
     res.status(500).json({
      message: "Error logging with Google: " + error.mesaage
    })
  }
}
