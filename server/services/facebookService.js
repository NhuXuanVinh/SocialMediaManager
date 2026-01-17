
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { FacebookAccount, PostInsight, Post } = require('../models');
const { Account } = require('../models');
require('dotenv').config();

const startFacebookAuth = (req, res) => {
  const { workspaceId } = req.body;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }
	const clientId = process.env.FACEBOOK_APP_ID;
	const redirectUri = process.env.FACEBOOK_CALLBACK_URI;
	if (!clientId || !redirectUri) {
		return res.status(500).json({ error: 'Facebook OAuth not configured' });
	}
	const scope = [
		'pages_manage_posts',
		'pages_read_engagement',
		'pages_show_list',
		'pages_read_user_content',
	].join(',');
	const statePayload = Buffer.from(JSON.stringify({ workspaceId, t: Date.now() })).toString('base64');
	const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(statePayload)}&scope=${encodeURIComponent(scope)}`;
	return res.json({ redirectUrl: authUrl });
};

const facebookCallback = async (req, res) => {
	const { code, state } = req.query;
	if (!code || !state) {
		return res.status(400).json({ error: 'Missing code or state' });
	}
	let workspaceId = null;
	try {
		const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
		workspaceId = Number(decoded.workspaceId);
	} catch (e) {
		return res.status(400).json({ error: 'Invalid state' });
	}
	try {
		const tokenResponse = await axios.get('https://graph.facebook.com/v12.0/oauth/access_token', {
			params: {
				client_id: process.env.FACEBOOK_APP_ID,
				client_secret: process.env.FACEBOOK_APP_SECRET,
				redirect_uri: process.env.FACEBOOK_CALLBACK_URI,
				code,
			},
		});
		const userAccessToken = tokenResponse.data.access_token;

    const permRes = await axios.get('https://graph.facebook.com/v12.0/me/permissions', {
  params: { access_token: userAccessToken },
});
console.log("=== FB /me/permissions ===");
console.log(JSON.stringify(permRes.data, null, 2));

// ✅ 2) Debug token scopes
const debugRes = await axios.get('https://graph.facebook.com/debug_token', {
  params: {
    input_token: userAccessToken,
    access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
  },
});
console.log("=== FB debug_token ===");
console.log(JSON.stringify(debugRes.data, null, 2));

		const accountsResponse = await axios.get('https://graph.facebook.com/v12.0/me/accounts', {
			headers: { Authorization: `Bearer ${userAccessToken}` },
		});
		const pages = accountsResponse.data.data || [];
		if (pages.length === 0) {
			return res.status(400).json({ error: 'No Facebook Pages found for this user' });
		}

const page = pages[0];
const pageId = page.id;
const pageName = page.name;
const pageAccessToken = page.access_token;
const profileUrl = `https://www.facebook.com/${pageId}`;

// 1️⃣ Check if this Facebook Page is already linked
let facebookAccount = await FacebookAccount.findOne({
  where: { facebook_user_id: pageId },
  include: [{ model: Account }],
});

let account;

if (facebookAccount) {
  // 2️⃣ Update existing account
  account = facebookAccount.Account;
	// Safety check: ensure same workspace
	if (Number(account.workspace_id) !== Number(workspaceId)) {
    console.log(account.workspace_id, workspaceId);
		return res.status(403).json({
		error: 'This Facebook Page is already linked to another user',
		});
	}

  // Update account info
  await account.update({
    account_name: pageName,
    account_url: profileUrl,
  });

  // Update Facebook token
  await facebookAccount.update({
    access_token: pageAccessToken,
    profile_url: profileUrl,
  });

} else {
  // 3️⃣ Create new account
  account = await Account.create({
    workspace_id: workspaceId,
    platform: 'Facebook',
    account_name: pageName,
    account_url: profileUrl,
  });

  facebookAccount = await FacebookAccount.create({
    account_id: account.account_id,
    facebook_user_id: pageId,
    access_token: pageAccessToken,
    profile_url: profileUrl,
  });
}


		const clientAppUrl = process.env.CLIENT_APP_URL||'http://localhost:3000';
		if (clientAppUrl) {
			return res.redirect(`${clientAppUrl}/dashboard?connected=facebook`);
		}
		return res.json({ message: 'Facebook Page successfully linked!', account });
	} catch (err) {
		console.error('Facebook OAuth error:', err.response?.data || err.message);
		return res.status(500).json({ error: 'Facebook OAuth failed' });
	}
};

