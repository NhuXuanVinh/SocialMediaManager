const { Post, PostTag } = require('../models');
const twitterController = require('../controllers/twitterController');
const facebookController = require('../controllers/facebookController');
const linkedinController = require('../controllers/linkedinController');
/**
 * Create a post (tags optional)
 */
const createPost = async ({
  content,
  accountId,
  platformPostId = null,
  postLink = null,
  scheduledAt = null,
  status = 'posted',
  tagIds = [],
}) => {
  // 1️⃣ Create post
  const post = await Post.create({
    post_platform_id: platformPostId,
    post_link: postLink,
    content,
    scheduledAt,
    status,
    account_id: accountId,
  });

  // 2️⃣ Attach tags (optional)
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await PostTag.bulkCreate(
      tagIds.map((tagId) => ({
        post_id: post.post_id,
        tag_id: tagId,
      }))
    );
  }

  return post;
};

const executePost = async (postId, files) => {
  try {
      const post = await Post.findByPk(postId, {
        include: [{ model: Account }],
      });

  if (!post) {
    console.warn('Post not found:', postId);
    return;
  }
  const account = post.Account;
    let result; 

    if (account.platform === 'Twitter') {
      result = await twitterController.postTweet({
        accountId: account.account_id,
        text: post.content,
        files,
      });
    }

    if (account.platform === 'Facebook') {
      result = await facebookController.postToFacebook({
        accountId: account.account_id,
        text: post.content,
        files,
      });
    }

    if (account.platform === 'Linkedin') {
      result = await linkedinController.postToLinkedIn({
        accountId: account.account_id,
        text: post.content,
        files,
      });
    }

    // ✅ UPDATE existing post
    await post.update({
      status: 'posted',
      post_platform_id: result.platformPostId,
      post_link: result.postLink,
    });
  } catch (err) {
    console.error('Post execution failed:', err.message);

    await post.update({
      status: 'failed',
    });
  }
};


module.exports = {
  createPost,
  executePost,
};
