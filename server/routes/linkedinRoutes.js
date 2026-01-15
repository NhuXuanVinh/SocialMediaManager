const express = require('express');
const router = express.Router();
const linkedinController = require('../services/linkedinService')
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

router.post('/post/linkedin', linkedinController.postToLinkedIn);
router.post('/auth/linkedin',authMiddleware, requireWorkspaceRole(['admin', 'owner']), linkedinController.startLinkedInAuth);
router.get('/auth/linkedin/callback', linkedinController.linkedinCallback);
module.exports = router;
