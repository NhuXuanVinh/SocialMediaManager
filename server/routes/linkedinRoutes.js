const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/post/linkedin', linkedinController.postToLinkedIn);
module.exports = router;
