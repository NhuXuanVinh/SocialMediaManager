const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/post',upload.array('media'), postController.handlePost);
module.exports = router;
