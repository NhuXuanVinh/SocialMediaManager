const axios = require('axios');
const {
  InstagramAccount,
  Account,
  Post,
  PostInsight,
} = require('../models');

require('dotenv').config();

const GRAPH_VERSION = 'v20.0';
const POLL_INTERVAL = 2000;
const MAX_POLLS = 15;

/* ----------------------------------------
   Helpers
---------------------------------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForMediaReady = async (mediaId, accessToken) => {
  let attempts = 0;

  while (attempts < MAX_POLLS) {
    const res = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`,
      {
        params: {
          fields: 'status_code',
          access_token: accessToken,
        },
      }
    );

    const status = res.data.status_code;

    if (status === 'FINISHED') return;
    if (status === 'ERROR') {
      throw new Error(`Instagram media ${mediaId} failed processing`);
    }

    attempts++;
    await sleep(POLL_INTERVAL);
  }

  throw new Error(`Instagram media ${mediaId} processing timeout`);
};

/* ----------------------------------------
   OAuth: Start Instagram Auth
---------------------------------------- */
const startInstagramAuth = (req, res) => {
  const { workspaceId } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.INSTAGRAM_CALLBACK_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Instagram OAuth not configured' });
  }

  const scope = [
    'pages_show_list',
    'instagram_basic',
    'instagram_manage_insights',
    'pages_read_engagement',
    'pages_manage_engagement',
    'instagram_content_publish',
    'business_management',
  ].join(',');

  const statePayload = Buffer.from(
    JSON.stringify({ workspaceId, t: Date.now() })
  ).toString('base64');

  const authUrl =
    `https://www.facebook.com/v18.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(statePayload)}` +
    `&scope=${encodeURIComponent(scope)}`;

  return res.json({ redirectUrl: authUrl });
};

/* ----------------------------------------
   OAuth Callback
---------------------------------------- */
const instagramCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  let workspaceId;
  try {
    const decoded = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8')
    );
    workspaceId = Number(decoded.workspaceId);
  } catch {
    return res.status(400).json({ error: 'Invalid state' });
  }

  try {
    /* 1️⃣ Exchange code → user access token */
    const tokenRes = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.INSTAGRAM_CALLBACK_URI,
          code,
        },
      }
    );

    const userAccessToken = tokenRes.data.access_token;

    /* 2️⃣ Get Pages */
    const pagesRes = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        headers: { Authorization: `Bearer ${userAccessToken}` },
      }
    );

    const pages = pagesRes.data.data || [];
    if (!pages.length) {
      return res.status(400).json({ error: 'No Facebook Pages found' });
    }

    /* 3️⃣ Find IG Business Account */
    let igAccountData = null;
    let pageAccessToken = null;

    for (const page of pages) {
      const igRes = await axios.get(
        `https://graph.facebook.com/v18.0/${page.id}`,
        {
          params: {
            fields: 'instagram_business_account',
            access_token: page.access_token,
          },
        }
      );

      if (igRes.data.instagram_business_account) {
        igAccountData = igRes.data.instagram_business_account;
        pageAccessToken = page.access_token;
        break;
      }
    }

    if (!igAccountData) {
      return res
        .status(400)
        .json({ error: 'No Instagram Business account linked' });
    }

    /* 4️⃣ Fetch IG profile */
    const profileRes = await axios.get(
      `https://graph.facebook.com/v18.0/${igAccountData.id}`,
      {
        params: {
          fields: 'username,profile_picture_url',
          access_token: pageAccessToken,
        },
      }
    );

    const igUserId = igAccountData.id;
    const username = profileRes.data.username;
    const profileUrl = `https://instagram.com/${username}`;

    /* 5️⃣ Upsert Account */
    let instagramAccount = await InstagramAccount.findOne({
      where: { instagram_user_id: igUserId },
      include: [{ model: Account }],
    });

    let account;

    if (instagramAccount) {
      account = instagramAccount.Account;

      if (Number(account.workspace_id) !== Number(workspaceId)) {
        return res
          .status(403)
          .json({ error: 'Instagram account already linked elsewhere' });
      }

      await instagramAccount.update({
        access_token: pageAccessToken,
        profile_url: profileUrl,
      });
    } else {
      account = await Account.create({
        workspace_id: workspaceId,
        platform: 'Instagram',
        account_name: username,
        account_url: profileUrl,
      });

      instagramAccount = await InstagramAccount.create({
        account_id: account.account_id,
        instagram_user_id: igUserId,
        access_token: pageAccessToken,
        profile_url: profileUrl,
      });
    }

    const clientAppUrl =
      process.env.CLIENT_APP_URL || 'http://localhost:3000';

    return res.redirect(`${clientAppUrl}/dashboard?connected=instagram`);
  } catch (err) {
    console.error('[Instagram OAuth]', err.response?.data || err.message);
    res.status(500).json({ error: 'Instagram OAuth failed' });
  }
};

