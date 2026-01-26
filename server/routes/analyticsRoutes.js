const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');
const analyticsController = require('../controllers/analyticsController');

// All analytics are READ-ONLY → allow all workspace members
router.get(
  '/analytics/overview',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin', 'publisher', 'editor']),
  analyticsController.getOverview
);

router.get(
  '/analytics/trends',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin', 'publisher', 'editor']),
  analyticsController.getTrends
);

router.get(
  '/analytics/accounts',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin', 'publisher', 'editor']),
  analyticsController.getAccountsComparison
);

router.get(
  '/analytics/top-posts',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin', 'publisher', 'editor']),
  analyticsController.getTopPosts
);

router.get(
  '/top-tags',
  authMiddleware,
  requireWorkspaceRole(['owner', 'admin', 'publisher', 'editor']),
   analyticsController.getTopTags);


module.exports = router;
