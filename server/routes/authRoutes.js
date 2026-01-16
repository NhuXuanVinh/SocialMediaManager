const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

router.get('/protected', authMiddleware, async (req, res) => {
	try {
	  // The user information will be available in `req.user` from the authMiddleware
	  const user = req.user;
	  
	  // You can send back user-specific data, like username or profile data
	  res.json({ message: 'Protected data accessed', user: { username: user.username } });
	} catch (err) {
	  res.status(500).json({ message: 'Error accessing protected data' });
	}
  });

  router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ✅ Logout (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});
module.exports = router;
