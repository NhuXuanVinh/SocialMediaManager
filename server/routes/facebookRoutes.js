const express = require('express');
const router = express.Router();
const facebookController = require('../services/facebookService');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/post/facebook', facebookController.postToFacebook);
router.post('/auth/facebook', facebookController.startFacebookAuth);
router.get('/auth/facebook/callback', facebookController.facebookCallback);
module.exports = router;
