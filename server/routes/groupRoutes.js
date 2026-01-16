const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');
const authMiddleware = require('../middleware/authMiddleware');
// Route for creating a new group

// 🔥 CREATE GROUP IN WORKSPACE
router.post('/workspaces/:workspaceId/groups',authMiddleware, requireWorkspaceRole(['admin', 'owner']), groupController.createGroup);


// GET GROUP BY ID
router.get('/groups/:groupId',authMiddleware, groupController.getGroupById);

// ADD ACCOUNT TO GROUP
router.post('/groups/:groupId/accounts/:accountId', authMiddleware, requireWorkspaceRole(['admin', 'owner']), groupController.addAccountToGroup);

// REMOVE ACCOUNT FROM GROUP
router.delete('/groups/:groupId/accounts/:accountId', authMiddleware, requireWorkspaceRole(['admin', 'owner']), groupController.removeAccountFromGroup);

router.get('/groups/:groupId/accounts', authMiddleware, groupController.getAccountsByGroup);

// DELETE GROUP
router.delete('/group/:groupId', authMiddleware, requireWorkspaceRole(['admin', 'owner']), groupController.deleteGroup);
module.exports = router;
