const express = require('express');
const router = express.Router();
const {
  getWorkspaceMembers,
  addWorkspaceMember,
  getAccountsByWorkspace,
  getGroupsByWorkspace,
  getMyWorkspaces,
  getMyWorkspaceRole,
  updateMemberRole,
  removeMember,
} = require('../controllers/workspaceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');

router.get(
  '/workspaces/:workspaceId/members',
  authMiddleware,
  getWorkspaceMembers
);

router.post(
  '/workspaces/:workspaceId/members',
  authMiddleware,
  requireWorkspaceRole(['admin', 'owner']),
  addWorkspaceMember
);

router.get(
  '/workspaces/:workspaceId/accounts',
  authMiddleware,
  getAccountsByWorkspace
);

router.get(
  '/workspaces/:workspaceId/groups',
  authMiddleware,
  getGroupsByWorkspace
);

router.get('/workspaces/me', authMiddleware, getMyWorkspaces);

router.get(
  '/workspaces/:workspaceId/me',
  authMiddleware,
  getMyWorkspaceRole
);

router.patch(
  '/workspaces/:workspaceId/members/:memberId',
  authMiddleware,
  requireWorkspaceRole(['admin', 'owner']),
  updateMemberRole
);

router.delete(
  '/workspaces/:workspaceId/members/:memberId',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin']),
  removeMember
);

module.exports = router;
