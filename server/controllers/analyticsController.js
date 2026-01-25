const { Op, fn, col, literal } = require('sequelize');
const { PostInsight, Post, Account } = require('../models');

/* ------------------------------------------------
   Helper: resolve date range
------------------------------------------------- */
const resolveRange = (range = '7d') => {
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
  const from = new Date();
  from.setDate(from.getDate() - days);
  return from;
};

/* ------------------------------------------------
   Helper: build account filter
------------------------------------------------- */
const buildAccountFilter = ({ accountId, accountIds }) => {
  if (accountId) return { '$Post.account_id$': accountId };
  if (accountIds?.length) return { '$Post.account_id$': { [Op.in]: accountIds } };
  return {};
};

/* =================================================
   1️⃣ Overview KPIs
================================================= */
exports.getOverview = async (req, res) => {
  try {
    const { workspaceId, range, accountId, accountIds } = req.query;
    const fromDate = resolveRange(range);

    const where = {
      captured_at: { [Op.gte]: fromDate },
      ...buildAccountFilter({ accountId, accountIds }),
      captured_at: {
        [Op.in]: literal(`(
          SELECT MAX(pi2.captured_at)
          FROM post_insights pi2
          WHERE pi2.post_id = "PostInsight".post_id
        )`),
      },
    };

    const result = await PostInsight.findOne({
      attributes: [
        [fn('SUM', col('impressions')), 'impressions'],
        [fn('SUM', col('likes')), 'likes'],
        [fn('SUM', col('comments')), 'comments'],
        [fn('SUM', col('shares')), 'shares'],
      ],
      where,
      include: [
        {
          model: Post,
          attributes: [],
          required: true,
          include: [
            {
              model: Account,
              attributes: [],
              where: { workspace_id: workspaceId },
              required: true,
            },
          ],
        },
      ],
      raw: true,
    });

    res.json({
      impressions: Number(result?.impressions || 0),
      likes: Number(result?.likes || 0),
      comments: Number(result?.comments || 0),
      shares: Number(result?.shares || 0),
    });
  } catch (err) {
    console.error('[Analytics Overview]', err);
    res.status(500).json({ message: 'Failed to load overview' });
  }
};

/* =================================================
   2️⃣ Engagement Trends (time series)
================================================= */
exports.getTrends = async (req, res) => {
  try {
    const { workspaceId, range, accountId, accountIds } = req.query;
    const fromDate = resolveRange(range);

    const where = {
      captured_at: { [Op.gte]: fromDate },
      ...buildAccountFilter({ accountId, accountIds }),
    };

    const rows = await PostInsight.findAll({
      attributes: [
        [fn('DATE', col('captured_at')), 'date'],
        [fn('SUM', col('impressions')), 'impressions'],
        [fn('SUM', col('likes')), 'likes'],
        [fn('SUM', col('comments')), 'comments'],
        [fn('SUM', col('shares')), 'shares'],
      ],
      where,
      include: [
        {
          model: Post,
          attributes: [],
          required: true,
          include: [
            {
              model: Account,
              attributes: [],
              where: { workspace_id: workspaceId },
              required: true,
            },
          ],
        },
      ],
      group: [fn('DATE', col('captured_at'))],
      order: [[fn('DATE', col('captured_at')), 'ASC']],
      raw: true,
    });

    res.json(rows);
  } catch (err) {
    console.error('[Analytics Trends]', err);
    res.status(500).json({ message: 'Failed to load trends' });
  }
};

/* =================================================
   3️⃣ Account Comparison
================================================= */
exports.getAccountsComparison = async (req, res) => {
  try {
    const { workspaceId, range, accountId, accountIds } = req.query;
    const fromDate = resolveRange(range);

    const where = {
      ...buildAccountFilter({ accountId, accountIds }),
      captured_at: {
        [Op.eq]: literal(`(
          SELECT MAX(pi2.captured_at)
          FROM post_insights pi2
          WHERE
            pi2.post_id = "PostInsight"."post_id"
            AND pi2.captured_at >= '${fromDate.toISOString()}'
        )`),
      },
    };

    const rows = await PostInsight.findAll({
      attributes: [
        [col('Post.Account.account_id'), 'account_id'],
        [col('Post.Account.account_name'), 'account_name'],
        [fn('SUM', col('impressions')), 'impressions'],
        [fn('SUM', col('likes')), 'likes'],
        [fn('SUM', col('comments')), 'comments'],
        [fn('SUM', col('shares')), 'shares'],
      ],
      where,
      include: [
        {
          model: Post,
          attributes: [],
          required: true,
          include: [
            {
              model: Account,
              attributes: [],
              where: { workspace_id: workspaceId },
              required: true,
            },
          ],
        },
      ],
      group: [
        col('Post.Account.account_id'),
        col('Post.Account.account_name'),
      ],
      raw: true,
    });

    res.json(rows);
  } catch (err) {
    console.error('[Analytics Accounts]', err);
    res.status(500).json({ message: 'Failed to load account analytics' });
  }
};

/* =================================================
   4️⃣ Top Performing Posts
================================================= */
exports.getTopPosts = async (req, res) => {
  try {
    const { workspaceId, range, accountId, accountIds } = req.query;
    const fromDate = resolveRange(range);

    const where = {
      ...buildAccountFilter({ accountId, accountIds }),
      captured_at: {
        [Op.eq]: literal(`(
          SELECT MAX(pi2.captured_at)
          FROM post_insights pi2
          WHERE
            pi2.post_id = "PostInsight"."post_id"
            AND pi2.captured_at >= '${fromDate.toISOString()}'
        )`),
      },
    };

    const rows = await PostInsight.findAll({
      attributes: ['post_id', 'impressions', 'likes', 'comments', 'shares'],
      where,
      include: [
        {
          model: Post,
          required: true,
          attributes: ['content', 'post_link'],
          include: [
            {
              model: Account,
              required: true,
              attributes: ['account_id', 'account_name', 'platform'],
              where: { workspace_id: workspaceId },
            },
          ],
        },
      ],
      order: [['impressions', 'DESC']],
      limit: 10,
      raw: true,
      nest: true,
    });

    res.json(rows);
  } catch (err) {
    console.error('[Analytics Top Posts]', err);
    res.status(500).json({ message: 'Failed to load top posts' });
  }
};
