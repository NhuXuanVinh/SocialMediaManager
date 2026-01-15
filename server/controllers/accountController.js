const {
  Account,
  AccountGroup,
  TwitterAccount,
  FacebookAccount,
  LinkedinAccount,
  InstagramAccount,
  Post,
  PostTag,
  PostMedia,
  sequelize,
} = require('../models');
const getAccountsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const accounts = await Account.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Post,
          include: [
            // 🔹 Tags
            {
              model: Tag,
              through: { attributes: [] }, // hide PostTag join table
              attributes: ['tag_id', 'name', 'color'],
            },
            // 🔹 Media
            {
              model: PostMedia,
              attributes: [
                'media_id',
                'url',
                'type',
                'width',
                'height',
                'format',
              ],
            },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [Post, 'createdAt', 'DESC'],
      ],
    });

    return res.status(200).json({
      accounts: accounts || [],
    });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({
      message: 'Error fetching accounts',
    });
  }
};


const deleteAccount = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { accountId } = req.params;
    const { workspaceId } = req.body;
    const role = req.workspace?.role; // injected by middleware

    if (!workspaceId) {
      await t.rollback();
      return res.status(400).json({ message: 'workspaceId is required' });
    }

    // 🔐 permission
    const isPublisher = ['admin', 'owner'].includes(role);
    if (!isPublisher) {
      await t.rollback();
      return res.status(403).json({ message: 'Not allowed' });
    }

    // ✅ workspace safe lookup
    const account = await Account.findOne({
      where: {
        account_id: accountId,
        workspace_id: workspaceId,
      },
      transaction: t,
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({ message: 'Account not found' });
    }

    /* -----------------------------
       1) Delete platform token row
    ------------------------------ */
    const platform = (account.platform || '').toLowerCase();

    if (platform === 'twitter') {
      await TwitterAccount.destroy({
        where: { account_id: accountId },
        transaction: t,
      });
    }

    if (platform === 'facebook') {
      await FacebookAccount.destroy({
        where: { account_id: accountId },
        transaction: t,
      });
    }

    if (platform === 'linkedin') {
      await LinkedinAccount.destroy({
        where: { account_id: accountId },
        transaction: t,
      });
    }

    if (platform === 'instagram') {
      await InstagramAccount.destroy({
        where: { account_id: accountId },
        transaction: t,
      });
    }

    /* -----------------------------
       2) Remove from groups
    ------------------------------ */
    await AccountGroup.destroy({
      where: { account_id: accountId },
      transaction: t,
    });

    /* -----------------------------
       3) Delete posts & related data
    ------------------------------ */
    const posts = await Post.findAll({
      where: { account_id: accountId },
      attributes: ['post_id'],
      transaction: t,
    });

    const postIds = posts.map((p) => p.post_id);

    if (postIds.length > 0) {
      await PostMedia.destroy({
        where: { post_id: postIds },
        transaction: t,
      });

      await PostTag.destroy({
        where: { post_id: postIds },
        transaction: t,
      });

      await Post.destroy({
        where: { post_id: postIds },
        transaction: t,
      });
    }

    /* -----------------------------
       4) Delete account
    ------------------------------ */
    await Account.destroy({
      where: { account_id: accountId },
      transaction: t,
    });

    await t.commit();

    return res.json({
      success: true,
      message: 'Account disconnected successfully',
    });
  } catch (err) {
    console.error('[deleteAccount]', err);
    await t.rollback();
    return res.status(500).json({ message: 'Failed to remove account' });
  }
};
module.exports = {
  getAccountsByUser,
  deleteAccount
};
