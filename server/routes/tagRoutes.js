const express = require('express');
const router = express.Router();
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tagController');

// Read (list + search + usage count)
router.get(
  '/tags',
  authMiddleware,
  requireWorkspaceRole(['owner','admin', 'publisher', 'editor']),
  getTags
);

// Create
router.post(
  '/tags',
  authMiddleware,
  requireWorkspaceRole(['admin', 'owner']),
  createTag
);

// Update
router.put(
  '/tags/:id',
  authMiddleware,
  requireWorkspaceRole(['admin', 'owner']),
  updateTag
);

// Delete
router.delete(
  '/tags/:id',
  authMiddleware,
  requireWorkspaceRole(['admin', 'owner']),
  deleteTag
);

module.exports = router;
