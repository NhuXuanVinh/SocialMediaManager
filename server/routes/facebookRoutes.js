const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/post/facebook', facebookController.postToFacebook);
router.get('/post/facebook/insights', facebookController.getFacebookPostInsights)
router.post('/auth/facebook', authMiddleware, facebookController.startFacebookAuth);
router.get('/auth/facebook/callback', facebookController.facebookCallback);
module.exports = router;
