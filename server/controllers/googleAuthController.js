const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

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

// @GET /api/auth/google
// Redirects the browser to Google's consent screen
const initiateGoogleAuth = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['profile', 'email'],
    prompt: 'select_account'
  });
  res.redirect(url);
};

// @GET /api/auth/google/callback
// Google redirects here with a ?code=... query param
const googleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    // Exchange the code for tokens
    const { tokens } = await client.getToken(code);

    // Verify the ID token and pull out the payload
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, email_verified, name, picture } = payload;

    // Never trust an unverified email for account linking or creation
    if (!email_verified) {
      return res.redirect(`${clientUrl}/login?error=google_email_unverified`);
    }

    // 1. Existing Google user -> log them in
    let user = await User.findOne({ googleId });

    // 2. No Google user yet, but email matches an existing local account -> link
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    }

    // 3. No user at all -> create a new Google-only account
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isEmailVerified: true,
        avatar: picture || ''
      });
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    const destination = user.onboardingCompleted ? '/chat' : '/onboarding';
    res.redirect(`${clientUrl}${destination}`);
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.redirect(`${clientUrl}/login?error=google_auth_failed`);
  }
};

module.exports = { initiateGoogleAuth, googleCallback };