// Route to handle posting to Facebook page
const postToFacebook = async ({ accountId, text, mediaUrls = [] }) => {
  const facebookAccount = await FacebookAccount.findOne({
    where: { account_id: accountId },
  });

  if (!facebookAccount) throw new Error('Facebook account not found');

  const pageId = facebookAccount.facebook_user_id;
  const accessToken = facebookAccount.access_token;

  const photoIds = [];

  for (const url of mediaUrls) {
    const photoRes = await axios.post(
      `https://graph.facebook.com/v12.0/${pageId}/photos`,
      {
        url,
        published: false,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    photoIds.push(photoRes.data.id);
  }

  const postResponse = await axios.post(
    `https://graph.facebook.com/v12.0/${pageId}/feed`,
    {
      message: text,
      attached_media: photoIds.map((id) => ({ media_fbid: id })),
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return {
    platformPostId: postResponse.data.id,
    postLink: `https://www.facebook.com/${postResponse.data.id}`,
  };
};



const fetchFacebookInsights = async () => {
  try {
    const facebookAccounts = await FacebookAccount.findAll();
    if (!facebookAccounts.length) return [];

    for (const facebookAccount of facebookAccounts) {
      try {
        const posts = await Post.findAll({
          where: {
            account_id: facebookAccount.account_id,
            status: 'posted',
          },
          attributes: ['post_id', 'post_platform_id'],
        });

        if (!posts.length) continue;

        // ⚠️ 2 calls per post → max 25 posts per batch
        const BATCH_LIMIT = 25;

        for (let i = 0; i < posts.length; i += BATCH_LIMIT) {
          const batchPosts = posts.slice(i, i + BATCH_LIMIT);

          const batch = batchPosts.flatMap(post => ([
            // 1️⃣ Insights → impressions + reactions
            {
              method: 'GET',
              relative_url:
                `${post.post_platform_id}/insights` +
                `?metric=post_reactions_by_type_total,post_impressions_unique`,
            },
            // 2️⃣ Fields → comments + shares
            {
              method: 'GET',
              relative_url:
                `${post.post_platform_id}?fields=comments.summary(true),shares`,
            },
          ]));

          const response = await axios.post(
            'https://graph.facebook.com/v18.0',
            {
              access_token: facebookAccount.access_token,
              batch,
            }
          );

          // Each post = 2 responses
          for (let j = 0; j < response.data.length; j += 2) {
            const insightsRes = response.data[j];
            const fieldsRes = response.data[j + 1];
            const post = batchPosts[j / 2];

            if (!insightsRes.body || !post) continue;

            const insightsBody = JSON.parse(insightsRes.body);
            const fieldsBody = fieldsRes.body
              ? JSON.parse(fieldsRes.body)
              : {};

            const getMetric = (name) =>
              insightsBody.data?.find(m => m.name === name)
                ?.values?.[0]?.value ?? 0;

            // Likes
            const reactions = getMetric('post_reactions_by_type_total');
            const likes =
              typeof reactions === 'object'
                ? Object.values(reactions).reduce((a, b) => a + b, 0)
                : reactions;

            // Impressions
            const impressions = getMetric('post_impressions_unique');

            // Comments & shares
            const comments =
              fieldsBody.comments?.summary?.total_count ?? 0;

            const shares =
              fieldsBody.shares?.count ?? 0;

            await PostInsight.upsert({
              post_id: post.post_id,
              platform: 'facebook',
              post_platform_id: post.post_platform_id,
              impressions,
              likes,
              comments,
              shares,
              captured_at: new Date().setHours(0, 0, 0, 0),
            });
          }
        }
      } catch (accountError) {
        console.error('[Facebook Insights] Account failed', {
          accountId: facebookAccount.account_id,
          error: accountError.message,
        });
      }
    }
  } catch (fatalError) {
    console.error('[Facebook Insights] Fatal error', fatalError.message);
    throw fatalError;
  }
};


module.exports = {
	postToFacebook,
    fetchFacebookInsights,
	startFacebookAuth,
	facebookCallback,
}


