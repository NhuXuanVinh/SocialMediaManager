const nodeSchedule = require('node-schedule');
const { Post, Account, PostMedia } = require('../models');
const { uploadFilesToCloudinary } = require('../services/mediaService');
const { createPost, executePost } = require('../services/postService');
const { schedulePostJob, cancelPostJob } = require('../utils/postScheduler');

const isPastDate = (date) => {
  if (!date) return false;
  return new Date(date).getTime() <= Date.now();
};


/* =========================================================
   CREATE / REQUEST / PUBLISH POST
========================================================= */
const handlePost = async (req, res) => {
  try {
    const { text, postType, scheduledTime } = req.body;
    const role = req.workspace.role; // injected by middleware
    console.log('Workspace Role:', role);
    let tagIds = [];
    if (req.body.tagIds) {
      try {
        tagIds = JSON.parse(req.body.tagIds).map(Number);
      } catch {
        tagIds = [];
      }
    }

    const accounts = JSON.parse(req.body.accounts || '[]');
    let media = [];

if (req.body.media) {
  try {
    media = JSON.parse(req.body.media);
  } catch {
    media = [];
  }
}


    if (!text) {
      return res.status(400).json({ message: 'Post content required' });
    }

    if (!accounts.length) {
      return res.status(400).json({ message: 'Select at least one account' });
    }

    // 🔐 Permission logic
    const isPublisher = ['publisher', 'admin', 'owner'].includes(role);

    if (!isPublisher && ['post', 'schedule'].includes(postType)) {
      return res.status(403).json({
        message: 'You must request approval',
      });
    }

    if (postType === 'schedule' && !scheduledTime && isPublisher) {
      return res.status(400).json({ message: 'Scheduled time required' });
    }

    if (postType === 'schedule' && !scheduledTime && isPublisher) {
  return res.status(400).json({ message: 'Scheduled time required' });
}


    /* -----------------------------
       Upload media ONCE
    ------------------------------ */

    for (const account of accounts) {
      /* -----------------------------
         Decide status
      ------------------------------ */
      let status = 'draft';

      if (postType === 'request') status = 'pending';
      if (postType === 'draft') status = 'draft';

      if (isPublisher) {
        if (postType === 'post') status = 'posting';
        if (postType === 'schedule') status = 'scheduled';
      }

      /* -----------------------------
         Create post
      ------------------------------ */
      const post = await createPost({
        content: text,
        accountId: account.account_id,
        status,
        scheduledAt: scheduledTime ? scheduledTime : null,
        tagIds,
      });

      /* -----------------------------
         Save media
      ------------------------------ */
      if (media.length) {
  await PostMedia.bulkCreate(
    media.map((m) => ({
      post_id: post.post_id,
      url: m.url,
      public_id: m.publicId,
      type: 'image',
      width: m.width,
      height: m.height,
      format: m.format,
    }))
  );
}

      /* -----------------------------
         Execute or schedule
      ------------------------------ */
      if (status === 'posting') {
        await executePost(post.post_id);
      }

      if (status === 'scheduled') {
        nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
          await post.update({ status: 'posting' });
          executePost(post.post_id);
        });
      }
    }

    return res.json({
      success: true,
      message:
        postType === 'request'
          ? 'Post submitted for approval'
          : postType === 'draft'
          ? 'Draft saved'
          : postType === 'schedule'
          ? 'Post scheduled'
          : 'Post published',
    });
  } catch (err) {
    console.error('[handlePost]', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

/* =========================================================
   UPDATE DRAFT / SCHEDULED POST
========================================================= */

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, scheduledAt, tagIds = [], media } = req.body; // ✅ media added

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

        /* ----------------------------------------
       ✅ Special rule: allow editing tags only
       even when status is 'posted'
    ---------------------------------------- */
    if (post.status === 'posted') {
      // If user tries to edit anything other than tags → reject
      const triedEditContent =
        (typeof text !== 'undefined' && text !== post.content) ||
        typeof scheduledAt !== 'undefined' ||
        Array.isArray(media);

      if (triedEditContent) {
        return res.status(400).json({
          message: 'Posted posts can only update tags',
        });
      }

      if (Array.isArray(tagIds)) {
        await post.setTags(tagIds.map(Number));
      }

      return res.json({ message: 'Tags updated successfully' });
    }

    // only allow ed  iting these
    if (!['draft', 'scheduled', 'pending'].includes(post.status)) {
      return res.status(400).json({
        message: 'Only draft, scheduled, or pending posts can be edited',
      });
    }

    // normalize
    const newScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    const oldScheduledAt = post.scheduledAt ? new Date(post.scheduledAt) : null;

    // detect if scheduled time changed
    const scheduledChanged =
      (newScheduledAt && !oldScheduledAt) ||
      (!newScheduledAt && oldScheduledAt) ||
      (newScheduledAt &&
        oldScheduledAt &&
        newScheduledAt.getTime() !== oldScheduledAt.getTime());

    /* -----------------------------
       1) Update DB fields
    ------------------------------ */
    await post.update({
      content: text ?? post.content,
      scheduledAt: newScheduledAt,
    });

    // Update tags
    if (Array.isArray(tagIds)) {
      await post.setTags(tagIds.map(Number));
    }

    /* -----------------------------
       ✅ 1.5) Update images (PostMedia)
       - If media is provided -> replace existing images
    ------------------------------ */
    if (Array.isArray(media)) {
      // Delete old media rows
      await PostMedia.destroy({
        where: { post_id: post.post_id },
      });

      // Insert new media rows
      if (media.length > 0) {
        await PostMedia.bulkCreate(
          media.map((m) => ({
            post_id: post.post_id,
            url: m.url,
            public_id: m.publicId || m.public_id, // ✅ support both
            type: m.type || 'image',
            width: m.width || null,
            height: m.height || null,
            format: m.format || null,
          }))
        );
      }
    }

    /* -----------------------------
       2) Scheduling logic
       - draft/pending: DB only ✅
       - scheduled: reschedule ✅
    ------------------------------ */

    // If scheduled post is edited & time changed => reschedule
    if (post.status === 'scheduled' && scheduledChanged) {
      // user removed date => cancel schedule
      if (!newScheduledAt) {
        cancelPostJob(post.post_id);

        await post.update({
          status: 'draft',
        });

        return res.json({ message: 'Scheduled post canceled' });
      }

      // user updated time => reschedule
      schedulePostJob(post.post_id, newScheduledAt, async () => {
        try {
          await post.update({ status: 'posting' });
          await executePost(post.post_id);
        } catch (err) {
          console.error('[Rescheduled Post Execution Error]', err);
          await post.update({ status: 'failed' });
        }
      });

      return res.json({ message: 'Post rescheduled' });
    }

    // draft/pending edit: just DB changes
    return res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error('[updatePost]', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};


const transitionPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const role = req.workspace.role;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    /* -------------------------
       EDITOR: draft → pending
    -------------------------- */
    if (role === 'editor') {
      if (post.status !== 'draft') {
        return res.status(403).json({ message: 'Not allowed' });
      }

      await post.update({ status: 'pending' });
      return res.json({ message: 'Post sent for approval' });
    }

    /* -------------------------
       PUBLISHER+:
       draft | pending → scheduled | posting
    -------------------------- */
    if (!['publisher', 'admin', 'owner'].includes(role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (!['draft', 'pending'].includes(post.status)) {
      return res.status(400).json({ message: 'Invalid post state' });
    }

    // 🕒 scheduled
    if (post.scheduledAt) {
      await post.update({ status: 'scheduled' });

      nodeSchedule.scheduleJob(new Date(post.scheduledAt), async () => {
        try {
          await post.update({ status: 'posting' });
          await executePost(post.post_id);
        } catch (err) {
          console.error('[Scheduled Post Execution Error]', err);
          await post.update({ status: 'failed' });
        }
      });

      return res.json({ message: 'Post scheduled' });
    }

    // 🚀 post now
    await post.update({ status: 'posting' });
    executePost(post.post_id);

    return res.json({ message: 'Post published' });
  } catch (err) {
    console.error('[TransitionPost Error]', err);
    return res.status(500).json({
      message: 'Failed to transition post',
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const role = req.workspace.role; // injected middleware

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // ✅ Permission rules:
    // - editor: can delete draft/pending
    // - publisher/admin/owner: can delete draft/pending/scheduled
    const isPublisher = ['publisher', 'admin', 'owner'].includes(role);

    const allowedStatuses = isPublisher
      ? ['draft', 'pending', 'scheduled']
      : role === 'editor'
      ? ['draft', 'pending']
      : [];

    if (!allowedStatuses.includes(post.status)) {
      return res.status(403).json({
        message: 'Not allowed to delete this post',
      });
    }

    // ✅ If scheduled, cancel the scheduled job
    if (post.status === 'scheduled' && typeof cancelPostJob === 'function') {
      cancelPostJob(post.post_id);
    }

    // ✅ Remove media rows
    await PostMedia.destroy({
      where: { post_id: post.post_id },
    });

    // ✅ Remove tag relations (through table)
    // If your Post has belongsToMany Tag association
    if (typeof post.setTags === 'function') {
      await post.setTags([]);
    }

    // ✅ Delete post
    await post.destroy();

    return res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    console.error('[deletePost]', err);
    return res.status(500).json({
      message: 'Failed to delete post',
    });
  }
};

module.exports = {
  deletePost,
};


module.exports = {
  handlePost,
  updatePost,
  transitionPost,
  deletePost,
};
