const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');
const authMiddleware = require('../middleware/authMiddleware');
// Route for creating a new group
router.post('/create', authMiddleware, groupController.createGroup);

// Route for adding an account to a group
router.post('/add-account', groupController.addAccountToGroup);

// Route for removing an account from a group
router.post('/remove-account', groupController.removeAccountFromGroup);

// Route for getting a group with its associated accounts
router.get('/:userId', groupController.getGroupsByUser);

router.get('/find/:groupId', groupController.getGroupById);

module.exports = router;
