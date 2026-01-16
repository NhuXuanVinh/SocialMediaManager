const express = require('express');
const router = express.Router();
const twitterController = require('../services/twitterService');
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

// Route to start OAuth flow
router.post('/auth/twitter',authMiddleware, requireWorkspaceRole(['admin', 'owner']), twitterController.startOAuthFlow);

// Callback route after Twitter authorization
router.get('/auth/twitter/callback',twitterController.handleOAuthCallback);

router.post('/post/twitter', twitterController.postTweet);
module.exports = router;