/* ----------------------------------------
   Post to Instagram
---------------------------------------- */
const postToInstagram = async ({ accountId, text, mediaUrls }) => {
  const igAccount = await InstagramAccount.findOne({
    where: { account_id: accountId },
  });

  if (!igAccount) throw new Error('Instagram account not found');

  const igUserId = igAccount.instagram_user_id;
  const accessToken = igAccount.access_token;

  if (!mediaUrls || !mediaUrls.length) {
    throw new Error('mediaUrls is required');
  }

  /* ----------------------------------------
     SINGLE IMAGE POST
  ---------------------------------------- */
  if (mediaUrls.length === 1) {
    const containerRes = await axios.post(
      `https://graph.facebook.com/v20.0/${igUserId}/media`,
      {
        image_url: mediaUrls[0],
        caption: text,
        access_token: accessToken,
      }
    );

    const creationId = containerRes.data.id;

    let status = 'IN_PROGRESS';
    while (status === 'IN_PROGRESS') {
      await new Promise((r) => setTimeout(r, 2000));

      const statusRes = await axios.get(
        `https://graph.facebook.com/v20.0/${creationId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken,
          },
        }
      );

      status = statusRes.data.status_code;

      if (status === 'ERROR') {
        throw new Error('Instagram media processing failed');
      }
    }

    const publishRes = await axios.post(
      `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
      {
        creation_id: creationId,
        access_token: accessToken,
      }
    );

    return {
      platformPostId: publishRes.data.id,
      type: 'single',
    };
  }

  /* ----------------------------------------
     CAROUSEL POST (2–10 images)
  ---------------------------------------- */
  if (mediaUrls.length < 2 || mediaUrls.length > 10) {
    throw new Error('Instagram carousel requires 2–10 images');
  }

  const childrenIds = [];

  // 1️⃣ Create child containers
  for (const imageUrl of mediaUrls) {
    const res = await axios.post(
      `https://graph.facebook.com/v20.0/${igUserId}/media`,
      {
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: accessToken,
      }
    );

    childrenIds.push(res.data.id);
  }

  // 2️⃣ Wait for each child
  for (const childId of childrenIds) {
    let status = 'IN_PROGRESS';

    while (status === 'IN_PROGRESS') {
      await new Promise((r) => setTimeout(r, 2000));

      const statusRes = await axios.get(
        `https://graph.facebook.com/v20.0/${childId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken,
          },
        }
      );

      status = statusRes.data.status_code;

      if (status === 'ERROR') {
        throw new Error('Instagram carousel item processing failed');
      }
    }
  }

  // 3️⃣ Create carousel container
  const carouselRes = await axios.post(
    `https://graph.facebook.com/v20.0/${igUserId}/media`,
    {
      media_type: 'CAROUSEL',
      children: childrenIds.join(','),
      caption: text,
      access_token: accessToken,
    }
  );

  const carouselId = carouselRes.data.id;

  // 4️⃣ Wait for carousel container
  let status = 'IN_PROGRESS';
  while (status === 'IN_PROGRESS') {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await axios.get(
      `https://graph.facebook.com/v20.0/${carouselId}`,
      {
        params: {
          fields: 'status_code',
          access_token: accessToken,
        },
      }
    );

    status = statusRes.data.status_code;

    if (status === 'ERROR') {
      throw new Error('Instagram carousel processing failed');
    }
  }

  // 5️⃣ Publish carousel
  const publishRes = await axios.post(
    `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
    {
      creation_id: carouselId,
      access_token: accessToken,
    }
  );

  return {
    platformPostId: publishRes.data.id,
    type: 'carousel',
    items: mediaUrls.length,
  };
};


/* ----------------------------------------
   Fetch Instagram Insights
---------------------------------------- */
const fetchInstagramInsights = async () => {
  const accounts = await InstagramAccount.findAll();

  for (const ig of accounts) {
    const posts = await Post.findAll({
      where: {
        account_id: ig.account_id,
        status: 'posted',
      },
      attributes: ['post_id', 'post_platform_id'],
    });

    for (const post of posts) {
      try {
        if (!post.post_platform_id) continue;

        const res = await axios.get(
          `https://graph.facebook.com/${GRAPH_VERSION}/${post.post_platform_id}/insights`,
          {
            params: {
              // ✅ impressions removed from v22+
              metric: 'reach,likes,comments,saved,shares,total_interactions',
              access_token: ig.access_token,
            },
          }
        );
        console.log('[Instagram Insights]', res.data.data);
        const metric = (name) =>
          res.data.data.find((m) => m.name === name)?.values?.[0]?.value || 0;

        await PostInsight.upsert({
          post_id: post.post_id,
          platform: 'instagram',
          post_platform_id: post.post_platform_id,

          // ✅ use reach instead of impressions
          impressions: metric('reach'),

          likes: metric('likes'),
          comments: metric('comments'),

          // ✅ keep your schema:
          shares: metric('shares') || metric('saved'), // fallback if shares not supported
          captured_at: new Date().setHours(0, 0, 0, 0),
        });
      } catch (err) {
        console.error(
          '[Instagram Insights]',
          post.post_id,
          err.response?.data || err.message
        );
      }
    }
  }
};

