const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

router.get('/account/get-accounts/:userId', authMiddleware, accountController.getAccountsByUser);

router.delete('/account/:accountId', authMiddleware, requireWorkspaceRole(['admin', 'owner']), accountController.deleteAccount);
module.exports = router