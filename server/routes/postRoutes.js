const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const requireWorkspaceRole = require('../middleware/requireWorkspaceRole');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/post', authMiddleware, upload.array('media'), requireWorkspaceRole(['editor','publisher', 'admin', 'owner']), postController.handlePost);
router.put('/post/:postId', authMiddleware, requireWorkspaceRole(['editor', 'publisher', 'admin', 'owner']), postController.updatePost);
router.patch(
  '/posts/:postId/action',
  authMiddleware,
  requireWorkspaceRole(['editor', 'publisher', 'admin', 'owner']),
  postController.transitionPost
);

router.delete(
  '/post/:postId',
  authMiddleware,
  requireWorkspaceRole(['editor', 'publisher', 'admin', 'owner']),
  postController.deletePost
);
module.exports = router;
