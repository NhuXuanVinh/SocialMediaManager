const express = require('express');
const router = express.Router();
const {
  createTag,
  updateTag,
  deleteTag,
  getTags,
} = require('../controllers/tagController');

// Read (list + search + usage count)
router.get('/tags', getTags);
// Create
router.post('/tags', createTag);

// Edit
router.put('/tags/:id', updateTag);

// Delete
router.delete('/tags/:id', deleteTag);

module.exports = router;
