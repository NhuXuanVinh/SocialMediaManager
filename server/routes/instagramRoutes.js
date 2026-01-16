const express = require('express');
const router = express.Router();
const instagramController = require('../services/instagramService');
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

router.post('/post/instagram', instagramController.postToInstagram);
router.post('/auth/instagram', authMiddleware, requireWorkspaceRole(['admin', 'owner']), instagramController.startInstagramAuth);
router.get('/auth/instagram/callback', instagramController.instagramCallback);
module.exports = router;
