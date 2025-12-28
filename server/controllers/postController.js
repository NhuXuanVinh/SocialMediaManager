const nodeSchedule = require('node-schedule');
const { Post, Account, Tag, PostMedia } = require('../models');
const { uploadFilesToCloudinary } = require('../services/mediaService');
const { createPost, executePost } = require('../services/postService');

const handlePost = async (req, res) => {
  try {
    const { text, postType, scheduledTime } = req.body;

    let tagIds = [];
    if (req.body.tagIds) {
      try {
        tagIds = JSON.parse(req.body.tagIds).map(Number);
      } catch {
        tagIds = [];
      }
    }

    const accounts = JSON.parse(req.body.accounts || '[]');
    const files = req.files || [];

    if (!text) {
      return res.status(400).json({ success: false, message: 'Post content required' });
    }

    if (accounts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one account is required',
      });
    }

    if (postType === 'schedule' && !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time is required',
      });
    }

    // ✅ 1️⃣ Upload media ONCE
    const uploads = await uploadFilesToCloudinary(files, {
      folder: 'posts',
    });

    for (const account of accounts) {
      // ✅ 2️⃣ Create post
      const post = await createPost({
        content: text,
        accountId: account.account_id,
        status:
          postType === 'draft'
            ? 'draft'
            : postType === 'schedule'
            ? 'scheduled'
            : 'posting',
        scheduledAt: postType === 'schedule' ? scheduledTime : null,
        tagIds,
      });

      // ✅ 3️⃣ Save media records
      if (uploads.length > 0) {
        await PostMedia.bulkCreate(
          uploads.map((u) => ({
            post_id: post.post_id,
            url: u.url,
            public_id: u.publicId,
            type: 'image',
            width: u.width,
            height: u.height,
            format: u.format,
          }))
        );
      }

      // ✅ 4️⃣ Execute or schedule
      if (postType === 'now') {
        executePost(post.post_id); // fire & forget
      }

      if (postType === 'schedule') {
        nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
          await post.update({ status: 'posting' });
          await executePost(post.post_id);
        });
      }
    }

    return res.json({
      success: true,
      message:
        postType === 'draft'
          ? 'Draft saved'
          : postType === 'schedule'
          ? 'Post scheduled successfully'
          : 'Post is being published',
    });
  } catch (error) {
    console.error('Handle post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating post',
    });
  }
};



const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, scheduledAt, tagIds = [] } = req.body;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (!['scheduled', 'draft'].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only draft or scheduled posts can be edited',
      });
    }

    // 1️⃣ Update core fields
    await post.update({
      content: text ?? post.content,
      scheduledAt:
        post.status === 'scheduled'
          ? scheduledAt ?? post.scheduledAt
          : null,
    });

    // 2️⃣ Update tags (replace strategy)
    if (Array.isArray(tagIds)) {
      await post.setTags(tagIds.map(Number));
    }

    return res.json({
      success: true,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Update scheduled post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update post',
    });
  }
};

module.exports = {
  handlePost,
  updatePost,
};
