const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js')(sequelize);

// Register user (UNCHANGED)
const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  const userExists = await User.findOne({ where: { username } });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) return res.status(400).json({ message: 'Email already used' });

  try {
    const user = new User({ email, username, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ LOGIN USER (COOKIE-BASED)
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ message: 'User does not exist' });

  const passwordCorrect = await user.isValidPassword(password);
  if (!passwordCorrect) return res.status(400).json({ message: 'Wrong password' });

  const payload = { userId: user.id, username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '5h',
  });
  // ✅ SET TOKEN IN COOKIE
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,          // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 5 * 60 * 60 * 1000, // 5 hours
  });

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
    },
  });
};

module.exports = { registerUser, loginUser };