const fetchInstagramInsightsTest = async () => {
  const accounts = await InstagramAccount.findAll();
  if (!accounts.length) return;

  for (const ig of accounts) {
    const posts = await Post.findAll({
      where: {
        account_id: ig.account_id,
        status: 'posted',
      },
      attributes: ['post_id', 'post_platform_id'],
    });

    if (!posts.length) continue;

    for (const post of posts) {
      try {
        if (!post.post_platform_id) continue;

        const res = await axios.get(
          `https://graph.facebook.com/${GRAPH_VERSION}/${post.post_platform_id}/insights`,
          {
            params: {
              // ✅ impressions removed from v22+
              metric: 'reach,likes,comments,saved,shares,total_interactions',
              access_token: ig.access_token,
            },
          }
        );

        const metric = (name) =>
          res.data.data.find((m) => m.name === name)?.values?.[0]?.value || 0;

        const insightData = {
          post_id: post.post_id,
          platform: 'instagram',
          post_platform_id: post.post_platform_id,

          // ✅ using reach instead of impressions
          impressions: metric('reach'),
          likes: metric('likes'),
          comments: metric('comments'),
          shares: metric('shares') || metric('saved'), // fallback
          captured_at: new Date().setHours(0, 0, 0, 0),

          // keep raw for debugging
          raw: res.data.data,
        };

        console.log('==============================');
        console.log('[Instagram Insights - TEST]');
        console.log('IG Account:', ig.account_id);
        console.log('Post:', post.post_id, '| Platform ID:', post.post_platform_id);
        console.log('Insight Data:', insightData);
        console.log('==============================\n');
      } catch (err) {
        console.error('[Instagram Insights - TEST ERROR]', {
          accountId: ig.account_id,
          post_id: post.post_id,
          post_platform_id: post.post_platform_id,
          error: err.response?.data || err.message,
        });
      }
    }
  }
};



module.exports = {
  startInstagramAuth,
  instagramCallback,
  postToInstagram,
  fetchInstagramInsights,
  fetchInstagramInsightsTest,
};
