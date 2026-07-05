const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

// @POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateCode()
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    const user = await User.create({
      name, email, passwordHash,
      verificationCode: code,
      verificationCodeExpiry: expiry
    });

    await sendVerificationEmail(email, name, code)

    res.status(201).json({ message: 'Verification code sent', email, userId: user._id })
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// @POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isEmailVerified) return res.status(400).json({ message: 'Already verified' })
    if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid code' })
    if (new Date() > user.verificationCodeExpiry) return res.status(400).json({ message: 'Code expired' })

    user.isEmailVerified = true
    user.verificationCode = null
    user.verificationCodeExpiry = null
    await user.save()

    const token = generateToken(user._id)
    setCookie(res, token)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      defaultResponseStyle: user.defaultResponseStyle,
      language: user.language,
      onboardingCompleted: user.onboardingCompleted
    })
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message })
  }
}

// @POST /api/auth/resend-code
const resendCode = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isEmailVerified) return res.status(400).json({ message: 'Already verified' })

    const code = generateCode()
    user.verificationCode = code
    user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendVerificationEmail(email, user.name, code)
    res.json({ message: 'Code resent' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend code' })
  }
}

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      const code = generateCode()
      user.verificationCode = code
      user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await user.save()
      await sendVerificationEmail(email, user.name, code)
      return res.status(403).json({ message: 'Email not verified', email, needsVerification: true })
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      defaultResponseStyle: user.defaultResponseStyle,
      language: user.language,
      onboardingCompleted: user.onboardingCompleted
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.json({ message: 'If that email exists, a code was sent' })

    const code = generateCode()
    user.passwordResetCode = code
    user.passwordResetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendPasswordResetEmail(email, user.name, code)
    res.json({ message: 'Reset code sent', email })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset code' })
  }
}

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.passwordResetCode !== code) return res.status(400).json({ message: 'Invalid code' })
    if (new Date() > user.passwordResetCodeExpiry) return res.status(400).json({ message: 'Code expired' })
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.passwordResetCode = null
    user.passwordResetCodeExpiry = null
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' })
  }
}

// @POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { signup, login, logout, getMe, verifyEmail, resendCode, forgotPassword, resetPassword };