const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/get-accounts/:userId', authMiddleware, accountController.getAccountsByUser);

module.exports = router