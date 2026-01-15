// services/postService.js
const { Post, Account, PostMedia } = require('../models');
const twitterService = require('./twitterService');
const facebookService = require('./facebookService');
const linkedinService = require('./linkedinService');
const instagramService = require('./instagramService');

const createPost = async ({
  content,
  accountId,
  platformPostId = null,
  postLink = null,
  scheduledAt = null,
  status = 'posted',
  tagIds = [],
}) => {
  const post = await Post.create({
    post_platform_id: platformPostId,
    post_link: postLink,
    content,
    scheduledAt,
    status,
    account_id: accountId,
  });

  if (Array.isArray(tagIds) && tagIds.length > 0) {
    await post.setTags(tagIds);
  }

  return post;
};

/**
 * Execute a post using ONLY database data
 */
const executePost = async (postId) => {
  let post;

  try {
    post = await Post.findByPk(postId, {
      include: [{ model: Account }, { model: PostMedia }],
    });

    if (!post) return;

    const mediaUrls = post.PostMedia.map((m) => m.url);

    let result;

    if (post.Account.platform === 'Facebook') {
      result = await facebookService.postToFacebook({
        accountId: post.account_id,
        text: post.content,
        mediaUrls,
      });
    }

    if (post.Account.platform === 'Twitter') {
      result = await twitterService.postTweet({
        accountId: post.account_id,
        text: post.content,
        mediaUrls, // temp safe
      });
    }

    if (post.Account.platform === 'Linkedin') {
      result = await linkedinService.postToLinkedIn({
        accountId: post.account_id,
        text: post.content,
        mediaUrls,
      });
    }

    if (post.Account.platform === 'Instagram') {
      result = await instagramService.postToInstagram({
        accountId: post.account_id,
        text: post.content,
        mediaUrls,
      });
    }

    await post.update({
      status: 'posted',
      post_platform_id: result.platformPostId,
      post_link: result.postLink,
    });
  } catch (err) {
    console.error('Post execution failed:', err);
    if (post) await post.update({ status: 'failed' });
  }
};


module.exports = {
  createPost,
  executePost,
};
