const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: false,       // set true in production (HTTPS)
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });

    return res.status(201).json({ message: 'Registered successfully', userId: user._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { userId: user._id, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return res
      .cookie(COOKIE_NAME, refreshToken, COOKIE_OPTS)
      .json({
        accessToken,
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
      });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ error: 'Refresh token invalid or reused' });
    }

    const accessToken = signAccess({ userId: user._id, role: user.role });
    return res.json({ accessToken });
  } catch {
    return res.status(403).json({ error: 'Refresh token expired or invalid' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
      }
    } catch {
      // token already invalid — still clear the cookie
    }
  }
  return res.clearCookie(COOKIE_NAME).json({ message: 'Logged out' });
};

// GET /api/auth/me  (protected)
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });   // toJSON() strips password + refreshTokens
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
