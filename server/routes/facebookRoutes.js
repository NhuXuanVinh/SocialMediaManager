const express = require('express');
const router = express.Router();
const facebookController = require('../services/facebookService');
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

router.post('/post/facebook', facebookController.postToFacebook);
router.post('/auth/facebook', authMiddleware, requireWorkspaceRole(['admin', 'owner']), facebookController.startFacebookAuth);
router.get('/auth/facebook/callback', facebookController.facebookCallback);
module.exports = router;
