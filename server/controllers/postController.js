const nodeSchedule = require('node-schedule');
const { Post, Account, Tag } = require('../models');

const twitterController = require('./twitterController');
const linkedinController = require('./linkedinController');
const facebookController = require('./facebookController');
const { createPost, executePost } = require('../services/postService');

const handlePost = async (req, res) => {
  try {
   const text = req.body.text;
const postType = req.body.postType;
const scheduledTime = req.body.scheduledTime;

let tagIds = [];
if (req.body.tagIds) {
  try {
    tagIds = JSON.parse(req.body.tagIds).map(Number);
  } catch {
    tagIds = [];
  }
}
    

    const accounts = JSON.parse(req.body.accounts);
    const files = req.files;
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
    console.log('Received post request:', {
      text,
      postType,
      scheduledTime,
    });

    if(postType === "draft"){
      for (const account of accounts) {
       await createPost({
        content: text,
        status: 'draft',
        scheduledAt: null,
        accountId: account.account_id, 
        tagIds,
      });
    }
    }

      // -----------------------------
      // POST NOW
      // -----------------------------
    if (postType === 'now') {
      for (const account of accounts) {
        const post = await createPost({
          content: text,
          accountId: account.account_id,
          status: 'posting',
          scheduledAt: null,
          tagIds,
        });
        const postId = post.post_id;
        executePost(postId, files); // fire & forget
      }

      return res.json({
        success: true,
        message: 'Post is being published',
      });
    }

      // -----------------------------
      // SCHEDULE POST
      // -----------------------------
if (postType === 'schedule') {
      for (const account of accounts) {
        const post = await createPost({
          content: text,
          accountId: account.account_id,
          status: 'scheduled',
          scheduledAt: scheduledTime,
          tagIds,
        });
        const postId = post.post_id;

        nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
          console.log('Executing scheduled post:', post.post_id);
          await post.update({ status: 'posting' });
          await executePost(postId, files);
        });
      }

      return res.json({
        success: true,
        message: 'Post scheduled successfully',
      });
    }
    

    return res.status(200).json({
      success: true,
      message: 'Post request processed successfully',
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
