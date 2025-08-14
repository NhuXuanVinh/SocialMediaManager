const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/post/linkedin', linkedinController.postToLinkedIn);
router.post('/auth/linkedin', authMiddleware, linkedinController.startLinkedInAuth);
router.get('/auth/linkedin/callback', linkedinController.linkedinCallback);
module.exports = router;
