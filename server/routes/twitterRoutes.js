const express = require('express');
const router = express.Router();
const twitterController = require('../services/twitterService');
const authMiddleware = require('../middleware/authMiddleware');

// Route to start OAuth flow
router.post('/auth/twitter',authMiddleware, twitterController.startOAuthFlow);

// Callback route after Twitter authorization
router.get('/auth/twitter/callback',twitterController.handleOAuthCallback);

router.post('/post/twitter', twitterController.postTweet);
module.exports = router;
